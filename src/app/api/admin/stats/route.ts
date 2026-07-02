import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/get-server-admin';
import type { NextRequest } from 'next/server';

// GET /api/admin/stats — dashboard overview numbers
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalCandidates,
      totalJobs,
      activeJobs,
      totalPayments,
      completedPayments,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      pendingWithdrawals,
      pendingWithdrawalAmount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.candidate.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.payment.count(),
      prisma.payment.count({ where: { status: 'COMPLETED' } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', completedAt: { gte: todayStart } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', completedAt: { gte: weekStart } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: 'COMPLETED', completedAt: { gte: monthStart } }, _sum: { amount: true } }),
      prisma.withdrawal.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.withdrawal.aggregate({ where: { status: { in: ['PENDING', 'PROCESSING'] } }, _sum: { amount: true } }),
    ]);

    // Subscription breakdown
    const subs = await prisma.subscription.groupBy({
      by: ['tier'],
      _count: true,
      where: { status: 'ACTIVE' },
    });

    // Payment type breakdown
    const paymentTypes = await prisma.payment.groupBy({
      by: ['itemType'],
      _count: true,
      _sum: { amount: true },
      where: { status: 'COMPLETED' },
    });

    // Recent payments (last 10)
    const recentPayments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, amount: true, status: true, itemType: true, providerTxId: true, createdAt: true, phoneNumber: true },
    });

    // Referral stats
    const totalReferrals = await prisma.referral.count();
    const activeReferrals = await prisma.referral.count({ where: { status: { in: ['ACTIVE', 'REWARDED'] } } });
    const totalCommissionPaid = await prisma.wallet.aggregate({ _sum: { totalWithdrawn: true } });

    return NextResponse.json({
      users: { total: totalUsers, candidates: totalCandidates },
      jobs: { total: totalJobs, active: activeJobs },
      payments: {
        total: totalPayments,
        completed: completedPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        today: todayRevenue._sum.amount || 0,
        week: weekRevenue._sum.amount || 0,
        month: monthRevenue._sum.amount || 0,
        byType: paymentTypes.map((p) => ({
          itemType: p.itemType,
          count: p._count,
          revenue: p._sum.amount || 0,
        })),
      },
      subscriptions: subs.map((s) => ({ tier: s.tier, count: s._count })),
      withdrawals: {
        pending: pendingWithdrawals,
        pendingAmount: pendingWithdrawalAmount._sum.amount || 0,
      },
      referrals: {
        total: totalReferrals,
        active: activeReferrals,
        totalCommissionPaid: totalCommissionPaid._sum.totalWithdrawn || 0,
      },
      recentPayments,
    });
  } catch (error) {
    console.error('[admin/stats] error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}