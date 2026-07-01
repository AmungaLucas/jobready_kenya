import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';
import { initiateB2CPayout } from '@/lib/mpesa/b2c';
import { normalizePhoneNumber } from '@/lib/mpesa';

const withdrawSchema = z.object({
  phoneNumber: z.string().min(7).max(20),
  amount: z.number().int().min(1),
});

// POST /api/candidates/me/withdraw — request withdrawal
export async function POST(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  if (!process.env.MPESA_SECURITY_CREDENTIAL) {
    return NextResponse.json({ error: 'Withdrawal system is not configured yet' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const parsed = withdrawSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
    }

    const { phoneNumber, amount } = parsed.data;

    // Normalize phone
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneNumber(phoneNumber);
    } catch {
      return NextResponse.json({ error: 'Invalid Kenyan phone number' }, { status: 400 });
    }

    // Check wallet
    const wallet = await prisma.wallet.findUnique({ where: { candidateId } });
    if (!wallet) {
      return NextResponse.json({ error: 'No wallet found' }, { status: 404 });
    }

    if (amount > wallet.availableBalance) {
      return NextResponse.json({ error: `Insufficient balance. Available: KES ${wallet.availableBalance}` }, { status: 400 });
    }

    if (amount < wallet.minimumWithdrawal) {
      return NextResponse.json({ error: `Minimum withdrawal is KES ${wallet.minimumWithdrawal}` }, { status: 400 });
    }

    // Check for existing pending withdrawal
    const existingPending = await prisma.withdrawal.count({
      where: { candidateId, status: { in: ['PENDING', 'PROCESSING'] } },
    });
    if (existingPending > 0) {
      return NextResponse.json({ error: 'You already have a pending withdrawal' }, { status: 409 });
    }

    // Initiate B2C payout
    const reference = `WD-${Date.now().toString(36).toUpperCase()}`;
    const b2cResult = await initiateB2CPayout({
      phoneNumber: normalizedPhone,
      amount,
      reference,
      remarks: `JobReady Referral Withdrawal ${reference}`,
    });

    if (!b2cResult.success) {
      console.error(`[withdraw] B2C failed: ${b2cResult.errorMessage}`);
      return NextResponse.json(
        { error: b2cResult.errorMessage || 'M-Pesa payout failed. Try again later.' },
        { status: 502 }
      );
    }

    // Create withdrawal record
    await prisma.withdrawal.create({
      data: {
        candidateId,
        amount,
        phoneNumber: normalizedPhone,
        status: 'PROCESSING',
        conversationId: b2cResult.originatorConversationId,
      },
    });

    // Deduct from available balance
    const newBalance = wallet.availableBalance - amount;
    await prisma.wallet.update({
      where: { candidateId },
      data: { availableBalance: newBalance },
    });

    // Debit ledger transaction
    await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type: 'DEBIT',
        amount,
        balanceAfter: newBalance,
        reference: null, // Will be linked after B2C callback
        description: `Withdrawal to ${normalizedPhone} (${reference})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal initiated! Check your M-Pesa shortly.',
      amount,
      reference,
    });
  } catch (error) {
    console.error('[withdraw] POST error:', error);
    const message = error instanceof Error ? error.message : 'Withdrawal failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}