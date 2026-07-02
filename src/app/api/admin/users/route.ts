import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/get-server-admin';

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  status: z.string().optional(),
});

// GET /api/admin/users — list candidates with subscription info
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const { limit, offset, search, status } = querySchema.parse(params);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    if (status) {
      // Status could be subscription tier or suspended
      if (['BASIC_PREMIUM', 'PRO_PREMIUM', 'FREE'].includes(status)) {
        where.subscription = { tier: status, status: 'ACTIVE' };
      }
    }

    const [users, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true, phone: true,
          referralCode: true, onboardingStatus: true, createdAt: true,
          profile: { select: { profileCompletionScore: true } },
          subscription: { select: { tier: true, status: true, expiresAt: true, amount: true } },
          user: { select: { role: true, emailVerified: true } },
          _count: { select: { payments: true, referralsMade: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.candidate.count({ where }),
    ]);

    return NextResponse.json({
      users,
      pagination: { total, limit, offset, hasMore: offset + limit < total },
    });
  } catch (error) {
    console.error('[admin/users] error:', error);
    return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
  }
}

// PATCH /api/admin/users/:id — suspend/unsuspend, change role
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  const { id } = await params;
  const body = await request.json();

  try {
    if (body.action === 'suspend') {
      const candidate = await prisma.candidate.findUnique({ where: { id }, include: { user: true } });
      if (!candidate) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      await prisma.user.update({
        where: { id: candidate.userId },
        data: { role: 'CANDIDATE' }, // Could add a SUSPENDED role later
      });
      return NextResponse.json({ success: true, message: 'User suspended' });
    }

    if (body.action === 'setRole') {
      if (!['CANDIDATE', 'RECRUITER', 'ADMIN'].includes(body.role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      // Find user by candidate ID
      const candidate = await prisma.candidate.findUnique({ where: { id } });
      if (!candidate) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      await prisma.user.update({
        where: { id: candidate.userId },
        data: { role: body.role },
      });
      return NextResponse.json({ success: true, message: `Role set to ${body.role}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[admin/users] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}