import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Returns true if the current user has the ADMIN role.
 * Uses the JWT session (role is embedded in token).
 */
export async function getServerAdmin(request: NextRequest): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return false;

    const role = (session.user as Record<string, unknown>).role as string | undefined;
    return role === 'ADMIN';
  } catch {
    return false;
  }
}

/**
 * Guard: Returns 403 if not admin, or null if authorized.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const isAdmin = await getServerAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}