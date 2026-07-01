import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

// GET /api/candidates/me/purchases — payment + purchase history
export async function GET(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(Number(url.searchParams.get('limit') || 20), 50);
  const offset = Number(url.searchParams.get('offset') || 0);

  try {
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { candidateId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          itemType: true,
          description: true,
          providerTxId: true,
          failureReason: true,
          completedAt: true,
          createdAt: true,
        },
      }),
      prisma.payment.count({ where: { candidateId } }),
    ]);

    return NextResponse.json({
      payments,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('[purchases] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch purchase history' }, { status: 500 });
  }
}