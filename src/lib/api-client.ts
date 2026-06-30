/**
 * Shared API client for dashboard data fetching.
 *
 * When DEMO_MODE is true (no auth session), all hooks fall back to
 * static demo data in demo-candidate.ts.
 *
 * When a user is logged in (session.candidateId exists), the hooks
 * call the real /api/candidates/me/* endpoints.
 */

'use client';

import { useSession } from 'next-auth/react';

// Flip this to false once auth is fully functional
export const DEMO_MODE = false;

/**
 * Get the candidate ID from the NextAuth session.
 * Call this inside React components/hooks only (client-side).
 */
export function useCandidateId(): string | null {
  const { data: session } = useSession();
  const candidateId = (session?.user as Record<string, unknown>)?.candidateId as string | undefined;
  return candidateId ?? null;
}

// ─── Generic fetch wrapper (internal) ───────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  candidateId: string | null,
): Promise<T | null> {
  if (!candidateId) return null;

  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-candidate-id': candidateId,
        ...options.headers,
      },
    });
    if (!res.ok) {
      console.warn(`[apiFetch] ${path} returned ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[apiFetch] ${path} failed:`, err);
    return null;
  }
}

// ─── Typed response shapes (must match API route responses) ──────

export interface ApiMatchScore {
  id?: string; // CandidateJobScore ID (for PATCH)
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  finalScore: number;
  categoryScore: number;
  subcategoryScore: number;
  skillsScore: number;
  qualificationsScore: number;
  experienceScore: number;
  industryScore: number;
  verdict: string;
  recommendationType: string;
  matchedSkillCount: number;
  totalRequiredSkills: number;
  matchedQualificationCount: number;
  totalRequiredQualifications: number;
  explanation: string;
  isRead: boolean;
  isSaved: boolean;
  computedAt: string;
}

export interface MatchesResponse {
  matches: ApiMatchScore[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiApplication {
  id: string;
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType?: string;
  matchScoreAtApplication: number | null;
  status: string;
  appliedAt: string;
  updatedAt: string;
}

export interface ApplicationsResponse {
  applications: ApiApplication[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiSavedJob {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  savedAt: string;
}

export interface SavedJobsResponse {
  savedJobs: ApiSavedJob[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiPreferences {
  preferredLocations: string[];
  remotePreference: string;
  expectedSalaryMin: number;
  expectedSalaryMax: number;
  salaryCurrency: string;
  availabilityStatus: string;
  noticePeriodDays: number;
  willingToRelocate: boolean;
  preferredJobTypes: string[];
}

// ─── Fetch helpers (take candidateId param) ──────────────────

export async function fetchMatches(candidateId: string | null, verdict?: string): Promise<MatchesResponse | null> {
  const params = new URLSearchParams();
  if (verdict && verdict !== 'ALL') params.set('verdict', verdict);
  const qs = params.toString();
  return apiFetch<MatchesResponse>(`/api/candidates/me/matches${qs ? `?${qs}` : ''}`, {}, candidateId);
}

export async function fetchSavedJobs(candidateId: string | null): Promise<SavedJobsResponse | null> {
  return apiFetch<SavedJobsResponse>('/api/candidates/me/saved', {}, candidateId);
}

export async function fetchApplications(candidateId: string | null): Promise<ApplicationsResponse | null> {
  return apiFetch<ApplicationsResponse>('/api/candidates/me/applications', {}, candidateId);
}

export async function fetchPreferences(candidateId: string | null): Promise<ApiPreferences | null> {
  return apiFetch<ApiPreferences>('/api/candidates/me/preferences', {}, candidateId);
}

// ─── Mutation helpers ────────────────────────────────────────────

export async function patchMatch(
  candidateId: string | null,
  scoreId: string,
  data: { is_read?: boolean; is_saved?: boolean },
): Promise<boolean> {
  if (!candidateId) return false;

  try {
    const res = await fetch(`/api/candidates/me/matches/${scoreId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-candidate-id': candidateId,
      },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updatePreferences(
  candidateId: string | null,
  data: Partial<ApiPreferences>,
): Promise<ApiPreferences | null> {
  if (!candidateId) return null;

  try {
    const res = await fetch('/api/candidates/me/preferences', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-candidate-id': candidateId,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return (await res.json()) as ApiPreferences;
  } catch {
    return null;
  }
}

export async function uploadCV(
  candidateId: string | null,
  file: File,
): Promise<{ success: boolean; message: string; fileName?: string } | null> {
  if (!candidateId) return null;

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/candidates/upload-cv', {
      method: 'POST',
      headers: {
        'x-candidate-id': candidateId,
      },
      body: formData,
    });
    if (!res.ok) return null;
    return (await res.json()) as { success: boolean; message: string; fileName?: string };
  } catch {
    return null;
  }
}