import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

const viewSchema = z.object({
  source: z.enum(['MATCH', 'SEARCH', 'DIRECT']).optional().default('DIRECT'),
});

// POST /api/jobs/[id]/view — record a job view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const candidateId = await getServerCandidateId(request);
  // Allow anonymous views too (candidateId can be null)
  const { id: jobId } = await params;

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const parsed = viewSchema.safeParse(body);
    const source = parsed.success ? parsed.data.source : 'DIRECT';

    // Only record for authenticated candidates
    if (candidateId) {
      await prisma.jobView.create({
        data: {
          jobId,
          candidateId,
          source,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[job-view] POST error:', error);
    // Don't fail the page load if view tracking fails
    return NextResponse.json({ success: true });
  }
}