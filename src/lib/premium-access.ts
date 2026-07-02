import { prisma } from '@/lib/prisma';

export interface PremiumAccess {
  isPremium: boolean;
  isPro: boolean;
  tier: string;
  canViewMatches: boolean;
  canViewExplanations: boolean;
  hasUnusedPriorityApp: boolean;
  hasCvReview: boolean;
}

/**
 * Check a candidate's premium access.
 * Safe to call from any API route — returns FREE tier if no subscription exists.
 */
export async function checkPremiumAccess(candidateId: string): Promise<PremiumAccess> {
  const sub = await prisma.subscription.findUnique({
    where: { candidateId },
  });

  if (!sub || sub.tier === 'FREE' || sub.status !== 'ACTIVE') {
    return {
      isPremium: false,
      isPro: false,
      tier: sub?.tier || 'FREE',
      canViewMatches: false,
      canViewExplanations: false,
      hasUnusedPriorityApp: false,
      hasCvReview: false,
    };
  }

  // Check expiry
  if (sub.expiresAt && sub.expiresAt < new Date()) {
    await prisma.subscription.update({
      where: { candidateId },
      data: { status: 'EXPIRED' },
    });
    return {
      isPremium: false,
      isPro: false,
      tier: sub.tier,
      canViewMatches: false,
      canViewExplanations: false,
      hasUnusedPriorityApp: false,
      hasCvReview: false,
    };
  }

  const isPro = sub.tier === 'PRO_PREMIUM';

  // Check for unused priority applications
  const unusedPriorityApps = await prisma.premiumPurchase.count({
    where: {
      candidateId,
      itemType: 'PRIORITY_APPLICATION',
      status: 'COMPLETED',
      usedAt: null,
      expiresAt: { gte: new Date() },
    },
  });

  // Check for CV review purchase
  const cvReview = await prisma.premiumPurchase.findFirst({
    where: {
      candidateId,
      itemType: 'CV_REVIEW',
      status: 'COMPLETED',
    },
  });

  return {
    isPremium: true,
    isPro,
    tier: sub.tier,
    canViewMatches: true,
    canViewExplanations: isPro,
    hasUnusedPriorityApp: unusedPriorityApps > 0,
    hasCvReview: !!cvReview,
  };
}

/**
 * Check if a candidate has a priority application for a specific job.
 */
export async function hasPriorityForJob(
  candidateId: string,
  jobId: string
): Promise<boolean> {
  const purchase = await prisma.premiumPurchase.findFirst({
    where: {
      candidateId,
      jobId,
      itemType: 'PRIORITY_APPLICATION',
      status: 'COMPLETED',
      usedAt: null,
      expiresAt: { gte: new Date() },
    },
  });
  return !!purchase;
}

/**
 * Mark a priority application as used.
 */
export async function consumePriorityApplication(
  candidateId: string,
  jobId: string
): Promise<void> {
  await prisma.premiumPurchase.updateMany({
    where: {
      candidateId,
      jobId,
      itemType: 'PRIORITY_APPLICATION',
      status: 'COMPLETED',
      usedAt: null,
    },
    data: { usedAt: new Date() },
  });
}