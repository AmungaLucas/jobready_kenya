import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * PATCH /api/candidates/me/preferences
 *
 * Update candidate job preferences.
 */
export async function PATCH(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    if (Array.isArray(body.preferredLocations)) updateData.preferredLocations = body.preferredLocations;
    if (Array.isArray(body.preferredJobTypes)) updateData.preferredJobTypes = body.preferredJobTypes;
    if (body.remotePreference) updateData.remotePreference = body.remotePreference;
    if (body.expectedSalaryMin !== undefined) updateData.expectedSalaryMin = body.expectedSalaryMin;
    if (body.expectedSalaryMax !== undefined) updateData.expectedSalaryMax = body.expectedSalaryMax;
    if (body.salaryCurrency) updateData.salaryCurrency = body.salaryCurrency;
    if (body.availabilityStatus) updateData.availabilityStatus = body.availabilityStatus;
    if (body.noticePeriodDays !== undefined) updateData.noticePeriodDays = body.noticePeriodDays;
    if (typeof body.willingToRelocate === 'boolean') updateData.willingToRelocate = body.willingToRelocate;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const preferences = await prisma.candidatePreferences.upsert({
      where: { candidateId },
      create: { candidateId, ...updateData },
      update: updateData,
    });

    return NextResponse.json({
      preferredLocations: preferences.preferredLocations,
      preferredJobTypes: preferences.preferredJobTypes,
      remotePreference: preferences.remotePreference,
      expectedSalaryMin: preferences.expectedSalaryMin,
      expectedSalaryMax: preferences.expectedSalaryMax,
      salaryCurrency: preferences.salaryCurrency,
      availabilityStatus: preferences.availabilityStatus,
      noticePeriodDays: preferences.noticePeriodDays,
      willingToRelocate: preferences.willingToRelocate,
    });
  } catch (error) {
    console.error('[PATCH /api/candidates/me/preferences]', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}