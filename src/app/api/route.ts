import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Check total jobs count
    const totalJobs = await prisma.job.count();
    const activeJobs = await prisma.job.count({ where: { status: "ACTIVE" } });
    const activeNotDeleted = await prisma.job.count({ where: { status: "ACTIVE", deletedAt: null } });

    // Get a sample of any jobs
    const sampleJob = await prisma.job.findFirst({
      select: { id: true, title: true, status: true, deletedAt: true },
    });

    // Check status distribution
    const statusDist = await prisma.job.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Check table existence
    let tableInfo: Record<string, string> = {};
    try {
      const tables = await prisma.$queryRaw`SHOW TABLES`;
      tableInfo.tableCount = String(Array.isArray(tables) ? tables.length : 0);
    } catch (e: unknown) {
      tableInfo.error = e instanceof Error ? e.message : String(e);
    }

    return NextResponse.json({
      totalJobs,
      activeJobs,
      activeNotDeleted,
      sampleJob,
      statusDist,
      tableInfo,
      provider: process.env.DATABASE_URL?.startsWith("mysql") ? "mysql" : "other",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}