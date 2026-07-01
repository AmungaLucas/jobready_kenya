import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';
import { generateReferralCode } from '@/lib/services/commission';

// GET /api/candidates/me/referrals — referral stats + list
export async function GET(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { referralCode: true },
    });

    const [referrals, wallet, totalCommissions] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: candidateId },
        include: {
          referred: { select: { firstName: true, lastName: true, createdAt: true } },
          commissions: {
            select: { amountPaid: true, commissionAmount: true, status: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.wallet.findUnique({
        where: { candidateId },
      }),
      prisma.referralCommission.groupBy({
        by: ['status'],
        where: { referral: { referrerId: candidateId } },
        _sum: { commissionAmount: true, amountPaid: true },
        _count: true,
      }),
    ]);

    const activeReferralCount = referrals.filter(
      (r) => r.status === 'ACTIVE' || r.status === 'REWARDED'
    ).length;

    // Determine current tier
    let currentPercent = 10;
    if (activeReferralCount >= 15) currentPercent = 15;
    else if (activeReferralCount >= 5) currentPercent = 12;

    const totalEarned = totalCommissions.reduce((sum, t) => sum + (t._sum.commissionAmount || 0), 0);
    const pendingCommission = totalCommissions.find((t) => t.status === 'PENDING')?._sum.commissionAmount || 0;

    return NextResponse.json({
      referralCode: candidate?.referralCode || null,
      referralLink: candidate?.referralCode
        ? `https://jobboard.ke/register?ref=${candidate.referralCode}`
        : null,
      stats: {
        totalReferrals: referrals.length,
        activeReferrals: activeReferralCount,
        currentCommissionPercent: currentPercent,
        totalEarned,
        pendingCommission,
      },
      wallet: wallet
        ? {
            availableBalance: wallet.availableBalance,
            pendingBalance: wallet.pendingBalance,
            totalEarned: wallet.totalEarned,
            totalWithdrawn: wallet.totalWithdrawn,
            minimumWithdrawal: wallet.minimumWithdrawal,
          }
        : null,
      referrals: referrals.map((r) => ({
        id: r.id,
        status: r.status,
        createdAt: r.createdAt,
        referredName: r.referred
          ? `${r.referred.firstName || ''} ${r.referred.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown',
        referredAt: r.referred?.createdAt || null,
        firstPaymentAt: r.firstPaymentAt,
        commissions: r.commissions,
      })),
    });
  } catch (error) {
    console.error('[referrals] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch referrals' }, { status: 500 });
  }
}

// POST /api/candidates/me/referrals — generate referral code
export async function POST(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: { referralCode: true },
    });

    if (candidate?.referralCode) {
      return NextResponse.json({
        referralCode: candidate.referralCode,
        referralLink: `https://jobboard.ke/register?ref=${candidate.referralCode}`,
        message: 'You already have a referral code',
      });
    }

    // Generate unique code
    let code = generateReferralCode();
    let attempts = 0;
    while (await prisma.candidate.findUnique({ where: { referralCode: code } })) {
      code = generateReferralCode();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json({ error: 'Could not generate unique code' }, { status: 500 });
      }
    }

    await prisma.candidate.update({
      where: { id: candidateId },
      data: { referralCode: code },
    });

    return NextResponse.json({
      referralCode: code,
      referralLink: `https://jobboard.ke/register?ref=${code}`,
      message: 'Referral code generated!',
    });
  } catch (error) {
    console.error('[referrals] POST error:', error);
    return NextResponse.json({ error: 'Failed to generate referral code' }, { status: 500 });
  }
}