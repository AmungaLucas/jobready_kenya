import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

// GET /api/candidates/me/wallet — wallet balance + transaction history
export async function GET(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
  const offset = Number(url.searchParams.get('offset') || 0);

  try {
    const [wallet, transactions] = await Promise.all([
      prisma.wallet.findUnique({
        where: { candidateId },
      }),
      wallet
        ? prisma.walletTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
          })
        : [],
    ]);

    return NextResponse.json({
      wallet: wallet
        ? {
            availableBalance: wallet.availableBalance,
            pendingBalance: wallet.pendingBalance,
            totalEarned: wallet.totalEarned,
            totalWithdrawn: wallet.totalWithdrawn,
            minimumWithdrawal: wallet.minimumWithdrawal,
          }
        : {
            availableBalance: 0,
            pendingBalance: 0,
            totalEarned: 0,
            totalWithdrawn: 0,
            minimumWithdrawal: 1000,
          },
      transactions,
    });
  } catch (error) {
    console.error('[wallet] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}