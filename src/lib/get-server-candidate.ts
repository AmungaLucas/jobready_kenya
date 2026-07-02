import { NextRequest } from 'next/server';

/**
 * Server-side candidate ID resolution.
 * Uses NextAuth session only — no header fallbacks.
 */
export async function getServerCandidateId(request: NextRequest): Promise<string | null> {
  try {
    const { getAuthCandidateId } = await import('@/lib/get-auth-candidate');
    const id = await getAuthCandidateId();
    if (id) return id;
  } catch {
    // NextAuth session not available (e.g. during build, or not configured)
  }

  return null;
}