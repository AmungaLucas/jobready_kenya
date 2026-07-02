import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';
import { initiateSTKPush, normalizePhoneNumber, PRICING } from '@/lib/mpesa';

const initiateSchema = z.object({
  phoneNumber: z.string().min(7).max(20),
  itemType: z.enum(['SUBSCRIPTION', 'PRIORITY_APPLICATION', 'CV_REVIEW']),
  tier: z.enum(['BASIC_PREMIUM', 'PRO_PREMIUM']).optional(),
  jobId: z.string().optional(),
});

// POST /api/payments/initiate — start M-Pesa STK Push
export async function POST(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Check M-Pesa credentials are configured
  if (!process.env.MPESA_CONSUMER_KEY || !process.env.MPESA_PASSKEY) {
    return NextResponse.json(
      { error: 'Payment system is not configured. Please try again later.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const parsed = initiateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { phoneNumber, itemType, tier, jobId } = parsed.data;

    // Determine amount
    let amount: number;
    let description: string;

    switch (itemType) {
      case 'SUBSCRIPTION':
        amount = tier === 'PRO_PREMIUM' ? PRICING.PRO_PREMIUM_MONTHLY : PRICING.BASIC_PREMIUM_MONTHLY;
        description = tier === 'PRO_PREMIUM' ? 'Pro Premium Sub' : 'Basic Premium Sub';
        break;
      case 'PRIORITY_APPLICATION':
        amount = PRICING.PRIORITY_APPLICATION;
        if (!jobId) {
          return NextResponse.json({ error: 'Job ID is required for priority application' }, { status: 400 });
        }
        description = 'Priority Application';
        break;
      case 'CV_REVIEW':
        amount = PRICING.CV_REVIEW;
        description = 'AI CV Review';
        break;
      default:
        return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    // Normalize phone number
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhoneNumber(phoneNumber);
    } catch {
      return NextResponse.json({ error: 'Invalid Kenyan phone number. Use 07xxxxxxxx format.' }, { status: 400 });
    }

    // Check for existing pending payment (prevent duplicates within 10 min)
    const recentPending = await prisma.payment.findFirst({
      where: {
        candidateId,
        status: 'PENDING',
        itemType,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
    });

    if (recentPending) {
      return NextResponse.json({
        error: 'You have a pending payment. Please complete it or wait for it to expire.',
        paymentId: recentPending.id,
        checkoutRequestId: recentPending.mpesaCheckoutId,
      }, { status: 409 });
    }

    // Create payment record
    const reference = `JB-${itemType.slice(0, 3)}-${Date.now().toString(36).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        candidateId,
        amount,
        currency: 'KES',
        itemType,
        description,
        phoneNumber: normalizedPhone,
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Initiate STK Push
    const stkResult = await initiateSTKPush({
      phoneNumber: normalizedPhone,
      amount,
      reference: reference.slice(0, 12),
      description: description.slice(0, 13),
    });

    if (!stkResult.success) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', failureReason: stkResult.errorMessage },
      });
      return NextResponse.json(
        { error: stkResult.errorMessage || 'M-Pesa request failed. Please try again.' },
        { status: 502 }
      );
    }

    // Update payment with checkout ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { mpesaCheckoutId: stkResult.checkoutRequestId },
    });

    // If subscription, create/prepare subscription record
    if (itemType === 'SUBSCRIPTION') {
      const selectedTier = tier === 'PRO_PREMIUM' ? 'PRO_PREMIUM' : 'BASIC_PREMIUM';
      await prisma.subscription.upsert({
        where: { candidateId },
        create: {
          candidateId,
          tier: selectedTier,
          status: 'PAST_DUE',
          amount,
          startsAt: new Date(),
          expiresAt: null,
          autoRenew: true,
          paymentId: payment.id,
        },
        update: { amount, paymentId: payment.id, status: 'PAST_DUE' },
      });
    }

    // If priority application, create purchase record
    if (itemType === 'PRIORITY_APPLICATION' && jobId) {
      await prisma.premiumPurchase.create({
        data: {
          candidateId,
          itemType: 'PRIORITY_APPLICATION',
          jobId,
          amount,
          status: 'PENDING',
          paymentId: payment.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // If CV review, create purchase record
    if (itemType === 'CV_REVIEW') {
      await prisma.premiumPurchase.create({
        data: {
          candidateId,
          itemType: 'CV_REVIEW',
          amount,
          status: 'PENDING',
          paymentId: payment.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      checkoutRequestId: stkResult.checkoutRequestId,
      message: 'M-Pesa prompt sent to your phone. Please enter your PIN.',
    });
  } catch (error) {
    console.error('[payments/initiate] error:', error);
    const message = error instanceof Error ? error.message : 'Payment initiation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}