import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

const funnelSchema = z.object({
  stage: z.enum(['VIEWED', 'CLICKED_APPLY', 'STARTED_APPLICATION', 'SUBMITTED', 'COMPLETED']),
});

// POST /api/jobs/[id]/funnel — record an application funnel step
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const candidateId = await getServerCandidateId(request);
  if (!candidateId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { id: jobId } = await params;

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = funnelSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid stage' },
        { status: 400 }
      );
    }

    // Upsert: update existing record for this candidate+job, or create new
    await prisma.applicationFunnel.upsert({
      where: {
        jobId_candidateId: { jobId, candidateId },
      },
      create: {
        jobId,
        candidateId,
        stage: parsed.data.stage,
      },
      update: {
        stage: parsed.data.stage,
        stageAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[funnel] POST error:', error);
    return NextResponse.json({ error: 'Failed to record funnel step' }, { status: 500 });
  }
}