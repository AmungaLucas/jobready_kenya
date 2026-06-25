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

export function proxy(request: NextRequest) {
  // Rate limiting for API routes only
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  cleanup();

  // Extract IP safely from headers (request.ip may not be available in all environments)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.lastReset > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
  } else if (record.count >= RATE_LIMIT) {
    return new NextResponse(JSON.stringify({ error: 'Too Many Requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '60',
      },
    });
  } else {
    record.count++;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};