'use client';

import { useEffect, useRef } from 'react';

interface TrackJobViewProps {
  jobId: string;
  source?: 'MATCH' | 'SEARCH' | 'DIRECT';
}

/**
 * Fires a single POST to /api/jobs/[id]/view on mount.
 * Silent — never blocks rendering or shows errors.
 */
export default function TrackJobView({ jobId, source = 'DIRECT' }: TrackJobViewProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    fetch(`/api/jobs/${jobId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    }).catch(() => {
      // Silent — view tracking is non-critical
    });
  }, [jobId, source]);

  return null;
}