import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * GET /api/candidates/me/interests
 * Returns the candidate's interest categories.
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const interests = await prisma.candidateInterest.findMany({
      where: { candidateId },
      include: {
        category: {
          select: { id: true, value: true, label: true },
        },
      },
      orderBy: { interestRank: 'asc' },
    });

    return NextResponse.json(interests);
  } catch (error) {
    console.error('[GET /api/candidates/me/interests]', error);
    return NextResponse.json({ error: 'Failed to fetch interests' }, { status: 500 });
  }
}

/**
 * PATCH /api/candidates/me/interests
 *
 * Replaces the candidate's interest categories.
 * Body: { interests: [{ categoryId: string, interestRank?: number }] }
 *
 * Max 4 additional interests (primary category is on the profile, not here).
 */
export async function PATCH(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { interests } = body as {
      interests: Array<{ categoryId: string; interestRank?: number }>;
    };

    if (!Array.isArray(interests)) {
      return NextResponse.json({ error: 'interests must be an array' }, { status: 400 });
    }

    if (interests.length > 4) {
      return NextResponse.json(
        { error: 'Maximum 4 interest categories allowed' },
        { status: 400 }
      );
    }

    // Validate all category IDs exist and are CATEGORY type
    const categoryIds = interests.map((i) => i.categoryId);
    const taxonomyItems = await prisma.taxonomyItem.findMany({
      where: {
        id: { in: categoryIds },
        type: 'CATEGORY',
        isActive: true,
      },
      select: { id: true },
    });

    const validIds = new Set(taxonomyItems.map((t) => t.id));
    const invalidIds = categoryIds.filter((id) => !validIds.has(id));
    if (invalidIds.length > 0) {
      return NextResponse.json(
        { error: 'Invalid category IDs', invalidIds },
        { status: 400 }
      );
    }

    // Replace all interests in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing interests
      await tx.candidateInterest.deleteMany({
        where: { candidateId },
      });

      // Create new interests
      if (interests.length > 0) {
        await tx.candidateInterest.createMany({
          data: interests.map((interest, index) => ({
            candidateId,
            categoryId: interest.categoryId,
            interestRank: interest.interestRank ?? (index + 1),
            source: 'USER_SELECTED',
            aiSuggested: false,
            userConfirmed: true,
          })),
        });
      }

      return interests.length;
    });

    // Update onboarding status if setting interests
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { onboardingStatus: 'INTERESTS_SELECTED' },
    });

    return NextResponse.json({
      success: true,
      count: result,
      message: `Updated ${result} interest categories`,
    });
  } catch (error) {
    console.error('[PATCH /api/candidates/me/interests]', error);
    return NextResponse.json({ error: 'Failed to update interests' }, { status: 500 });
  }
}