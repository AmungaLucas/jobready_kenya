import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * GET /api/candidates/me/saved
 *
 * Returns jobs the candidate has saved (isSaved = true).
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));

    const where = { candidateId, isSaved: true };

    const [scores, total] = await Promise.all([
      prisma.candidateJobScore.findMany({
        where,
        orderBy: { savedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          job: {
            select: {
              id: true, slug: true, title: true, employmentType: true,
              locationCity: true, locationCounty: true, isRemote: true,
              salaryMin: true, salaryMax: true, salaryCurrency: true, salaryDisclosure: true,
              organization: { select: { name: true } },
            },
          },
        },
      }),
      prisma.candidateJobScore.count({ where }),
    ]);

    const savedJobs = scores.map((s) => {
      const job = s.job;
      let salaryRange = 'Not disclosed';
      if (job.salaryDisclosure === 'RANGE' && job.salaryMin && job.salaryMax) {
        salaryRange = `KES ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
      } else if (job.salaryDisclosure === 'EXACT' && job.salaryMin) {
        salaryRange = `KES ${job.salaryMin.toLocaleString()}`;
      }

      return {
        jobId: job.id,
        jobSlug: job.slug,
        jobTitle: job.title,
        company: job.organization?.name ?? 'Unknown',
        location: [job.locationCity, job.locationCounty].filter(Boolean).join(', ') || (job.isRemote ? 'Remote' : 'Kenya'),
        employmentType: job.employmentType ?? 'FULL_TIME',
        salaryRange,
        savedAt: s.savedAt?.toISOString() ?? s.computedAt.toISOString(),
      };
    });

    return NextResponse.json({
      savedJobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/candidates/me/saved]', error);
    return NextResponse.json({ error: 'Failed to fetch saved jobs' }, { status: 500 });
  }
}