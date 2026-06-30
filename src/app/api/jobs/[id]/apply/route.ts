import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-helpers";

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
    const existingApplication = await prisma.application.findUnique({
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
      const app = await tx.application.create({
        data: {
          candidateId: candidate.id,
          jobId: id,
          coverLetter: coverLetter || null,
          matchScoreAtApplication,
          status: "APPLIED",
        },
      });

      // Create funnel event
      await tx.applicationFunnel.create({
        data: {
          candidateId: candidate.id,
          jobId: id,
          stage: "SUBMITTED",
        },
      });

      // Create job view
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
    console.error("Apply error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}