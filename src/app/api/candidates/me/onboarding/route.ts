import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";
import type {
  SeniorityLevel,
  QualificationLevel,
  QualificationStatus,
  ProficiencyLevel,
  OnboardingStatus,
} from "@prisma/client";

interface Step1Data {
  firstName: string;
  lastName: string;
  phone?: string;
  locationCounty?: string;
}

interface WorkExperienceInput {
  employerName?: string;
  roleTitle?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
  responsibilities?: string;
}

interface Step2Data {
  primaryCategoryId?: string;
  seniorityLevel?: SeniorityLevel;
  totalExperienceYears?: number;
  workExperiences?: WorkExperienceInput[];
}

interface EducationInput {
  institution?: string;
  fieldOfStudy?: string;
  level?: QualificationLevel;
  status?: QualificationStatus;
  startYear?: number;
  endYear?: number;
}

interface SkillInput {
  skillId: string;
  proficiency?: ProficiencyLevel;
  yearsExperience?: number;
  source?: "USER_SELECTED" | "USER_ADDED" | "AI_EXTRACTED" | "ADMIN_ADDED";
}

interface Step3Data {
  educations?: EducationInput[];
  skills?: SkillInput[];
}

interface Step4Data {
  preferredLocations?: string[];
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  remotePreference?: "ONSITE" | "HYBRID" | "REMOTE" | "ANY";
}

type StepData = Step1Data | Step2Data | Step3Data | Step4Data;

function isStep1(data: StepData): data is Step1Data {
  return "firstName" in data || "lastName" in data;
}

function isStep2(data: StepData): data is Step2Data {
  return (
    "primaryCategoryId" in data ||
    "seniorityLevel" in data ||
    "totalExperienceYears" in data ||
    "workExperiences" in data
  );
}

function isStep3(data: StepData): data is Step3Data {
  return "educations" in data || "skills" in data;
}

function isStep4(data: StepData): data is Step4Data {
  return (
    "preferredLocations" in data ||
    "expectedSalaryMin" in data ||
    "expectedSalaryMax" in data ||
    "remotePreference" in data
  );
}

export async function POST(request: NextRequest) {
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
    const { step, data } = body as { step: number; data: StepData };

    if (!step || step < 1 || step > 4) {
      return NextResponse.json(
        { error: "Invalid step. Must be 1-4" },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Data is required for the onboarding step" },
        { status: 400 }
      );
    }

    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      include: { profile: true, preferences: true },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate not found" },
        { status: 404 }
      );
    }

    let newStatus: OnboardingStatus = candidate.onboardingStatus;

    await prisma.$transaction(async (tx) => {
      if (step === 1 && isStep1(data)) {
        // Step 1: Personal info
        await tx.candidate.update({
          where: { id: candidate.id },
          data: {
            ...(data.firstName && { firstName: data.firstName }),
            ...(data.lastName && { lastName: data.lastName }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.locationCounty !== undefined && {
              locationCounty: data.locationCounty,
            }),
          },
        });
        newStatus = "CV_UPLOADED";
      }

      if (step === 2 && isStep2(data)) {
        // Step 2: Domain & experience
        // Update profile
        if (candidate.profile) {
          await tx.candidateProfile.update({
            where: { id: candidate.profile.id },
            data: {
              ...(data.primaryCategoryId && {
                primaryCategoryId: data.primaryCategoryId,
              }),
              ...(data.seniorityLevel && {
                seniorityLevel: data.seniorityLevel,
              }),
              ...(data.totalExperienceYears !== undefined && {
                totalExperienceYears: data.totalExperienceYears,
              }),
              extractionStatus: "EXTRACTED",
            },
          });
        } else {
          await tx.candidateProfile.create({
            data: {
              candidateId: candidate.id,
              ...(data.primaryCategoryId && {
                primaryCategoryId: data.primaryCategoryId,
              }),
              ...(data.seniorityLevel && {
                seniorityLevel: data.seniorityLevel,
              }),
              ...(data.totalExperienceYears !== undefined && {
                totalExperienceYears: data.totalExperienceYears,
              }),
              extractionStatus: "EXTRACTED",
            },
          });
        }

        // Add work experiences
        if (data.workExperiences && data.workExperiences.length > 0) {
          await tx.candidateWorkExperience.deleteMany({
            where: { candidateId: candidate.id },
          });

          for (const exp of data.workExperiences) {
            await tx.candidateWorkExperience.create({
              data: {
                candidateId: candidate.id,
                employerName: exp.employerName,
                roleTitle: exp.roleTitle,
                startDate: exp.startDate ? new Date(exp.startDate) : null,
                endDate: exp.endDate ? new Date(exp.endDate) : null,
                isCurrent: exp.isCurrent ?? false,
                description: exp.description,
                responsibilities: exp.responsibilities
                  ? JSON.stringify(exp.responsibilities)
                  : null,
              },
            });
          }
        }

        newStatus = "DOMAIN_CONFIRMED";
      }

      if (step === 3 && isStep3(data)) {
        // Step 3: Education & skills
        // Add educations
        if (data.educations && data.educations.length > 0) {
          await tx.candidateEducation.deleteMany({
            where: { candidateId: candidate.id },
          });

          for (const edu of data.educations) {
            await tx.candidateEducation.create({
              data: {
                candidateId: candidate.id,
                institution: edu.institution,
                fieldOfStudy: edu.fieldOfStudy,
                level: edu.level,
                status: edu.status ?? "COMPLETED",
                startYear: edu.startYear,
                endYear: edu.endYear,
              },
            });
          }
        }

        // Add skills
        if (data.skills && data.skills.length > 0) {
          // Delete existing skills
          const existingSkills = await tx.candidateSkill.findMany({
            where: { candidateId: candidate.id },
            select: { id: true },
          });
          if (existingSkills.length > 0) {
            await tx.candidateSkill.deleteMany({
              where: { candidateId: candidate.id },
            });
          }

          for (const skill of data.skills) {
            await tx.candidateSkill.create({
              data: {
                candidateId: candidate.id,
                skillId: skill.skillId,
                proficiency: skill.proficiency,
                yearsExperience: skill.yearsExperience,
                source: skill.source ?? "USER_SELECTED",
              },
            });
          }
        }

        newStatus = "INTERESTS_SELECTED";
      }

      if (step === 4 && isStep4(data)) {
        // Step 4: Preferences
        if (candidate.preferences) {
          await tx.candidatePreferences.update({
            where: { id: candidate.preferences.id },
            data: {
              ...(data.preferredLocations !== undefined && {
                preferredLocations: JSON.stringify(data.preferredLocations),
              }),
              ...(data.expectedSalaryMin !== undefined && {
                expectedSalaryMin: data.expectedSalaryMin,
              }),
              ...(data.expectedSalaryMax !== undefined && {
                expectedSalaryMax: data.expectedSalaryMax,
              }),
              ...(data.remotePreference && {
                remotePreference: data.remotePreference,
              }),
            },
          });
        } else {
          await tx.candidatePreferences.create({
            data: {
              candidateId: candidate.id,
              ...(data.preferredLocations && {
                preferredLocations: JSON.stringify(data.preferredLocations),
              }),
              ...(data.expectedSalaryMin !== undefined && {
                expectedSalaryMin: data.expectedSalaryMin,
              }),
              ...(data.expectedSalaryMax !== undefined && {
                expectedSalaryMax: data.expectedSalaryMax,
              }),
              ...(data.remotePreference && {
                remotePreference: data.remotePreference,
              }),
            },
          });
        }

        newStatus = "COMPLETED";
      }

      // Update onboarding status
      await tx.candidate.update({
        where: { id: candidate.id },
        data: { onboardingStatus: newStatus },
      });
    });

    // Fetch updated candidate
    const updatedCandidate = await prisma.candidate.findUnique({
      where: { id: candidate.id },
      include: {
        profile: {
          include: {
            primaryCategory: true,
            primarySubcategory: true,
          },
        },
        preferences: true,
      },
    });

    return NextResponse.json({
      candidate: updatedCandidate,
      onboardingStatus: newStatus,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}