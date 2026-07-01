import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * POST /api/jobs/[id]/view
 *
 * Records a job view for analytics and recommendation tuning.
 * Body (optional): { source?: 'MATCH' | 'SEARCH' | 'DIRECT' }
 *
 * Idempotent: only creates one view per candidate-job per day.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const candidateId = await getServerCandidateId(request);
    // Allow anonymous views — don't require auth
    if (!candidateId) {
      return NextResponse.json({ skipped: true, reason: 'not_authenticated' });
    }

    const { id: jobId } = await params;

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId, deletedAt: null },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const source = (body.source as 'MATCH' | 'SEARCH' | 'DIRECT') || 'DIRECT';

    // Check if already viewed today (idempotent per day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const existingView = await prisma.jobView.findFirst({
      where: {
        candidateId,
        jobId,
        viewedAt: { gte: todayStart },
      },
    });

    if (existingView) {
      return NextResponse.json({ skipped: true, reason: 'already_viewed_today' });
    }

    // Record the view
    await prisma.jobView.create({
      data: {
        candidateId,
        jobId,
        source,
      },
    });

    // Also update the match score's is_read flag
    await prisma.candidateJobScore.updateMany({
      where: {
        candidateId,
        jobId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, source });
  } catch (error) {
    console.error('[POST /api/jobs/[id]/view]', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}