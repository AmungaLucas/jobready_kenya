import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In-memory rate limiting per IP for API routes
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 100; // requests per window per IP
const WINDOW_MS = 60 * 1000; // 1 minute window

// Cleanup old entries every 10 minutes to prevent memory leaks
let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  if (now - lastCleanup > 600_000) {
    for (const [key, val] of rateLimitMap) {
      if (now - val.lastReset > WINDOW_MS * 2) rateLimitMap.delete(key);
    }
    lastCleanup = now;
  }
}

// In demo mode, dashboard and API routes are accessible without auth.
// Set to false (in api-client.ts) once auth is fully functional.
const DEMO_MODE = true;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Auth protection (disabled in demo mode) ──────────────────
  if (!DEMO_MODE) {
    const isAccountRoute = pathname.startsWith('/account');
    const isCandidateApi = pathname.startsWith('/api/candidates/');

    if (isAccountRoute || isCandidateApi) {
      // Check for NextAuth session token cookie
      // The session cookie name is typically "next-auth.session-token" (http) or
      // "__Secure-next-auth.session-token" (https)
      const sessionCookie =
        request.cookies.get('next-auth.session-token') ??
        request.cookies.get('__Secure-next-auth.session-token');

      if (!sessionCookie) {
        // For API routes, return 401 JSON
        if (isCandidateApi) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }
        // For /account pages, redirect to login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // ─── Rate limiting for API routes ─────────────────────────────
  if (pathname.startsWith('/api/')) {
    cleanup();

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown';
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now - record.lastReset > WINDOW_MS) {
      rateLimitMap.set(ip, { count: 1, lastReset: now });
    } else if (record.count >= RATE_LIMIT) {
      return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    } else {
      record.count++;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/api/:path*', '/account/:path*'],
};