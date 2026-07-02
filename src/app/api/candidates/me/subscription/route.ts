import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

// GET /api/candidates/me/subscription — current subscription + feature access
export async function GET(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    let subscription = await prisma.subscription.findUnique({
      where: { candidateId },
    });

    // If no subscription record, create a FREE one
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          candidateId,
          tier: 'FREE',
          status: 'ACTIVE',
          amount: 0,
          startsAt: new Date(),
        },
      });
    }

    // Check if subscription has expired (auto-expire)
    const now = new Date();
    let isActive = subscription.status === 'ACTIVE';
    if (subscription.expiresAt && subscription.expiresAt < now) {
      isActive = false;
      if (subscription.status === 'ACTIVE') {
        await prisma.subscription.update({
          where: { candidateId },
          data: { status: 'EXPIRED' },
        });
        subscription.status = 'EXPIRED';
      }
    }

    // Count purchases
    const priorityAppCount = await prisma.premiumPurchase.count({
      where: {
        candidateId,
        itemType: 'PRIORITY_APPLICATION',
        status: 'COMPLETED',
      },
    });

    const unusedPriorityApps = await prisma.premiumPurchase.count({
      where: {
        candidateId,
        itemType: 'PRIORITY_APPLICATION',
        status: 'COMPLETED',
        usedAt: null,
        expiresAt: { gte: now },
      },
    });

    const hasCvReview = await prisma.premiumPurchase.findFirst({
      where: {
        candidateId,
        itemType: 'CV_REVIEW',
        status: 'COMPLETED',
      },
      select: { id: true, createdAt: true, metadata: true },
    });

    // Feature access matrix
    const isPremium = isActive && subscription.tier !== 'FREE';
    const isPro = isActive && subscription.tier === 'PRO_PREMIUM';

    return NextResponse.json({
      subscription: {
        tier: subscription.tier,
        status: subscription.status,
        isActive,
        startsAt: subscription.startsAt,
        expiresAt: subscription.expiresAt,
        autoRenew: subscription.autoRenew,
        amount: subscription.amount,
      },
      features: {
        aiMatching: isPremium,       // Basic + Pro
        matchExplanations: isPro,     // Pro only
        priorityApplications: unusedPriorityApps,
        cvReviewPurchased: !!hasCvReview,
        cvReviewResult: hasCvReview?.metadata ? JSON.parse(hasCvReview.metadata) : null,
        jobAlerts: isPremium,         // Premium includes alerts
      },
      stats: {
        totalPriorityApps: priorityAppCount,
        unusedPriorityApps,
      },
    });
  } catch (error) {
    console.error('[subscription] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// POST /api/candidates/me/subscription/cancel — cancel auto-renew
export async function POST(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const sub = await prisma.subscription.findUnique({ where: { candidateId } });
    if (!sub) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    await prisma.subscription.update({
      where: { candidateId },
      data: {
        autoRenew: false,
        // If currently active, let it run until expiry
        // If past due, cancel immediately
        ...(sub.status === 'PAST_DUE' ? { status: 'CANCELLED' as const, cancelledAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, message: 'Auto-renewal disabled' });
  } catch (error) {
    console.error('[subscription] POST cancel error:', error);
    return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 });
  }
}