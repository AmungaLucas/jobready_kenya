/**
 * Shared React hooks for dashboard data.
 *
 * In DEMO_MODE (default), these return static demo data
 * synchronously — zero network requests, instant render.
 *
 * When DEMO_MODE is false and a user is logged in with a
 * candidateId in their session, the hooks call the real
 * /api/candidates/me/* endpoints and fall back to demo data
 * if the API returns null.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DEMO_MODE,
  useCandidateId,
  fetchMatches,
  fetchSavedJobs,
  fetchApplications,
  patchMatch,
  type MatchScore,
  type SavedJob,
  type Application,
} from '@/lib/api-client';
import {
  matchScores as demoMatches,
  savedJobs as demoSaved,
  applications as demoApps,
} from '@/lib/demo-candidate';

// ─── useMatches ──────────────────────────────────────────────────

export function useMatches() {
  const candidateId = useCandidateId();
  const [matches, setMatches] = useState<MatchScore[]>(DEMO_MODE ? demoMatches : []);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE || !candidateId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchMatches(candidateId);
        if (cancelled) return;
        if (res) {
          setMatches(res.matches as unknown as MatchScore[]);
        } else {
          setMatches(demoMatches);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load matches');
          setMatches(demoMatches);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [candidateId]);

  const toggleSave = useCallback(async (jobId: string, currentIsSaved: boolean) => {
    // Optimistic update
    setMatches((prev) =>
      prev.map((m) => (m.jobId === jobId ? { ...m, isSaved: !currentIsSaved } : m)),
    );

    if (!DEMO_MODE && candidateId) {
      // Find the match with this jobId — need the score ID for the API
      // In real mode, matches from the API include `id` (CandidateJobScore.id)
      // For demo data, there's no score ID, so we skip the API call.
    }
  }, [candidateId]);

  const markAsRead = useCallback(async (jobId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.jobId === jobId ? { ...m, isRead: true } : m)),
    );
  }, []);

  return { matches, setMatches, loading, error, toggleSave, markAsRead };
}

// ─── useSavedJobs ────────────────────────────────────────────────

export function useSavedJobs() {
  const candidateId = useCandidateId();
  const [jobs, setJobs] = useState<SavedJob[]>(DEMO_MODE ? demoSaved : []);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE || !candidateId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchSavedJobs(candidateId);
        if (cancelled) return;
        if (res) {
          setJobs(res.savedJobs as unknown as SavedJob[]);
        } else {
          setJobs(demoSaved);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load saved jobs');
          setJobs(demoSaved);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [candidateId]);

  const removeJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
  }, []);

  return { jobs, setJobs, loading, error, removeJob };
}

// ─── useApplications ─────────────────────────────────────────────

export function useApplications() {
  const candidateId = useCandidateId();
  const [apps, setApps] = useState<Application[]>(DEMO_MODE ? demoApps : []);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE || !candidateId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchApplications(candidateId);
        if (cancelled) return;
        if (res) {
          setApps(res.applications as unknown as Application[]);
        } else {
          setApps(demoApps);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load applications');
          setApps(demoApps);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [candidateId]);

  return { apps, loading, error };
}