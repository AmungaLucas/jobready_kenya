import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/v1/webhooks/mpesa/b2c/timeout
 * B2C payout timeout callback — request timed out in M-Pesa queue.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[b2c/timeout] callback received');

    const result = body?.Result;
    if (!result) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid' });
    }

    const conversationId = result.ConversationID as string;
    const resultCode = String(result.ResultCode);
    const resultDesc = result.ResultDesc as string;

    console.log(`[b2c/timeout] conversationId=${conversationId} code=${resultCode} desc=${resultDesc}`);

    if (conversationId) {
      // Mark withdrawal as failed so it can be retried
      const updated = await prisma.withdrawal.updateMany({
        where: { conversationId, status: 'PROCESSING' },
        data: { status: 'FAILED', failureReason: `B2C Timeout: ${resultDesc}` },
      });
      if (updated.count > 0) {
        console.log(`[b2c/timeout] ${updated.count} withdrawal(s) marked FAILED`);
      }
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('[b2c/timeout] Unhandled error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}