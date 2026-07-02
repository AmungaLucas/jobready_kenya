import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/get-server-admin';

// GET /api/admin/referrals — referral management overview
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') || 20), 100);
    const offset = Number(url.searchParams.get('offset') || 0);
    const status = url.searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    // Pending withdrawals need approval
    const pendingWithdrawals = await prisma.withdrawal.findMany({
      where: { status: { in: ['PENDING', 'PROCESSING'] } },
      include: {
        candidate: { select: { firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Referrals list
    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        include: {
          referrer: { select: { firstName: true, lastName: true, email: true, referralCode: true } },
          referred: { select: { firstName: true, lastName: true, email: true, createdAt: true } },
          commissions: { select: { amountPaid: true, commissionAmount: true, status: true, createdAt: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.referral.count({ where }),
    ]);

    // Wallet summaries
    const walletSummary = await prisma.wallet.aggregate({
      _sum: { availableBalance: true, pendingBalance: true, totalEarned: true, totalWithdrawn: true },
    });

    return NextResponse.json({
      pendingWithdrawals,
      referrals,
      walletSummary: {
        totalAvailable: walletSummary._sum.availableBalance || 0,
        totalPending: walletSummary._sum.pendingBalance || 0,
        totalEarned: walletSummary._sum.totalEarned || 0,
        totalWithdrawn: walletSummary._sum.totalWithdrawn || 0,
      },
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('[admin/referrals] error:', error);
    return NextResponse.json({ error: 'Failed to load referrals' }, { status: 500 });
  }
}