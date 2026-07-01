import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerCandidateId } from '@/lib/get-server-candidate';

/**
 * GET /api/candidates/me/profile
 *
 * Returns the full candidate profile with skills, tools, qualifications,
 * certifications, work experiences, interests, and preferences.
 */
export async function GET(request: NextRequest) {
  try {
    const candidateId = await getServerCandidateId(request);
    if (!candidateId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      include: {
        profile: true,
        preferences: true,
        interests: { select: { categoryId: true, interestRank: true }, orderBy: { interestRank: 'asc' } },
        subcategories: { select: { subcategoryId: true, confidenceScore: true } },
        skills: { select: { skillId: true, proficiency: true, yearsExperience: true, confidenceScore: true } },
        tools: { select: { toolId: true, proficiency: true, confidenceScore: true } },
        qualifications: { select: { qualificationId: true, institution: true, fieldOfStudy: true, level: true, status: true, startYear: true, endYear: true } },
        certifications: { select: { certificationId: true, issuingBody: true, status: true, yearAwarded: true } },
        workExperiences: { orderBy: { startDate: 'desc' } },
      },
    });

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    // Fetch taxonomy labels for IDs
    const allTaxonomyIds = [
      ...candidate.interests.map((i) => i.categoryId),
      ...candidate.subcategories.map((s) => s.subcategoryId),
      ...candidate.skills.map((s) => s.skillId),
      ...candidate.tools.map((t) => t.toolId),
      ...candidate.qualifications.map((q) => q.qualificationId).filter((id): id is string => id !== null),
      ...candidate.certifications.map((c) => c.certificationId).filter((id): id is string => id !== null),
      candidate.profile?.primaryCategoryId,
      candidate.profile?.primarySubcategoryId,
    ].filter((id): id is string => id !== null);

    const taxonomyMap = new Map<string, { label: string; type: string }>();
    if (allTaxonomyIds.length > 0) {
      const items = await prisma.taxonomyItem.findMany({
        where: { id: { in: allTaxonomyIds } },
        select: { id: true, label: true, type: true },
      });
      for (const item of items) {
        taxonomyMap.set(item.id, { label: item.label, type: item.type });
      }
    }

    const getLabel = (id: string | null | undefined) =>
      id ? taxonomyMap.get(id)?.label ?? id : null;

    return NextResponse.json({
      candidateId: candidate.id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      locationCounty: candidate.locationCounty,
      country: candidate.country,
      onboardingStatus: candidate.onboardingStatus,
      primaryCategory: getLabel(candidate.profile?.primaryCategoryId),
      primarySubcategory: getLabel(candidate.profile?.primarySubcategoryId),
      seniorityLevel: candidate.profile?.seniorityLevel,
      totalExperienceYears: candidate.profile?.totalExperienceYears ?? 0,
      profileCompletionScore: candidate.profile?.profileCompletionScore,
      extractionStatus: candidate.profile?.extractionStatus,
      skills: candidate.skills.map((s) => ({
        name: getLabel(s.skillId) ?? s.skillId,
        proficiency: s.proficiency,
        yearsExperience: s.yearsExperience ?? 0,
      })),
      tools: candidate.tools.map((t) => getLabel(t.toolId) ?? t.toolId),
      workExperience: candidate.workExperiences.map((we) => ({
        id: we.id,
        employerName: we.employerName ?? '',
        roleTitle: we.roleTitle ?? '',
        startDate: we.startDate?.toISOString().slice(0, 7) ?? '',
        endDate: we.isCurrent ? null : (we.endDate?.toISOString().slice(0, 7) ?? null),
        isCurrent: we.isCurrent,
        description: we.description ?? '',
        industry: getLabel(we.organizationIndustryId) ?? we.organizationIndustryId ?? '',
      })),
      education: candidate.qualifications.map((q) => ({
        id: q.id,
        institution: q.institution ?? '',
        fieldOfStudy: q.fieldOfStudy ?? '',
        level: q.level ?? 'OTHER',
        status: q.status,
        startYear: q.startYear ?? 0,
        endYear: q.endYear ?? null,
      })),
      certifications: candidate.certifications.map((c) => ({
        id: c.id,
        name: getLabel(c.certificationId) ?? c.certificationId ?? '',
        issuingBody: c.issuingBody ?? '',
        status: c.status,
        yearAwarded: c.yearAwarded ?? null,
      })),
      interests: candidate.interests.map((i) => ({
        category: getLabel(i.categoryId) ?? i.categoryId,
        isPrimary: i.categoryId === candidate.profile?.primaryCategoryId,
      })),
      preferences: candidate.preferences
        ? {
            preferredLocations: (candidate.preferences.preferredLocations as string[]) ?? [],
            remotePreference: candidate.preferences.remotePreference,
            expectedSalaryMin: candidate.preferences.expectedSalaryMin ?? 0,
            expectedSalaryMax: candidate.preferences.expectedSalaryMax ?? 0,
            salaryCurrency: candidate.preferences.salaryCurrency,
            availabilityStatus: candidate.preferences.availabilityStatus,
            noticePeriodDays: candidate.preferences.noticePeriodDays,
            willingToRelocate: candidate.preferences.willingToRelocate,
            preferredJobTypes: (candidate.preferences.preferredJobTypes as string[]) ?? [],
          }
        : null,
    });
  } catch (error) {
    console.error('[GET /api/candidates/me/profile]', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}