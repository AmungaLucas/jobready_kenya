import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * GET /api/candidates/me/alerts
 * Return all job alerts for the authenticated candidate.
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const alerts = await prisma.jobAlert.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[GET /api/candidates/me/alerts]', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

/**
 * POST /api/candidates/me/alerts
 * Create a new job alert.
 */
export async function POST(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, keywords, locationSlugs, categorySlug, frequency } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Alert name is required' }, { status: 400 });
    }

    const validFrequencies = ['INSTANT', 'DAILY', 'WEEKLY'];
    if (frequency && !validFrequencies.includes(frequency)) {
      return NextResponse.json({ error: 'Invalid frequency' }, { status: 400 });
    }

    const alert = await prisma.jobAlert.create({
      data: {
        candidateId,
        name: name.trim(),
        keywords: keywords || null,
        locationSlugs: locationSlugs || null,
        categorySlug: categorySlug || null,
        frequency: frequency || 'DAILY',
        isActive: true,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('[POST /api/candidates/me/alerts]', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}