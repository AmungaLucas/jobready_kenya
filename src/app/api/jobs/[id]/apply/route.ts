import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

/**
 * PATCH /api/jobs/[id]/apply
 *
 * Tracks application funnel stages:
 *   - CLICKED_APPLY: candidate clicked the apply button
 *   - STARTED_APPLICATION: candidate opened the apply form
 *   Body: { stage: 'CLICKED_APPLY' | 'STARTED_APPLICATION', coverLetter?: string, source?: string }
 *
 * POST /api/jobs/[id]/apply
 *
 * Submits the application (creates Application + SUBMITTED funnel event + JobView).
 * Body: { coverLetter?: string, source?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).userId as string;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { stage } = body as { stage: string };

    if (!['CLICKED_APPLY', 'STARTED_APPLICATION'].includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id, deletedAt: null },
      select: { id: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Record funnel stage
    await prisma.applicationFunnel.create({
      data: {
        candidateId: candidate.id,
        jobId: id,
        stage: stage as 'CLICKED_APPLY' | 'STARTED_APPLICATION',
      },
    });

    return NextResponse.json({ success: true, stage });
  } catch (error) {
    console.error("[PATCH /api/jobs/[id]/apply]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as Record<string, unknown>).userId as string;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify the job exists
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { userId },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: "Candidate profile not found" },
        { status: 404 }
      );
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this job" },
        { status: 409 }
      );
    }

    const body = await request.json();
    const { coverLetter, source } = body;

    // Get match score if available
    let matchScoreAtApplication: number | null = null;
    const score = await prisma.candidateJobScore.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: candidate.id,
          jobId: id,
        },
      },
      select: { finalScore: true },
    });

    if (score) {
      matchScoreAtApplication = score.finalScore;
    }

    const application = await prisma.$transaction(async (tx) => {
      // Create application
      const app = await tx.jobApplication.create({
        data: {
          candidateId: candidate.id,
          jobId: id,
          matchScoreAtApplication,
          status: "APPLIED",
        },
      });

      // Create SUBMITTED funnel event
      await tx.applicationFunnel.create({
        data: {
          candidateId: candidate.id,
          jobId: id,
          stage: "SUBMITTED",
        },
      });

      // Create job view (apply = view from DIRECT source)
      await tx.jobView.create({
        data: {
          candidateId: candidate.id,
          jobId: id,
          source: (source as "MATCH" | "SEARCH" | "DIRECT") || "DIRECT",
        },
      });

      return app;
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/jobs/[id]/apply]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}