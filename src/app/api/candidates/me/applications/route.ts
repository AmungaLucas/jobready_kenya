import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * GET /api/candidates/me/applications
 *
 * Returns job applications submitted by the authenticated candidate.
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
    const status = searchParams.get('status');

    const validStatuses = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED', 'HIRED', 'WITHDRAWN'];

    const where: Record<string, unknown> = { candidateId };
    if (status && validStatuses.includes(status)) {
      where.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          job: {
            select: {
              id: true, slug: true, title: true, employmentType: true,
              locationCity: true, locationCounty: true, isRemote: true,
              organization: { select: { name: true } },
            },
          },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    const apps = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobSlug: app.job.slug,
      jobTitle: app.job.title,
      company: app.job.organization?.name ?? 'Unknown',
      location: [app.job.locationCity, app.job.locationCounty].filter(Boolean).join(', ') || (app.job.isRemote ? 'Remote' : 'Kenya'),
      employmentType: app.job.employmentType ?? 'FULL_TIME',
      matchScoreAtApplication: app.matchScoreAtApplication ?? null,
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      applications: apps,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('[GET /api/candidates/me/applications]', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}