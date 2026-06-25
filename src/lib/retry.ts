import { prisma } from './prisma';

/**
 * Retry a Prisma query on connection errors.
 * Vercel serverless functions can hit transient "too many connections" errors
 * when multiple instances spin up concurrently. This retries with backoff.
 */
const IS_CONNECTION_ERROR = (e: unknown): boolean => {
  if (e && typeof e === 'object' && 'code' in e) {
    const code = (e as { code: string }).code;
    // P2037 = too many connections, P1001 = can't reach DB
    return code === 'P2037' || code === 'P1001' || code === 'P1008';
  }
  return false;
};

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      if (!IS_CONNECTION_ERROR(e) || attempt === MAX_RETRIES) throw e;
      // Exponential backoff: 500ms, 1000ms
      await new Promise(r => setTimeout(r, BASE_DELAY_MS * (attempt + 1)));
      // Reconnect on retry
      try { await prisma.$connect(); } catch { /* ignore reconnect errors */ }
    }
  }
  throw lastError;
}

/**
 * Execute a query with retry, returning null on final failure instead of throwing.
 * Use this for non-critical queries (e.g., sidebar data, counts).
 */
export async function withRetryNull<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await withRetry(fn);
  } catch {
    return null;
  }
}