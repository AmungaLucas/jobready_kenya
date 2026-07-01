import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { computeAndSaveMatches, computeAndSaveMatchesForJob } from "@/lib/matching/engine";

export async function POST(request: NextRequest) {
  // ─── Authentication via Authorization header ───────────────────
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 500 }
    );
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid authorization" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  // Timing-safe comparison to prevent timing attacks
  try {
    const secretBuf = Buffer.from(cronSecret, "utf-8");
    const tokenBuf = Buffer.from(token, "utf-8");

    if (
      secretBuf.length !== tokenBuf.length ||
      !timingSafeEqual(secretBuf, tokenBuf)
    ) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid token" },
      { status: 403 }
    );
  }

  // ─── Execute matching ─────────────────────────────────────────
  let candidatesProcessed = 0;
  let jobsProcessed = 0;
  let subscriptionsExpired = 0;
  const errors: string[] = [];

  // Process candidates
  try {
    const candidates = await prisma.candidate.findMany({
      where: {
        onboardingStatus: "COMPLETED",
        deletedAt: null,
        profile: {
          extractionStatus: "COMPLETED",
        },
      },
      select: { id: true },
      take: 100, // Batch limit to prevent OOM
    });

    for (const candidate of candidates) {
      try {
        await computeAndSaveMatches(candidate.id);
        candidatesProcessed++;
      } catch (err) {
        const msg = `Candidate ${candidate.id}: ${err instanceof Error ? err.message : "unknown error"}`;
        errors.push(msg);
        console.error(`[cron/match] ${msg}`);
      }
    }
  } catch (err) {
    const msg = `Candidate fetch: ${err instanceof Error ? err.message : "unknown error"}`;
    errors.push(msg);
    console.error(`[cron/match] ${msg}`);
  }

  // Process new jobs (those not yet matched)
  try {
    const recentJobs = await prisma.job.findMany({
      where: {
        deletedAt: null,
        status: "ACTIVE",
        extractionStatus: "COMPLETED",
        // Only jobs created/updated in last 24h to avoid reprocessing
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
      take: 100,
    });

    for (const job of recentJobs) {
      try {
        await computeAndSaveMatchesForJob(job.id);
        jobsProcessed++;
      } catch (err) {
        const msg = `Job ${job.id}: ${err instanceof Error ? err.message : "unknown error"}`;
        errors.push(msg);
        console.error(`[cron/match] ${msg}`);
      }
    }
  } catch (err) {
    const msg = `Job fetch: ${err instanceof Error ? err.message : "unknown error"}`;
    errors.push(msg);
    console.error(`[cron/match] ${msg}`);
  }

  // ─── Expire past-due subscriptions ───────────────────────────
  try {
    const expired = await prisma.subscription.updateMany({
      where: {
        status: 'ACTIVE',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });
    subscriptionsExpired = expired.count;
    if (subscriptionsExpired > 0) {
      console.log(`[cron/match] Expired ${subscriptionsExpired} subscriptions`);
    }
  } catch (err) {
    const msg = `Subscription expiry: ${err instanceof Error ? err.message : "unknown error"}`;
    errors.push(msg);
    console.error(`[cron/match] ${msg}`);
  }

  return NextResponse.json({
    status: "completed",
    candidatesProcessed,
    jobsProcessed,
    subscriptionsExpired,
    errorCount: errors.length,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    timestamp: new Date().toISOString(),
  });
}