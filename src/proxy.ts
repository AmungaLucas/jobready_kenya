import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── In-memory rate limiting per IP ─────────────────────────────
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 100; // requests per window per IP (general API)
const AUTH_RATE_LIMIT = 10; // 10 req/min for auth endpoints
const UPLOAD_RATE_LIMIT = 5; // 5 req/min for upload endpoints
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

function getIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  return 'unknown';
}

function checkRateLimit(
  ip: string,
  pathname: string
): { allowed: boolean; retryAfter: number } {
  cleanup();

  const now = Date.now();
  let limit = RATE_LIMIT;

  // Stricter limits for auth and upload routes
  if (pathname.startsWith('/api/auth/register') || (pathname.startsWith('/api/auth/') && pathname !== '/api/auth/session')) {
    limit = AUTH_RATE_LIMIT;
  } else if (pathname.includes('upload-cv') || pathname.includes('extract-profile')) {
    limit = UPLOAD_RATE_LIMIT;
  }

  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return { allowed: true, retryAfter: 0 };
  }

  if (record.count >= limit) {
    const retryAfter = Math.ceil((record.lastReset + WINDOW_MS - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true, retryAfter: 0 };
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── 0. Handle CORS preflight (OPTIONS) immediately ─────────
  if (pathname.startsWith('/api/') && request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': 'https://jobboard.ke',
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // ─── 1. Auth protection for /account/* routes ────────────────
  if (pathname.startsWith('/account')) {
    const sessionCookie =
      request.cookies.get('next-auth.session-token') ??
      request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ─── 2. Auth protection for candidate API routes ────────────
  // Skip auth-optional routes (view/funnel tracking handles auth internally)
  const authOptionalPaths = ['/api/jobs/', '/api/taxonomy', '/api/locations', '/api/cron/'];
  const isAuthOptional = authOptionalPaths.some(p => pathname.startsWith(p));

  if (pathname.startsWith('/api/candidates/') && !isAuthOptional) {
    const sessionCookie =
      request.cookies.get('next-auth.session-token') ??
      request.cookies.get('__Secure-next-auth.session-token');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
  }

  // ─── 3. Rate limiting for API routes ─────────────────────────
  // Skip rate limiting for internal/cron endpoints
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/cron/')) {
    const ip = getIp(request);
    const { allowed, retryAfter } = checkRateLimit(ip, pathname);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
          },
        }
      );
    }
  }

  // ─── 4. Add CORS headers to API responses ───────────────────
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', 'https://jobboard.ke');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/account/:path*'],
};