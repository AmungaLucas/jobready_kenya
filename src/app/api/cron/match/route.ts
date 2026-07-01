import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { computeAndSaveMatches, computeAndSaveMatchesForJob, getJobsForMatching, getCandidateMatchData } from '@/lib/matching';

/**
 * POST /api/cron/match?token=SECRET
 *
 * Background cron endpoint for CPU-based matching.
 * Triggered by cPanel cron or external scheduler.
 *
 * Responsibilities:
 *   1. Find candidates with COMPLETED onboarding updated since last run
 *   2. Find jobs created/updated since last run that are ACTIVE + EXTRACTED
 *   3. Run matching for both directions
 *   4. Update LAST_CRON_MATCH_RUN in system_settings
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: simple token check
    const token = request.nextUrl.searchParams.get('token');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || token !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const lastRunSetting = await prisma.systemSetting.findUnique({
      where: { settingKey: 'LAST_CRON_MATCH_RUN' },
    });

    const lastRun = lastRunSetting?.settingValue
      ? new Date(lastRunSetting.settingValue)
      : new Date(0); // First run: match everything

    // --- 1. Find candidates who became COMPLETED since last run ---
    const newCandidates = await prisma.candidate.findMany({
      where: {
        onboardingStatus: 'COMPLETED',
        updatedAt: { gte: lastRun },
      },
      select: { id: true },
    });

    // --- 2. Find new/updated active jobs since last run ---
    const newJobs = await prisma.job.findMany({
      where: {
        status: 'ACTIVE',
        deletedAt: null,
        extractionStatus: { in: ['EXTRACTED', 'NEEDS_REVIEW'] },
        updatedAt: { gte: lastRun },
        OR: [
          { deadline: { gte: new Date() } },
          { deadline: null },
        ],
      },
      select: { id: true },
    });

    let processedCandidates = 0;
    let processedJobs = 0;

    // --- 3. Match new candidates against all active jobs ---
    for (const c of newCandidates) {
      try {
        const count = await computeAndSaveMatches(c.id);
        processedCandidates += count > 0 ? 1 : 0;
      } catch (err) {
        console.error(`[Cron] Error matching candidate ${c.id}:`, err);
      }
    }

    // --- 4. Match new jobs against all completed candidates ---
    for (const j of newJobs) {
      try {
        const count = await computeAndSaveMatchesForJob(j.id);
        processedJobs += count > 0 ? 1 : 0;
      } catch (err) {
        console.error(`[Cron] Error matching job ${j.id}:`, err);
      }
    }

    // --- 5. Update last run timestamp ---
    await prisma.systemSetting.upsert({
      where: { settingKey: 'LAST_CRON_MATCH_RUN' },
      create: {
        settingKey: 'LAST_CRON_MATCH_RUN',
        settingValue: new Date().toISOString(),
      },
      update: {
        settingValue: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      processedCandidates,
      processedJobs,
      totalNewCandidates: newCandidates.length,
      totalNewJobs: newJobs.length,
      lastRun: lastRunSetting?.settingValue ?? 'never',
      currentRun: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[POST /api/cron/match]', error);
    return NextResponse.json({ error: 'Cron execution failed' }, { status: 500 });
  }
}