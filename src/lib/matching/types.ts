// Matching Engine Types
// Core data structures for the CPU-based matching system.

export const MATCH_WEIGHTS = {
  category: 0.25,       // 25%
  subcategory: 0.25,    // 25%
  skills: 0.25,         // 25%
  qualifications: 0.10, // 10%
  experience: 0.10,     // 10%
  industry: 0.05,       // 5%
} as const;

export type Verdict = 'EXCELLENT' | 'STRONG' | 'MODERATE' | 'WEAK' | 'NOT_RECOMMENDED';

export type RecommendationType =
  | 'PRIMARY_MATCH'
  | 'INTEREST_MATCH'
  | 'ADJACENT_MATCH'
  | 'STRETCH_MATCH'
  | 'NOT_RECOMMENDED';

export interface ScoreBreakdown {
  categoryScore: number;
  subcategoryScore: number;
  skillsScore: number;
  qualificationsScore: number;
  experienceScore: number;
  industryScore: number;
}

export interface MatchResult extends ScoreBreakdown {
  finalScore: number;
  verdict: Verdict;
  recommendationType: RecommendationType;
  matchedSkillCount: number;
  totalRequiredSkills: number;
  matchedQualificationCount: number;
  totalRequiredQualifications: number;
}

export interface CandidateMatchData {
  id: string;
  primaryCategoryId: string | null;
  primarySubcategoryId: string | null;
  interestCategoryIds: string[];
  subcategoryIds: string[];
  skillIds: string[];
  qualificationIds: string[];
  totalExperienceYears: number;
  industryIds: string[];
}

export interface JobMatchData {
  id: string;
  jobCategoryId: string | null;
  primarySubcategoryId: string | null;
  subcategoryIds: string[];
  requiredSkillIds: string[];   // MUST_HAVE skills
  optionalSkillIds: string[];   // NICE_TO_HAVE skills
  requiredQualificationIds: string[];
  minimumExperienceYears: number;
  preferredExperienceYears: number;
  industryId: string | null;
}

export interface MatchRow {
  jobId: string;
  jobCategoryId: string | null;
  primarySubcategoryId: string | null;
  jobSubcategoryIds: string[];
  requiredSkillIds: string[];
  requiredQualificationIds: string[];
  minimumExperienceYears: number;
  industryId: string | null;
}