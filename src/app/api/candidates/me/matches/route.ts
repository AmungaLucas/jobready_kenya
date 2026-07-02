import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';
import { checkPremiumAccess } from '@/lib/premium-access';

/**
 * GET /api/candidates/me/matches
 *
 * Returns paginated match scores for the authenticated candidate.
 * Premium-gated: free users see match count + job list (no scores).
 * Premium users see full scores. Pro users see scores + explanations.
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check premium access
    const access = await checkPremiumAccess(candidateId);

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
              id: true, slug: true, title: true, employmentType: true,
              locationCity: true, locationCounty: true, isRemote: true,
              salaryMin: true, salaryMax: true, salaryCurrency: true, salaryDisclosure: true,
              organization: { select: { orgName: true } },
            },
          },
        },
      }),
      prisma.candidateJobScore.count({ where }),
    ]);

    const matches = scores.map((s) => {
      const base = {
        id: s.id,
        jobId: s.jobId,
        jobSlug: s.job.slug,
        jobTitle: s.job.title,
        company: s.job.organization?.orgName ?? 'Unknown',
        location: [s.job.locationCity, s.job.locationCounty].filter(Boolean).join(', ') || (s.job.isRemote ? 'Remote' : 'Kenya'),
        employmentType: s.job.employmentType ?? 'FULL_TIME',
        verdict: s.verdict,
        recommendationType: s.recommendationType,
        matchedSkillCount: s.matchedSkillCount,
        totalRequiredSkills: s.totalRequiredSkills,
        matchedQualificationCount: s.matchedQualificationCount,
        totalRequiredQualifications: s.totalRequiredQualifications,
        isRead: s.isRead,
        isSaved: s.isSaved,
        computedAt: s.computedAt.toISOString(),
      };

      // Free users: no scores shown
      if (!access.canViewMatches) {
        return { ...base, finalScore: null, scoresLocked: true };
      }

      // Premium users: scores but no explanations
      const withScores = {
        ...base,
        scoresLocked: false,
        finalScore: Math.round(s.finalScore),
        categoryScore: Math.round(s.categoryScore),
        subcategoryScore: Math.round(s.subcategoryScore),
        skillsScore: Math.round(s.skillsScore),
        qualificationsScore: Math.round(s.qualificationsScore),
        experienceScore: Math.round(s.experienceScore),
        industryScore: Math.round(s.industryScore),
        explanation: null, // Pro only
      };

      // Pro users: scores + explanations
      if (access.canViewExplanations) {
        withScores.explanation = s.explanation ?? '';
      }

      return withScores;
    });

    return NextResponse.json({
      matches,
      premiumAccess: {
        tier: access.tier,
        canViewScores: access.canViewMatches,
        canViewExplanations: access.canViewExplanations,
      },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/candidates/me/matches]', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}