import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * PATCH /api/candidates/me/preferences
 *
 * Update candidate job preferences.
 *
 * Body fields (all optional):
 *   preferredLocations: string[]
 *   preferredJobTypes: string[]
 *   remotePreference: 'ONSITE' | 'HYBRID' | 'REMOTE' | 'ANY'
 *   expectedSalaryMin: number
 *   expectedSalaryMax: number
 *   salaryCurrency: string
 *   availabilityStatus: 'IMMEDIATE' | 'NOTICE_PERIOD' | 'UNAVAILABLE'
 *   noticePeriodDays: number
 *   willingToRelocate: boolean
 */
export async function PATCH(request: NextRequest) {
  try {
    const candidateId = request.headers.get('x-candidate-id');
    if (!candidateId) {
      return NextResponse.json(
        { error: 'Authentication required. Provide x-candidate-id header.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Build update data — only include provided fields
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
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const preferences = await prisma.candidatePreferences.upsert({
      where: { candidateId },
      create: {
        candidateId,
        ...updateData,
      },
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
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}