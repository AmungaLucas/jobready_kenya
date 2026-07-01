import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import { Prisma } from "@prisma/client";

// GET /api/candidates/me - Get current candidate profile
export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).userId as string;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        profile: true,
        preferences: true,
        skills: {
          include: { skill: true },
        },
        qualifications: true,
        workExperiences: {
          orderBy: { startDate: "desc" },
        },
        certifications: {
          include: { certification: true },
        },
        interests: {
          include: { category: true },
          orderBy: { interestRank: "asc" },
        },
        tools: {
          include: { tool: true },
        },
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error("Get candidate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/candidates/me - Update current candidate profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).userId as string;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Find existing candidate with all related records
    const existingCandidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        profile: true,
        preferences: true,
        workExperiences: true,
        qualifications: true,
        skills: true,
      },
    });

    if (!existingCandidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    // Extract nested arrays before destructuring
    const workExperiencesData = body.workExperiences as Array<Record<string, unknown>> | undefined;
    const educationsData = body.educations as Array<Record<string, unknown>> | undefined;
    const skillsData = body.skills as Array<Record<string, unknown>> | undefined;
    const deleteSkillIds = body.deleteSkillIds as string[] | undefined;

    // Destructure remaining top-level fields
    const {
      firstName,
      lastName,
      phone,
      locationCounty,
      workExperiences: _we,
      educations: _edu,
      skills: _sk,
      deleteSkillIds: _dsi,
      ...profileData
    } = body;

    const candidate = await prisma.$transaction(async (tx) => {
      // ── 1. Update basic candidate fields ──
      const updated = await tx.candidate.update({
        where: { userId },
        data: {
          ...(firstName !== undefined && { firstName: firstName as string }),
          ...(lastName !== undefined && { lastName: lastName as string }),
          ...(phone !== undefined && { phone: phone as string }),
          ...(locationCounty !== undefined && { locationCounty: locationCounty as string }),
        },
        include: {
          profile: true,
          preferences: true,
          workExperiences: true,
          qualifications: true,
          skills: { include: { skill: true } },
        },
      });

      // ── 2. Upsert profile if profile data is provided ──
      if (profileData && Object.keys(profileData).length > 0) {
        const profileId = existingCandidate.profile?.candidateId;
        const {
          primaryCategoryId,
          primarySubcategoryId,
          totalExperienceYears,
          seniorityLevel,
          profileCompletionScore,
        } = profileData;

        if (profileId) {
          await tx.candidateProfile.update({
            where: { candidateId: profileId },
            data: {
              ...(primaryCategoryId !== undefined && { primaryCategoryId: primaryCategoryId as string }),
              ...(primarySubcategoryId !== undefined && { primarySubcategoryId: primarySubcategoryId as string }),
              ...(totalExperienceYears !== undefined && { totalExperienceYears: parseFloat(totalExperienceYears as string) }),
              ...(seniorityLevel !== undefined && { seniorityLevel: seniorityLevel as Prisma.ExperienceLevel }),
              ...(profileCompletionScore !== undefined && { profileCompletionScore: parseInt(profileCompletionScore as string, 10) }),
            },
          });
        } else {
          await tx.candidateProfile.create({
            data: {
              candidateId: updated.id,
              ...(primaryCategoryId && { primaryCategoryId: primaryCategoryId as string }),
              ...(primarySubcategoryId && { primarySubcategoryId: primarySubcategoryId as string }),
              ...(totalExperienceYears !== undefined && { totalExperienceYears: parseFloat(totalExperienceYears as string) }),
              ...(seniorityLevel && { seniorityLevel: seniorityLevel as Prisma.ExperienceLevel }),
            },
          });
        }
      }

      // ── 3. Upsert preferences if preference data is provided ──
      const prefData = body.preferences;
      if (prefData) {
        const prefId = existingCandidate.preferences?.candidateId;
        const {
          preferredLocations,
          preferredJobTypes,
          remotePreference,
          expectedSalaryMin,
          expectedSalaryMax,
          salaryCurrency,
          availabilityStatus,
          noticePeriodDays,
          willingToRelocate,
        } = prefData;

        if (prefId) {
          await tx.candidatePreferences.update({
            where: { candidateId: prefId },
            data: {
              ...(preferredLocations !== undefined && { preferredLocations: preferredLocations as Prisma.InputJsonValue }),
              ...(preferredJobTypes !== undefined && { preferredJobTypes: preferredJobTypes as Prisma.InputJsonValue }),
              ...(remotePreference !== undefined && { remotePreference: remotePreference as Prisma.RemotePreference }),
              ...(expectedSalaryMin !== undefined && { expectedSalaryMin: parseFloat(expectedSalaryMin as string) }),
              ...(expectedSalaryMax !== undefined && { expectedSalaryMax: parseFloat(expectedSalaryMax as string) }),
              ...(salaryCurrency !== undefined && { salaryCurrency: salaryCurrency as string }),
              ...(availabilityStatus !== undefined && { availabilityStatus: availabilityStatus as Prisma.AvailabilityStatus }),
              ...(noticePeriodDays !== undefined && { noticePeriodDays: parseInt(noticePeriodDays as string, 10) }),
              ...(willingToRelocate !== undefined && { willingToRelocate: willingToRelocate as boolean }),
            },
          });
        } else {
          await tx.candidatePreferences.create({
            data: {
              candidateId: updated.id,
              ...(preferredLocations && { preferredLocations: preferredLocations as Prisma.InputJsonValue }),
              ...(preferredJobTypes && { preferredJobTypes: preferredJobTypes as Prisma.InputJsonValue }),
              ...(remotePreference && { remotePreference: remotePreference as Prisma.RemotePreference }),
              ...(expectedSalaryMin !== undefined && { expectedSalaryMin: parseFloat(expectedSalaryMin as string) }),
              ...(expectedSalaryMax !== undefined && { expectedSalaryMax: parseFloat(expectedSalaryMax as string) }),
              ...(salaryCurrency && { salaryCurrency: salaryCurrency as string }),
              ...(availabilityStatus && { availabilityStatus: availabilityStatus as Prisma.AvailabilityStatus }),
              ...(noticePeriodDays !== undefined && { noticePeriodDays: parseInt(noticePeriodDays as string, 10) }),
              ...(willingToRelocate !== undefined && { willingToRelocate: willingToRelocate as boolean }),
            },
          });
        }
      }

      // ── 4. Handle work experiences ──
      if (workExperiencesData) {
        const incomingIds = workExperiencesData
          .filter((we) => we.id)
          .map((we) => we.id as string);
        const existingIds = existingCandidate.workExperiences.map((we) => we.id);

        // Delete records not in the incoming list
        const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));
        if (idsToDelete.length > 0) {
          await tx.candidateWorkExperience.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        // Upsert each record
        for (const we of workExperiencesData) {
          const startDate = we.startDate ? new Date(we.startDate as string) : null;
          const endDate = we.endDate ? new Date(we.endDate as string) : null;

          if (we.id) {
            await tx.candidateWorkExperience.update({
              where: { id: we.id as string },
              data: {
                employerName: (we.employerName as string) || null,
                roleTitle: (we.roleTitle as string) || null,
                startDate,
                endDate,
                isCurrent: (we.isCurrent as boolean) ?? false,
                description: (we.description as string) || null,
              },
            });
          } else {
            await tx.candidateWorkExperience.create({
              data: {
                candidateId: updated.id,
                employerName: (we.employerName as string) || null,
                roleTitle: (we.roleTitle as string) || null,
                startDate,
                endDate,
                isCurrent: (we.isCurrent as boolean) ?? false,
                description: (we.description as string) || null,
              },
            });
          }
        }
      }

      // ── 5. Handle qualifications (education) ──
      if (educationsData) {
        const incomingIds = educationsData
          .filter((e) => e.id)
          .map((e) => e.id as string);
        const existingIds = existingCandidate.qualifications.map((q) => q.id);

        const idsToDelete = existingIds.filter((id) => !incomingIds.includes(id));
        if (idsToDelete.length > 0) {
          await tx.candidateQualification.deleteMany({
            where: { id: { in: idsToDelete } },
          });
        }

        for (const edu of educationsData) {
          const qualData = {
            institution: (edu.institution as string) || null,
            fieldOfStudy: (edu.fieldOfStudy as string) || null,
            level: edu.level ? (edu.level as Prisma.QualificationLevel) : null,
            status: (edu.status as string) || "COMPLETED",
            startYear: edu.startYear ? parseInt(edu.startYear as string, 10) : null,
            endYear: edu.endYear ? parseInt(edu.endYear as string, 10) : null,
          };

          if (edu.id) {
            await tx.candidateQualification.update({
              where: { id: edu.id as string },
              data: qualData,
            });
          } else {
            await tx.candidateQualification.create({
              data: {
                candidateId: updated.id,
                ...qualData,
              },
            });
          }
        }
      }

      // ── 6. Handle skills (update proficiency / delete) ──
      if (skillsData || deleteSkillIds) {
        // Delete specific skills
        if (deleteSkillIds && deleteSkillIds.length > 0) {
          await tx.candidateSkill.deleteMany({
            where: { id: { in: deleteSkillIds } },
          });
        }

        // Update existing skills' proficiency or create new ones
        if (skillsData) {
          for (const sk of skillsData) {
            if (sk.id) {
              await tx.candidateSkill.update({
                where: { id: sk.id as string },
                data: {
                  ...(sk.proficiency !== undefined && {
                    proficiency: sk.proficiency as Prisma.Proficiency,
                  }),
                  ...(sk.yearsExperience !== undefined && {
                    yearsExperience: parseFloat(sk.yearsExperience as string),
                  }),
                },
              });
            } else if (sk.name) {
              // Try to find matching TaxonomyItem for skill name
              const taxonomySkill = await tx.taxonomyItem.findFirst({
                where: {
                  type: "SKILL",
                  isActive: true,
                  OR: [
                    { label: { equals: sk.name as string, mode: "insensitive" } },
                    { value: { equals: (sk.name as string).toLowerCase().replace(/\s+/g, "_"), mode: "insensitive" } },
                  ],
                },
              });

              if (taxonomySkill) {
                await tx.candidateSkill.create({
                  data: {
                    candidateId: updated.id,
                    skillId: taxonomySkill.id,
                    rawText: sk.name as string,
                    proficiency: sk.proficiency
                      ? (sk.proficiency as Prisma.Proficiency)
                      : null,
                    yearsExperience: sk.yearsExperience
                      ? parseFloat(sk.yearsExperience as string)
                      : null,
                    source: "USER_ADDED",
                  },
                });
              }
            }
          }
        }
      }

      return updated;
    });

    // Fetch the updated candidate with all relations
    const updatedCandidate = await prisma.candidate.findUnique({
      where: { userId },
      include: {
        profile: true,
        preferences: true,
        skills: { include: { skill: true } },
        qualifications: true,
        workExperiences: {
          orderBy: { startDate: "desc" },
        },
        certifications: { include: { certification: true } },
        interests: { include: { category: true }, orderBy: { interestRank: "asc" } },
        tools: { include: { tool: true } },
      },
    });

    return NextResponse.json({ candidate: updatedCandidate });
  } catch (error) {
    console.error("Update candidate error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}