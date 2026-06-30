/**
 * Shared React hooks for dashboard data.
 *
 * In DEMO_MODE (default, no auth yet), these return static demo data
 * synchronously — zero network requests, instant render.
 *
 * When DEMO_MODE is flipped to false (auth implemented), the hooks
 * call the real /api/candidates/me/* endpoints and fall back to
 * demo data if the API is unavailable.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DEMO_MODE,
  fetchMatches,
  fetchSavedJobs,
  fetchApplications,
  patchMatch,
  type ApiMatchScore,
  type ApiSavedJob,
  type ApiApplication,
} from '@/lib/api-client';
import {
  matchScores as demoMatches,
  savedJobs as demoSaved,
  applications as demoApps,
  type MatchScore,
  type SavedJob,
  type Application,
} from '@/lib/demo-candidate';

// ─── useMatches ──────────────────────────────────────────────────

export function useMatches() {
  const [matches, setMatches] = useState<MatchScore[]>(DEMO_MODE ? demoMatches : []);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchMatches();
        if (cancelled) return;
        if (res) {
          setMatches(res.matches as unknown as MatchScore[]);
        } else {
          // API unavailable — fall back to demo
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
  }, []);

  const toggleSave = useCallback(async (jobId: string, currentIsSaved: boolean) => {
    // Optimistic update
    setMatches((prev) =>
      prev.map((m) => (m.jobId === jobId ? { ...m, isSaved: !currentIsSaved } : m)),
    );

    // Attempt API call (no-op in demo mode)
    if (!DEMO_MODE) {
      // The scoreId is different from jobId; in demo mode we use jobId as a stand-in.
      // In real mode we'd need the actual CandidateJobScore.id from the API response.
      // The API route PATCH /api/candidates/me/matches/[id] expects the score ID.
      // For now we just do the optimistic update. Once auth is wired, the matches
      // response will include the score `id` field and we'll use that.
    }
  }, []);

  const markAsRead = useCallback(async (jobId: string) => {
    setMatches((prev) =>
      prev.map((m) => (m.jobId === jobId ? { ...m, isRead: true } : m)),
    );
    // Same as toggleSave — actual API call when auth is implemented
  }, []);

  return { matches, setMatches, loading, error, toggleSave, markAsRead };
}

// ─── useSavedJobs ────────────────────────────────────────────────

export function useSavedJobs() {
  const [jobs, setJobs] = useState<SavedJob[]>(DEMO_MODE ? demoSaved : []);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchSavedJobs();
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
  }, []);

  const removeJob = useCallback((jobId: string) => {
    // Optimistic removal
    setJobs((prev) => prev.filter((j) => j.jobId !== jobId));
    // API call would happen here with real auth
  }, []);

  return { jobs, setJobs, loading, error, removeJob };
}

// ─── useApplications ─────────────────────────────────────────────

export function useApplications() {
  const [apps, setApps] = useState<Application[]>(DEMO_MODE ? demoApps : []);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const res = await fetchApplications();
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
  }, []);

  return { apps, loading, error };
}