import { NextRequest } from 'next/server';

/**
 * Server-side candidate ID resolution.
 * Tries NextAuth session first, falls back to x-candidate-id header.
 *
 * The header fallback exists for:
 * - Demo/testing before auth is fully wired
 * - Internal service-to-service calls
 *
 * Once auth is enforced in proxy.ts, only the session path will succeed.
 */
export async function getServerCandidateId(request: NextRequest): Promise<string | null> {
  // Try NextAuth session (server-side)
  try {
    const { getAuthCandidateId } = await import('@/lib/get-auth-candidate');
    const id = await getAuthCandidateId();
    if (id) return id;
  } catch {
    // NextAuth session not available (e.g. during build, or not configured)
  }

  // Fallback: x-candidate-id header
  return request.headers.get('x-candidate-id');
}