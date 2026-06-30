/**
 * Shared API client for dashboard data fetching.
 *
 * When auth is not yet implemented (no candidate session), all hooks
 * fall back to the static demo data in demo-candidate.ts.
 *
 * Once NextAuth/Auth.js is wired, set DEMO_MODE = false and the hooks
 * will call the real /api/candidates/me/* endpoints.
 */

// Flip this to false once auth is implemented and candidate ID is available from session
export const DEMO_MODE = true;

// In production this comes from the auth session (e.g. session.user.candidateId)
export function getCandidateId(): string | null {
  if (typeof window === 'undefined') return null;
  // Temporary: allow override via localStorage for testing API routes manually
  return localStorage.getItem('candidateId');
}

// ─── Generic fetch wrapper ───────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T | null> {
  if (DEMO_MODE) return null;

  const candidateId = getCandidateId();
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

// ─── Fetch helpers ───────────────────────────────────────────────

export async function fetchMatches(verdict?: string): Promise<MatchesResponse | null> {
  const params = new URLSearchParams();
  if (verdict && verdict !== 'ALL') params.set('verdict', verdict);
  const qs = params.toString();
  return apiFetch<MatchesResponse>(`/api/candidates/me/matches${qs ? `?${qs}` : ''}`);
}

export async function fetchSavedJobs(): Promise<SavedJobsResponse | null> {
  return apiFetch<SavedJobsResponse>('/api/candidates/me/saved');
}

export async function fetchApplications(): Promise<ApplicationsResponse | null> {
  return apiFetch<ApplicationsResponse>('/api/candidates/me/applications');
}

export async function fetchPreferences(): Promise<ApiPreferences | null> {
  return apiFetch<ApiPreferences>('/api/candidates/me/preferences');
}

// ─── Mutation helpers ────────────────────────────────────────────

export async function patchMatch(
  scoreId: string,
  data: { is_read?: boolean; is_saved?: boolean },
): Promise<boolean> {
  const candidateId = getCandidateId();
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
  data: Partial<ApiPreferences>,
): Promise<ApiPreferences | null> {
  const candidateId = getCandidateId();
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

export async function uploadCV(file: File): Promise<{ success: boolean; message: string; fileName?: string } | null> {
  const candidateId = getCandidateId();
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