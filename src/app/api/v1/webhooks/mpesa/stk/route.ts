import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCallback } from '@/lib/mpesa';

/**
 * POST /api/v1/webhooks/mpesa/stk
 *
 * M-Pesa Daraja STK Push callback — registered in Daraja dashboard.
 * URL: https://api.jobready.co.ke/api/v1/webhooks/mpesa/stk
 *
 * CRITICAL: This endpoint MUST be publicly accessible (no auth).
 * M-Pesa servers call this directly — no session/cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const callback = parseCallback(body);

    if (!callback) {
      console.error('[mpesa/stk] Invalid callback format:', JSON.stringify(body).slice(0, 500));
      // Always return 200 to M-Pesa to prevent retries
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback' });
    }

    console.log(`[mpesa/stk] checkoutId=${callback.checkoutRequestId} code=${callback.resultCode} desc=${callback.resultDesc}`);

    // Find payment by checkout request ID
    const payment = await prisma.payment.findUnique({
      where: { mpesaCheckoutId: callback.checkoutRequestId },
    });

    if (!payment) {
      console.warn(`[mpesa/stk] No payment found for checkoutId: ${callback.checkoutRequestId}`);
      // Return 200 to M-Pesa — we'll handle orphan callbacks via logs
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Don't reprocess already-completed payments (idempotent)
    if (payment.status === 'COMPLETED') {
      console.log(`[mpesa/stk] Payment ${payment.id} already COMPLETED — skipping`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Already processed' });
    }

    if (callback.resultCode === '0') {
      // ─── SUCCESS ────────────────────────────────────
      await prisma.$transaction(async (tx) => {
        // Update payment record
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

          console.log(`[mpesa/stk] Subscription activated for candidate ${payment.candidateId} — tier=${tier} expires=${expiresAt.toISOString()}`);
        }

        // Activate premium purchase if payment was for one
        if (payment.itemType === 'PRIORITY_APPLICATION' || payment.itemType === 'CV_REVIEW') {
          const result = await tx.premiumPurchase.updateMany({
            where: {
              candidateId: payment.candidateId,
              paymentId: payment.id,
              status: 'PENDING',
            },
            data: { status: 'COMPLETED' },
          });
          console.log(`[mpesa/stk] ${result.count} premium purchase(s) activated for candidate ${payment.candidateId}`);
        }
      });

      console.log(`[mpesa/stk] Payment ${payment.id} COMPLETED — receipt=${callback.mpesaReceiptNumber}`);
    } else {
      // ─── FAILURE (user cancelled, insufficient funds, timeout) ──
      const failStatus = callback.resultCode === '1032' ? 'CANCELLED' : 'FAILED';

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: failStatus,
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

      console.log(`[mpesa/stk] Payment ${payment.id} ${failStatus} — code=${callback.resultCode} desc=${callback.resultDesc}`);
    }

    // Always return 200 to M-Pesa
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('[mpesa/stk] Unhandled error:', error);
    // Still return 200 to prevent M-Pesa retries that could cause duplicates
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}