// Matching Engine — Public API
export { MATCH_WEIGHTS } from './types';
export type { MatchResult, Verdict, RecommendationType, CandidateMatchData, JobMatchData, ScoreBreakdown, MatchRow } from './types';
export { computeMatch, computeMatchesForCandidate, getVerdict, getRecommendationType } from './scorer';
export type { BulkMatchInput, BulkMatchOutput } from './scorer';
export { computeAndSaveMatches, computeAndSaveMatchesForJob, getCandidateMatchData, getJobsForMatching } from './engine';