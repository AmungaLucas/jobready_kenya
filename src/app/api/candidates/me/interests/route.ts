import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

const interestsSchema = z.object({
  interests: z.array(
    z.object({
      categoryId: z.string().min(1),
      interestRank: z.number().int().min(1).max(100).optional(),
      userConfirmed: z.boolean().optional().default(true),
      overrideReason: z.string().max(500).optional(),
    })
  ).max(50),
});

// GET /api/candidates/me/interests — list candidate's interests
export async function GET(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const interests = await prisma.candidateInterest.findMany({
      where: { candidateId },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: [{ interestRank: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ interests });
  } catch (error) {
    console.error('[interests] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
  }
}

// PATCH /api/candidates/me/interests — set/update interests (replaces all)
export async function PATCH(request: NextRequest) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = interestsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { interests } = parsed.data;

    // Delete existing interests and create new ones in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.candidateInterest.deleteMany({ where: { candidateId } });

      if (interests.length > 0) {
        await tx.candidateInterest.createMany({
          data: interests.map((interest, index) => ({
            candidateId,
            categoryId: interest.categoryId,
            interestRank: interest.interestRank ?? (index + 1),
            source: 'USER_SELECTED' as const,
            userConfirmed: interest.userConfirmed,
            overrideReason: interest.overrideReason,
          })),
        });
      }
    });

    return NextResponse.json({ success: true, count: interests.length });
  } catch (error) {
    console.error('[interests] PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update interests' }, { status: 500 });
  }
}