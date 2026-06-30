// Database-level matching query builder.
// Executes the SQL-based matching approach from the project plan:
// fetch candidate + job data via Prisma, then score in TypeScript.

import { prisma } from '@/lib/prisma';
import { computeMatch } from './scorer';
import type { CandidateMatchData, JobMatchData } from './types';

// ── Fetch candidate data for matching ──────────────────────────────────────

export async function getCandidateMatchData(candidateId: string): Promise<CandidateMatchData | null> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: {
      profile: true,
      interests: { select: { categoryId: true } },
      subcategories: { select: { subcategoryId: true } },
      skills: { select: { skillId: true } },
      qualifications: { select: { qualificationId: true } },
      workExperiences: {
        select: { organizationIndustryId: true },
        where: { organizationIndustryId: { not: null } },
      },
    },
  });

  if (!candidate) return null;

  const industryIds = candidate.workExperiences
    .map((we) => we.organizationIndustryId)
    .filter((id): id is string => id !== null);

  return {
    id: candidate.id,
    primaryCategoryId: candidate.profile?.primaryCategoryId ?? null,
    primarySubcategoryId: candidate.profile?.primarySubcategoryId ?? null,
    interestCategoryIds: candidate.interests.map((i) => i.categoryId),
    subcategoryIds: candidate.subcategories.map((s) => s.subcategoryId),
    skillIds: candidate.skills.map((s) => s.skillId),
    qualificationIds: candidate.qualifications
      .map((q) => q.qualificationId)
      .filter((id): id is string => id !== null),
    totalExperienceYears: candidate.profile?.totalExperienceYears ?? 0,
    industryIds: [...new Set(industryIds)],
  };
}

// ── Fetch job data for matching ────────────────────────────────────────────

export async function getJobsForMatching(): Promise<JobMatchData[]> {
  const jobs = await prisma.job.findMany({
    where: {
      status: 'ACTIVE',
      deletedAt: null,
      deadline: { gte: new Date() },
      jobProfile: { extractionStatus: { in: ['EXTRACTED', 'NEEDS_REVIEW'] } },
    },
    include: {
      jobProfile: true,
      jobSubcategoryLinks: { select: { subcategoryId: true } },
      jobSkills: {
        where: { importance: 'MUST_HAVE' },
        select: { skillId: true },
      },
      jobQualifications: {
        where: { importance: 'MUST_HAVE' },
        select: { qualificationId: true },
      },
    },
  });

  return jobs.map((job) => ({
    id: job.id,
    jobCategoryId: job.jobProfile?.jobCategoryId ?? null,
    primarySubcategoryId: job.jobProfile?.primarySubcategoryId ?? null,
    subcategoryIds: job.jobSubcategoryLinks.map((l) => l.subcategoryId),
    requiredSkillIds: job.jobSkills.map((s) => s.skillId),
    optionalSkillIds: [],
    requiredQualificationIds: job.jobQualifications
      .map((q) => q.qualificationId)
      .filter((id): id is string => id !== null),
    minimumExperienceYears: job.jobProfile?.minimumExperienceYears ?? 0,
    preferredExperienceYears: job.jobProfile?.preferredExperienceYears ?? 0,
    industryId: job.jobProfile?.organizationIndustryId ?? null,
  }));
}

// ── Compute and persist matches for a single candidate ─────────────────────

export async function computeAndSaveMatches(candidateId: string): Promise<number> {
  const candidate = await getCandidateMatchData(candidateId);
  if (!candidate) return 0;

  const jobs = await getJobsForMatching();

  let savedCount = 0;

  for (const job of jobs) {
    const match = computeMatch(candidate, job);

    // Collect matched/missing skill IDs for UI display
    const matchedSkillIds = candidate.skillIds.filter((sid) =>
      job.requiredSkillIds.includes(sid)
    );
    const missingSkillIds = job.requiredSkillIds.filter(
      (sid) => !candidate.skillIds.includes(sid)
    );

    await prisma.candidateJobScore.upsert({
      where: {
        candidateId_jobId: { candidateId, jobId: job.id },
      },
      create: {
        candidateId,
        jobId: job.id,
        finalScore: match.finalScore,
        categoryScore: match.categoryScore,
        subcategoryScore: match.subcategoryScore,
        skillsScore: match.skillsScore,
        qualificationsScore: match.qualificationsScore,
        experienceScore: match.experienceScore,
        industryScore: match.industryScore,
        matchedSkillCount: match.matchedSkillCount,
        totalRequiredSkills: match.totalRequiredSkills,
        matchedQualificationCount: match.matchedQualificationCount,
        totalRequiredQualifications: match.totalRequiredQualifications,
        verdict: match.verdict,
        recommendationType: match.recommendationType,
        matchedItems: matchedSkillIds.length > 0 ? matchedSkillIds : undefined,
        missingItems: missingSkillIds.length > 0 ? missingSkillIds : undefined,
      },
      update: {
        finalScore: match.finalScore,
        categoryScore: match.categoryScore,
        subcategoryScore: match.subcategoryScore,
        skillsScore: match.skillsScore,
        qualificationsScore: match.qualificationsScore,
        experienceScore: match.experienceScore,
        industryScore: match.industryScore,
        matchedSkillCount: match.matchedSkillCount,
        totalRequiredSkills: match.totalRequiredSkills,
        matchedQualificationCount: match.matchedQualificationCount,
        totalRequiredQualifications: match.totalRequiredQualifications,
        verdict: match.verdict,
        recommendationType: match.recommendationType,
        matchedItems: matchedSkillIds.length > 0 ? matchedSkillIds : undefined,
        missingItems: missingSkillIds.length > 0 ? missingSkillIds : undefined,
        computedAt: new Date(),
      },
    });

    savedCount++;
  }

  return savedCount;
}

// ── Compute matches for a single job (reverse matching) ───────────────────

export async function computeAndSaveMatchesForJob(jobId: string): Promise<number> {
  const jobProfile = await prisma.jobProfile.findUnique({
    where: { jobId },
    include: {
      job: {
        include: {
          jobSubcategoryLinks: { select: { subcategoryId: true } },
          jobSkills: {
            where: { importance: 'MUST_HAVE' },
            select: { skillId: true },
          },
          jobQualifications: {
            where: { importance: 'MUST_HAVE' },
            select: { qualificationId: true },
          },
        },
      },
    },
  });

  if (!jobProfile?.job) return 0;

  const job: JobMatchData = {
    id: jobId,
    jobCategoryId: jobProfile.jobCategoryId,
    primarySubcategoryId: jobProfile.primarySubcategoryId,
    subcategoryIds: jobProfile.job.jobSubcategoryLinks.map((l) => l.subcategoryId),
    requiredSkillIds: jobProfile.job.jobSkills.map((s) => s.skillId),
    optionalSkillIds: [],
    requiredQualificationIds: jobProfile.job.jobQualifications
      .map((q) => q.qualificationId)
      .filter((id): id is string => id !== null),
    minimumExperienceYears: jobProfile.minimumExperienceYears,
    preferredExperienceYears: jobProfile.preferredExperienceYears,
    industryId: jobProfile.organizationIndustryId,
  };

  // Get all completed candidates
  const candidates = await prisma.candidate.findMany({
    where: { onboardingStatus: 'COMPLETED' },
    include: {
      profile: true,
      interests: { select: { categoryId: true } },
      subcategories: { select: { subcategoryId: true } },
      skills: { select: { skillId: true } },
      qualifications: { select: { qualificationId: true } },
      workExperiences: {
        select: { organizationIndustryId: true },
        where: { organizationIndustryId: { not: null } },
      },
    },
  });

  let savedCount = 0;

  for (const c of candidates) {
    const industryIds = c.workExperiences
      .map((we) => we.organizationIndustryId)
      .filter((id): id is string => id !== null);

    const candidate: CandidateMatchData = {
      id: c.id,
      primaryCategoryId: c.profile?.primaryCategoryId ?? null,
      primarySubcategoryId: c.profile?.primarySubcategoryId ?? null,
      interestCategoryIds: c.interests.map((i) => i.categoryId),
      subcategoryIds: c.subcategories.map((s) => s.subcategoryId),
      skillIds: c.skills.map((s) => s.skillId),
      qualificationIds: c.qualifications
        .map((q) => q.qualificationId)
        .filter((id): id is string => id !== null),
      totalExperienceYears: c.profile?.totalExperienceYears ?? 0,
      industryIds: [...new Set(industryIds)],
    };

    const match = computeMatch(candidate, job);

    await prisma.candidateJobScore.upsert({
      where: {
        candidateId_jobId: { candidateId: c.id, jobId },
      },
      create: {
        candidateId: c.id,
        jobId,
        finalScore: match.finalScore,
        categoryScore: match.categoryScore,
        subcategoryScore: match.subcategoryScore,
        skillsScore: match.skillsScore,
        qualificationsScore: match.qualificationsScore,
        experienceScore: match.experienceScore,
        industryScore: match.industryScore,
        matchedSkillCount: match.matchedSkillCount,
        totalRequiredSkills: match.totalRequiredSkills,
        matchedQualificationCount: match.matchedQualificationCount,
        totalRequiredQualifications: match.totalRequiredQualifications,
        verdict: match.verdict,
        recommendationType: match.recommendationType,
      },
      update: {
        finalScore: match.finalScore,
        categoryScore: match.categoryScore,
        subcategoryScore: match.subcategoryScore,
        skillsScore: match.skillsScore,
        qualificationsScore: match.qualificationsScore,
        experienceScore: match.experienceScore,
        industryScore: match.industryScore,
        matchedSkillCount: match.matchedSkillCount,
        totalRequiredSkills: match.totalRequiredSkills,
        matchedQualificationCount: match.matchedQualificationCount,
        totalRequiredQualifications: match.totalRequiredQualifications,
        verdict: match.verdict,
        recommendationType: match.recommendationType,
        computedAt: new Date(),
      },
    });

    savedCount++;
  }

  return savedCount;
}