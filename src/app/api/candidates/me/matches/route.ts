import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/candidates/me/matches
 *
 * Returns paginated match scores for the authenticated candidate.
 * Supports filtering by verdict and read status.
 *
 * Query params:
 *   page (1-indexed, default 1)
 *   limit (default 20)
 *   verdict (EXCELLENT | STRONG | MODERATE | WEAK | NOT_RECOMMENDED)
 *   read (true | false)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with real auth — get candidateId from session/JWT
    const candidateId = request.headers.get('x-candidate-id');
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Authentication required. Provide x-candidate-id header.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const verdict = searchParams.get('verdict');
    const readParam = searchParams.get('read');

    const where: Record<string, unknown> = { candidateId };

    if (verdict && ['EXCELLENT', 'STRONG', 'MODERATE', 'WEAK', 'NOT_RECOMMENDED'].includes(verdict)) {
      where.verdict = verdict;
    }
    if (readParam === 'true') {
      where.isRead = true;
    } else if (readParam === 'false') {
      where.isRead = false;
    }

    const [scores, total] = await Promise.all([
      prisma.candidateJobScore.findMany({
        where,
        orderBy: { finalScore: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          job: {
            select: {
              id: true,
              slug: true,
              title: true,
              employmentType: true,
              locationCity: true,
              locationCounty: true,
              isRemote: true,
              salaryMin: true,
              salaryMax: true,
              salaryCurrency: true,
              salaryDisclosure: true,
              organization: {
                select: { name: true },
              },
            },
          },
        },
      }),
      prisma.candidateJobScore.count({ where }),
    ]);

    // Transform to match the MatchScore shape used by the frontend
    const matches = scores.map((s) => ({
      jobId: s.jobId,
      jobSlug: s.job.slug,
      jobTitle: s.job.title,
      company: s.job.organization?.name ?? 'Unknown',
      location: [s.job.locationCity, s.job.locationCounty].filter(Boolean).join(', ') || (s.job.isRemote ? 'Remote' : 'Kenya'),
      employmentType: s.job.employmentType ?? 'FULL_TIME',
      finalScore: Math.round(s.finalScore),
      categoryScore: Math.round(s.categoryScore),
      subcategoryScore: Math.round(s.subcategoryScore),
      skillsScore: Math.round(s.skillsScore),
      qualificationsScore: Math.round(s.qualificationsScore),
      experienceScore: Math.round(s.experienceScore),
      industryScore: Math.round(s.industryScore),
      verdict: s.verdict,
      recommendationType: s.recommendationType,
      matchedSkillCount: s.matchedSkillCount,
      totalRequiredSkills: s.totalRequiredSkills,
      matchedQualificationCount: s.matchedQualificationCount,
      totalRequiredQualifications: s.totalRequiredQualifications,
      explanation: s.explanation ?? '',
      isRead: s.isRead,
      isSaved: s.isSaved,
      computedAt: s.computedAt.toISOString(),
    }));

    return NextResponse.json({
      matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[GET /api/candidates/me/matches]', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}