// CPU-Based Matching Engine Scorer
// Implements the "AI-on-Ingest, CPU-on-Match" principle.
// All scoring is done via SQL joins and simple arithmetic — no AI at match time.

import { MATCH_WEIGHTS, type CandidateMatchData, type JobMatchData, type MatchResult, type Verdict, type RecommendationType } from './types';

// ── Individual Score Calculators ──────────────────────────────────────────

export function calculateCategoryScore(
  candidatePrimaryCategoryId: string | null,
  candidateInterestCategoryIds: string[],
  jobCategoryId: string | null
): number {
  if (!jobCategoryId) return 50;
  if (candidatePrimaryCategoryId === jobCategoryId) return 100;
  if (candidateInterestCategoryIds.includes(jobCategoryId)) return 75;
  return 0;
}

export function calculateSubcategoryScore(
  candidatePrimarySubcategoryId: string | null,
  candidateSubcategoryIds: string[],
  candidateInterestCategoryIds: string[],
  jobPrimarySubcategoryId: string | null,
  jobSubcategoryIds: string[],
  jobCategoryId: string | null
): number {
  if (!jobSubcategoryIds.length && !jobPrimarySubcategoryId) return 50;

  // Highest: Primary subcategory exact match
  if (
    jobPrimarySubcategoryId &&
    candidatePrimarySubcategoryId === jobPrimarySubcategoryId
  ) {
    return 100;
  }

  // High: Any of candidate's subcategories match job's subcategories
  if (jobSubcategoryIds.length > 0) {
    const matched = jobSubcategoryIds.filter((id) =>
      candidateSubcategoryIds.includes(id)
    );
    const score = (matched.length / jobSubcategoryIds.length) * 100;

    // Boost slightly if candidate also has the job's category as an interest
    if (jobCategoryId && candidateInterestCategoryIds.includes(jobCategoryId)) {
      return Math.min(score + 10, 100);
    }

    return score;
  }

  // Medium: Candidate has the job's category as an interest
  if (jobCategoryId && candidateInterestCategoryIds.includes(jobCategoryId)) {
    return 50;
  }

  return 0;
}

export function calculateSkillsScore(
  candidateSkillIds: string[],
  jobRequiredSkillIds: string[]
): { score: number; matchedCount: number; totalCount: number } {
  if (!jobRequiredSkillIds.length) {
    return { score: 100, matchedCount: 0, totalCount: 0 };
  }

  const matched = jobRequiredSkillIds.filter((id) =>
    candidateSkillIds.includes(id)
  );

  return {
    score: (matched.length / jobRequiredSkillIds.length) * 100,
    matchedCount: matched.length,
    totalCount: jobRequiredSkillIds.length,
  };
}

export function calculateQualificationsScore(
  candidateQualificationIds: string[],
  jobRequiredQualificationIds: string[]
): { score: number; matchedCount: number; totalCount: number } {
  if (!jobRequiredQualificationIds.length) {
    return { score: 100, matchedCount: 0, totalCount: 0 };
  }

  const matched = jobRequiredQualificationIds.filter((id) =>
    candidateQualificationIds.includes(id)
  );

  return {
    score: (matched.length / jobRequiredQualificationIds.length) * 100,
    matchedCount: matched.length,
    totalCount: jobRequiredQualificationIds.length,
  };
}

export function calculateExperienceScore(
  candidateYears: number,
  minimumYears: number
): number {
  if (!minimumYears || minimumYears === 0) return 100;
  if (candidateYears >= minimumYears) return 100;
  return (candidateYears / minimumYears) * 100;
}

export function calculateIndustryScore(
  candidateIndustryIds: string[],
  jobIndustryId: string | null
): number {
  if (!jobIndustryId) return 50;
  if (candidateIndustryIds.includes(jobIndustryId)) return 100;
  return 30;
}

// ── Verdict & Recommendation ──────────────────────────────────────────────

export function getVerdict(score: number): Verdict {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 80) return 'STRONG';
  if (score >= 65) return 'MODERATE';
  if (score >= 50) return 'WEAK';
  return 'NOT_RECOMMENDED';
}

export function getRecommendationType(
  subcategoryScore: number,
  categoryScore: number,
  skillsScore: number
): RecommendationType {
  if (subcategoryScore >= 80) return 'PRIMARY_MATCH';
  if (categoryScore >= 75) return 'INTEREST_MATCH';
  if (skillsScore >= 60) return 'ADJACENT_MATCH';
  if (skillsScore >= 40) return 'STRETCH_MATCH';
  return 'NOT_RECOMMENDED';
}

// ── Full Score Computation ─────────────────────────────────────────────────

export function computeMatch(
  candidate: CandidateMatchData,
  job: JobMatchData
): MatchResult {
  const categoryScore = calculateCategoryScore(
    candidate.primaryCategoryId,
    candidate.interestCategoryIds,
    job.jobCategoryId
  );

  const subcategoryScore = calculateSubcategoryScore(
    candidate.primarySubcategoryId,
    candidate.subcategoryIds,
    candidate.interestCategoryIds,
    job.primarySubcategoryId,
    job.subcategoryIds,
    job.jobCategoryId
  );

  const skillsResult = calculateSkillsScore(
    candidate.skillIds,
    job.requiredSkillIds
  );

  const qualsResult = calculateQualificationsScore(
    candidate.qualificationIds,
    job.requiredQualificationIds
  );

  const experienceScore = calculateExperienceScore(
    candidate.totalExperienceYears,
    job.minimumExperienceYears
  );

  const industryScore = calculateIndustryScore(
    candidate.industryIds,
    job.industryId
  );

  const finalScore = Math.round(
    categoryScore * MATCH_WEIGHTS.category +
    subcategoryScore * MATCH_WEIGHTS.subcategory +
    skillsResult.score * MATCH_WEIGHTS.skills +
    qualsResult.score * MATCH_WEIGHTS.qualifications +
    experienceScore * MATCH_WEIGHTS.experience +
    industryScore * MATCH_WEIGHTS.industry
  );

  const verdict = getVerdict(finalScore);
  const recommendationType = getRecommendationType(
    subcategoryScore,
    categoryScore,
    skillsResult.score
  );

  return {
    finalScore,
    categoryScore: Math.round(categoryScore),
    subcategoryScore: Math.round(subcategoryScore),
    skillsScore: Math.round(skillsResult.score),
    qualificationsScore: Math.round(qualsResult.score),
    experienceScore: Math.round(experienceScore),
    industryScore: Math.round(industryScore),
    verdict,
    recommendationType,
    matchedSkillCount: skillsResult.matchedCount,
    totalRequiredSkills: skillsResult.totalCount,
    matchedQualificationCount: qualsResult.matchedCount,
    totalRequiredQualifications: qualsResult.totalCount,
  };
}

// ── Bulk Matching (used by cron / upload flow) ─────────────────────────────

export interface BulkMatchInput {
  candidate: CandidateMatchData;
  jobs: JobMatchData[];
}

export interface BulkMatchOutput {
  candidateId: string;
  results: Array<{
    jobId: string;
    match: MatchResult;
  }>;
}

/**
 * Compute matches for a single candidate against many jobs.
 * Returns results sorted by finalScore descending.
 */
export function computeMatchesForCandidate(
  input: BulkMatchInput
): BulkMatchOutput {
  const results = input.jobs
    .map((job) => ({
      jobId: job.id,
      match: computeMatch(input.candidate, job),
    }))
    .sort((a, b) => b.match.finalScore - a.match.finalScore);

  return {
    candidateId: input.candidate.id,
    results,
  };
}