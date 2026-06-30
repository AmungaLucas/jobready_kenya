import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * PATCH /api/candidates/me/matches/[id]
 *
 * Update is_read or is_saved on a candidate job score.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { is_read, is_saved } = body as { is_read?: boolean; is_saved?: boolean };

    if (typeof is_read !== 'boolean' && typeof is_saved !== 'boolean') {
      return NextResponse.json(
        { error: 'Provide at least one of: is_read (boolean), is_saved (boolean)' },
        { status: 400 }
      );
    }

    const existing = await prisma.candidateJobScore.findUnique({ where: { id } });
    if (!existing || existing.candidateId !== candidateId) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof is_read === 'boolean') {
      updateData.isRead = is_read;
      updateData.readAt = is_read ? new Date() : null;
    }
    if (typeof is_saved === 'boolean') {
      updateData.isSaved = is_saved;
      updateData.savedAt = is_saved ? new Date() : null;
    }

    const updated = await prisma.candidateJobScore.update({ where: { id }, data: updateData });

    return NextResponse.json({
      id: updated.id,
      isRead: updated.isRead,
      isSaved: updated.isSaved,
      readAt: updated.readAt?.toISOString() ?? null,
      savedAt: updated.savedAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error('[PATCH /api/candidates/me/matches/[id]]', error);
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 });
  }
}