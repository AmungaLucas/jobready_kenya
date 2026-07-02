import { prisma } from '@/lib/prisma';

// ─── Constants ──────────────────────────────────────────────────

const COMMISSION_COOLDOWN_MS = 48 * 60 * 60 * 1000; // 48 hours
const MINIMUM_WITHDRAWAL = 1000; // KES

// Default commission tiers (can be overridden via DB CommissionTier)
const DEFAULT_TIERS = [
  { minReferrals: 0,  percent: 10 },   // 1-4 referrals → 10%
  { minReferrals: 5,  percent: 12 },   // 5-14 referrals → 12%
  { minReferrals: 15, percent: 15 },   // 15+ referrals → 15%
] as const;

// ─── Commission Calculation ─────────────────────────────────────

/**
 * Get the commission percentage for a referrer based on how many
 * of their referred users have made at least one successful payment.
 */
async function getCommissionRate(referrerId: string): Promise<number> {
  const activeReferralCount = await prisma.referral.count({
    where: {
      referrerId,
      status: { in: ['ACTIVE', 'REWARDED'] },
    },
  });

  // Check DB for custom tiers first
  const dbTiers = await prisma.commissionTier.findMany({
    where: { isActive: true },
    orderBy: { minReferrals: 'desc' },
  });

  if (dbTiers.length > 0) {
    for (const tier of dbTiers) {
      if (activeReferralCount >= tier.minReferrals) {
        return tier.commissionPercent;
      }
    }
    return dbTiers[dbTiers.length - 1].commissionPercent;
  }

  // Use default tiers
  for (let i = DEFAULT_TIERS.length - 1; i >= 0; i--) {
    if (activeReferralCount >= DEFAULT_TIERS[i].minReferrals) {
      return DEFAULT_TIERS[i].percent;
    }
  }
  return DEFAULT_TIERS[0].percent;
}

// ─── Main: Process Commission on Payment ────────────────────────

/**
 * Called when a payment succeeds. Checks if the payer was referred
 * and credits commission to the referrer's wallet (with 48h cooldown).
 */
export async function processReferralCommission(paymentId: string): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    select: { candidateId: true, amount: true, itemType: true },
  });

  if (!payment || payment.status !== 'COMPLETED') return;

  // Find if this candidate was referred
  const activeReferral = await prisma.referral.findFirst({
    where: {
      referredId: payment.candidateId,
      status: { in: ['PENDING', 'ACTIVE', 'REWARDED'] },
    },
  });

  if (!activeReferral) return;

  const { referrerId, id: referralId } = activeReferral;

  // Prevent self-referral fraud
  if (referrerId === payment.candidateId) {
    await prisma.referral.update({
      where: { id: referralId },
      data: { status: 'DISQUALIFIED' },
    });
    return;
  }

  // Check for duplicate commission on this payment
  const existingCommission = await prisma.referralCommission.findUnique({
    where: { referralId_paymentId: { referralId, paymentId } },
  });
  if (existingCommission) return;

  // Get commission rate
  const commissionPercent = await getCommissionRate(referrerId);
  const commissionAmount = Math.round(payment.amount * commissionPercent / 100);
  if (commissionAmount < 1) return;

  const cooldownEndsAt = new Date(Date.now() + COMMISSION_COOLDOWN_MS);

  // Create commission record (PENDING = within cooldown)
  await prisma.referralCommission.create({
    data: {
      referralId,
      paymentId,
      amountPaid: payment.amount,
      commissionPercent,
      commissionAmount,
      status: 'PENDING',
      cooldownEndsAt,
    },
  });

  // Update referral status
  const updateData: Record<string, unknown> = { status: 'REWARDED' };
  if (activeReferral.status === 'PENDING') {
    Object.assign(updateData, { status: 'ACTIVE', firstPaymentAt: new Date() });
  }
  await prisma.referral.update({ where: { id: referralId }, data: updateData });

  // Update wallet pending balance
  await prisma.wallet.upsert({
    where: { candidateId: referrerId },
    create: {
      candidateId: referrerId,
      pendingBalance: commissionAmount,
      totalEarned: commissionAmount,
      minimumWithdrawal: MINIMUM_WITHDRAWAL,
    },
    update: {
      pendingBalance: { increment: commissionAmount },
      totalEarned: { increment: commissionAmount },
    },
  });

  console.log(
    `[commission] KES ${commissionAmount} (${commissionPercent}%) pending for referrer ${referrerId} from payment ${paymentId}`
  );
}

// ─── Cooldown Credit Job ────────────────────────────────────────

/**
 * Move commissions past their cooldown from PENDING → CREDITED
 * and transfer from pendingBalance to availableBalance.
 * Call from a cron job every 15 minutes.
 */
export async function creditMaturedCommissions(): Promise<number> {
  const now = new Date();

  const matured = await prisma.referralCommission.findMany({
    where: { status: 'PENDING', cooldownEndsAt: { lte: now } },
  });

  if (matured.length === 0) return 0;

  let credited = 0;

  for (const commission of matured) {
    const referral = await prisma.referral.findUnique({
      where: { id: commission.referralId },
      select: { referrerId: true },
    });
    if (!referral) continue;

    await prisma.referralCommission.update({
      where: { id: commission.id },
      data: { status: 'CREDITED', creditedAt: now },
    });

    const wallet = await prisma.wallet.findUnique({
      where: { candidateId: referral.referrerId },
    });

    if (wallet) {
      const newAvailable = wallet.availableBalance + commission.commissionAmount;
      const newPending = Math.max(0, wallet.pendingBalance - commission.commissionAmount);

      await prisma.wallet.update({
        where: { candidateId: referral.referrerId },
        data: { availableBalance: newAvailable, pendingBalance: newPending },
      });

      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CREDIT',
          amount: commission.commissionAmount,
          balanceAfter: newAvailable,
          reference: commission.id,
          description: `Commission from referred user payment (KES ${commission.amountPaid})`,
        },
      });
    }

    credited++;
  }

  if (credited > 0) {
    console.log(`[commission] Credited ${credited} matured commissions`);
  }

  return credited;
}

// ─── Referral Code Generation ───────────────────────────────────

export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}