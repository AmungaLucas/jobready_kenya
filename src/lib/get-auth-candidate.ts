import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Returns the authenticated user's candidate ID.
 * Returns null if not authenticated or no candidate profile exists.
 *
 * Usage in API routes:
 *   const candidateId = await getAuthCandidateId();
 *   if (!candidateId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 */
export async function getAuthCandidateId(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user) return null;

  const userId = (session.user as Record<string, unknown>).id as string | undefined;
  if (!userId) return null;

  const candidate = await prisma.candidate.findUnique({
    where: { userId },
    select: { id: true },
  });

  return candidate?.id ?? null;
}

/**
 * Returns the full session with typed user fields.
 */
export async function getAuthSession() {
  return getServerSession(authOptions);
}