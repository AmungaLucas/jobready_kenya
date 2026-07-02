import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/get-server-admin';
import { checkAccountBalance } from '@/lib/mpesa/b2c';
import type { NextRequest } from 'next/server';

// GET /api/admin/mpesa/balance — check paybill float
export async function GET(request: NextRequest) {
  const guard = await requireAdmin(request);
  if (guard) return guard;

  try {
    const result = await checkAccountBalance();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[admin/mpesa/balance] error:', error);
    return NextResponse.json({ error: 'Failed to check balance' }, { status: 500 });
  }
}