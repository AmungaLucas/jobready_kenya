import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * PATCH /api/candidates/me/alerts/[id]
 * Toggle isActive or update alert settings.
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

    // Verify ownership
    const existing = await prisma.jobAlert.findUnique({ where: { id } });
    if (!existing || existing.candidateId !== candidateId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    if (typeof body.isActive === 'boolean') updateData.isActive = body.isActive;
    if (body.name) updateData.name = body.name.trim();
    if (body.keywords !== undefined) updateData.keywords = body.keywords || null;
    if (body.locationSlugs !== undefined) updateData.locationSlugs = body.locationSlugs || null;
    if (body.categorySlug !== undefined) updateData.categorySlug = body.categorySlug || null;
    if (body.frequency) {
      const valid = ['INSTANT', 'DAILY', 'WEEKLY'];
      if (valid.includes(body.frequency)) updateData.frequency = body.frequency;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const alert = await prisma.jobAlert.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('[PATCH /api/candidates/me/alerts/[id]]', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

/**
 * DELETE /api/candidates/me/alerts/[id]
 * Delete a job alert.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existing = await prisma.jobAlert.findUnique({ where: { id } });
    if (!existing || existing.candidateId !== candidateId) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await prisma.jobAlert.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/candidates/me/alerts/[id]]', error);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}