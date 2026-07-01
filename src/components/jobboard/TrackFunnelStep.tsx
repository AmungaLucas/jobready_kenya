'use client';

import { useCallback, useRef } from 'react';

interface TrackFunnelStepProps {
  jobId: string;
  stage: 'VIEWED' | 'CLICKED_APPLY' | 'STARTED_APPLICATION' | 'SUBMITTED' | 'COMPLETED';
  fireImmediately?: boolean;
  children?: React.ReactNode;
}

/**
 * Either fires immediately on mount or provides a `fire()` trigger via render prop.
 * Silent — never blocks rendering.
 */
export default function TrackFunnelStep({
  jobId,
  stage,
  fireImmediately = false,
  children,
}: TrackFunnelStepProps) {
  const fired = useRef(false);

  const fire = useCallback(() => {
    if (fired.current) return;
    fired.current = true;

    fetch(`/api/jobs/${jobId}/funnel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    }).catch(() => {});
  }, [jobId, stage]);

  // Auto-fire mode
  if (fireImmediately && !fired.current) {
    // Use setTimeout to avoid blocking render
    setTimeout(fire, 0);
    return null;
  }

  // Render-prop mode: children receives fire function
  if (children) {
    return <>{children(fire)}</>;
  }

  return null;
}