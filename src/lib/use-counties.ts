'use client';

import { useState, useEffect } from 'react';

export interface County {
  county: string;
  slug: string;
}

export function useCounties() {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCounties() {
      try {
        const res = await fetch('/api/locations/counties');
        if (!res.ok) throw new Error('Failed to fetch counties');
        const data: County[] = await res.json();
        if (!cancelled) {
          setCounties(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    }

    fetchCounties();
    return () => {
      cancelled = true;
    };
  }, []);

  return { counties, loading, error };
}
