import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

// GET /api/payments/status?paymentId=xxx
export async function GET(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const paymentId = new URL(request.url).searchParams.get('paymentId');
  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, candidateId },
      select: {
        id: true,
        status: true,
        amount: true,
        itemType: true,
        providerTxId: true,
        failureReason: true,
        completedAt: true,
        createdAt: true,
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // If still pending and expired, mark as expired
    if (payment.status === 'PENDING' && payment.createdAt) {
      const tenMin = 10 * 60 * 1000;
      if (Date.now() - payment.createdAt.getTime() > tenMin) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'EXPIRED', failureReason: 'STK Push timed out' },
        });
        payment.status = 'EXPIRED';
      }
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
      amount: payment.amount,
      itemType: payment.itemType,
      receiptNumber: payment.providerTxId,
      failureReason: payment.failureReason,
      completedAt: payment.completedAt,
    });
  } catch (error) {
    console.error('[payments/status] error:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}