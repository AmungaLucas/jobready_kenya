import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth-helpers';

/**
 * GET /api/recruiter/jobs/[id]/matches
 *
 * Returns all candidate match scores for a specific job,
 * sorted by finalScore descending. Supports pagination and verdict filtering.
 *
 * Query params:
 *   - page: number (default 1)
 *   - limit: number (default 20, max 100)
 *   - verdict: EXCELLENT | STRONG | MODERATE | WEAK | NOT_RECOMMENDED
 *   - minScore: number
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: jobId } = await params;
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));
    const verdict = searchParams.get('verdict');
    const minScore = searchParams.get('minScore')
      ? Number(searchParams.get('minScore'))
      : null;

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      select: { id: true, title: true, status: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Build where clause
    const where: Record<string, unknown> = { jobId };
    if (verdict) {
      where.verdict = verdict;
    }
    if (minScore !== null) {
      where.finalScore = { gte: minScore };
    }

    // Fetch matches with candidate info
    const [matches, total] = await Promise.all([
      prisma.candidateJobScore.findMany({
        where,
        include: {
          candidate: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              locationCounty: true,
              onboardingStatus: true,
              profile: {
                select: {
                  primaryCategoryId: true,
                  primarySubcategoryId: true,
                  totalExperienceYears: true,
                  seniorityLevel: true,
                  profileCompletionScore: true,
                },
              },
            },
          },
        },
        orderBy: { finalScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.candidateJobScore.count({ where }),
    ]);

    // Get verdict distribution for summary
    const verdictCounts = await prisma.candidateJobScore.groupBy({
      by: ['verdict'],
      where: { jobId },
      _count: true,
    });

    const verdictSummary = Object.fromEntries(
      verdictCounts.map((v) => [v.verdict, v._count])
    );

    return NextResponse.json({
      job: { id: job.id, title: job.title, status: job.status },
      matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      verdictSummary,
    });
  } catch (error) {
    console.error('[GET /api/recruiter/jobs/[id]/matches]', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}