import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/get-server-admin';

// GET /api/admin/payments — full payment audit log
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') || 30), 100);
    const offset = Number(url.searchParams.get('offset') || 0);
    const status = url.searchParams.get('status');
    const itemType = url.searchParams.get('itemType');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (itemType) where.itemType = itemType;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          candidate: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('[admin/payments] error:', error);
    return NextResponse.json({ error: 'Failed to load payments' }, { status: 500 });
  }
}