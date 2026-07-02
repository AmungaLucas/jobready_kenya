import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCallback } from '@/lib/mpesa';

/**
 * POST /api/payments/callback
 *
 * M-Pesa Daraja STK Push callback endpoint.
 * MUST be registered in Daraja dashboard as the CallBackURL.
 * This endpoint must be publicly accessible (no auth).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback = parseCallback(body);

    if (!callback) {
      console.error('[payments/callback] Invalid callback format:', JSON.stringify(body).slice(0, 500));
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback' });
    }

    console.log(`[payments/callback] checkoutId=${callback.checkoutRequestId} code=${callback.resultCode}`);

    // Find payment by checkout request ID
    const payment = await prisma.payment.findUnique({
      where: { mpesaCheckoutId: callback.checkoutRequestId },
    });

    if (!payment) {
      console.warn(`[payments/callback] No payment found for checkoutId: ${callback.checkoutRequestId}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Don't process already-completed payments
    if (payment.status === 'COMPLETED') {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Already processed' });
    }

    if (callback.resultCode === '0') {
      // ─── SUCCESS ────────────────────────────────────
      await prisma.$transaction(async (tx) => {
        // Update payment
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            providerTxId: callback.mpesaReceiptNumber,
            completedAt: new Date(),
            mpesaCallbackRaw: JSON.stringify(body),
          },
        });

        // Activate subscription if payment was for one
        if (payment.itemType === 'SUBSCRIPTION') {
          const existingSub = await tx.subscription.findUnique({
            where: { candidateId: payment.candidateId },
          });

          const tier = (existingSub?.tier as string) || 'BASIC_PREMIUM';
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 1); // 1 month from now

          await tx.subscription.upsert({
            where: { candidateId: payment.candidateId },
            create: {
              candidateId: payment.candidateId,
              tier: tier as 'BASIC_PREMIUM' | 'PRO_PREMIUM',
              status: 'ACTIVE',
              amount: payment.amount,
              startsAt: new Date(),
              expiresAt,
              paymentId: payment.id,
            },
            update: {
              status: 'ACTIVE',
              expiresAt,
              paymentId: payment.id,
              cancelledAt: null,
            },
          });
        }

        // Activate premium purchase if payment was for one
        if (payment.itemType === 'PRIORITY_APPLICATION' || payment.itemType === 'CV_REVIEW') {
          await tx.premiumPurchase.updateMany({
            where: {
              candidateId: payment.candidateId,
              paymentId: payment.id,
              status: 'PENDING',
            },
            data: { status: 'COMPLETED' },
          });
        }
      });

      console.log(`[payments/callback] Payment ${payment.id} COMPLETED — ${callback.mpesaReceiptNumber}`);
    } else {
      // ─── FAILURE (user cancelled, insufficient funds, timeout) ──
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: callback.resultCode === '1032' ? 'CANCELLED' : 'FAILED',
            failureReason: callback.resultDesc,
            mpesaCallbackRaw: JSON.stringify(body),
          },
        });

        // Fail any linked purchases
        await tx.premiumPurchase.updateMany({
          where: { paymentId: payment.id, status: 'PENDING' },
          data: { status: 'FAILED' },
        });

        // Revert subscription to expired if it was waiting on this payment
        if (payment.itemType === 'SUBSCRIPTION') {
          const sub = await tx.subscription.findUnique({
            where: { candidateId: payment.candidateId },
          });
          if (sub && sub.status === 'PAST_DUE') {
            await tx.subscription.update({
              where: { candidateId: payment.candidateId },
              data: { status: 'EXPIRED', cancelledAt: new Date() },
            });
          }
        }
      });

      console.log(`[payments/callback] Payment ${payment.id} ${callback.resultCode} — ${callback.resultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('[payments/callback] Unhandled error:', error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Internal error' });
  }
}