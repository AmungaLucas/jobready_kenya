import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/v1/webhooks/mpesa/b2c/result
 * B2C payout result callback from M-Pesa.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[b2c/result] callback received');

    const result = body?.Result;
    if (!result) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid' });
    }

    const conversationId = result.ConversationID as string;
    const resultCode = String(result.ResultCode);
    const resultDesc = result.ResultDesc as string;

    console.log(`[b2c/result] conversationId=${conversationId} code=${resultCode}`);

    // Find withdrawal by conversationId
    const withdrawal = conversationId
      ? await prisma.withdrawal.findFirst({
          where: { conversationId },
        })
      : null;

    if (!withdrawal) {
      console.warn(`[b2c/result] No withdrawal found for conversationId: ${conversationId}`);
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (withdrawal.status === 'SUCCESS') {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Already processed' });
    }

    if (resultCode === '0') {
      // Extract M-Pesa receipt from Parameters
      let mpesaReceipt: string | undefined;
      const parameters = result.ResultParameters?.ResultParameter as Array<{ Key: string; Value: unknown }> | undefined;
      if (Array.isArray(parameters)) {
        for (const p of parameters) {
          if (p.Key === 'TransactionReceipt') {
            mpesaReceipt = String(p.Value);
            break;
          }
        }
      }

      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: 'SUCCESS',
          mpesaReceipt,
          processedAt: new Date(),
        },
      });

      // Debit wallet
      const wallet = await prisma.wallet.findUnique({
        where: { candidateId: withdrawal.candidateId },
      });
      if (wallet) {
        const newBalance = Math.max(0, wallet.availableBalance - withdrawal.amount);
        await prisma.wallet.update({
          where: { candidateId: withdrawal.candidateId },
          data: {
            availableBalance: newBalance,
            totalWithdrawn: { increment: withdrawal.amount },
          },
        });
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'DEBIT',
            amount: withdrawal.amount,
            balanceAfter: newBalance,
            reference: withdrawal.id,
            description: `Withdrawal to ${withdrawal.phoneNumber}${mpesaReceipt ? ` (Receipt: ${mpesaReceipt})` : ''}`,
          },
        });
      }

      console.log(`[b2c/result] Withdrawal ${withdrawal.id} SUCCESS — ${mpesaReceipt}`);
    } else {
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: 'FAILED', failureReason: resultDesc },
      });
      console.log(`[b2c/result] Withdrawal ${withdrawal.id} FAILED — ${resultDesc}`);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('[b2c/result] Unhandled error:', error);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}