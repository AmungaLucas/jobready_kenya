import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();
  const health: Record<string, unknown> = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || "unknown",
    checks: {},
  };

  // Database connectivity check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: "ok",
      responseTime: `${Date.now() - dbStart}ms`,
    };
  } catch (err) {
    health.status = "degraded";
    health.checks.database = {
      status: "error",
      error: err instanceof Error ? err.message : "unknown",
    };
  }

  health.responseTime = `${Date.now() - start}ms`;

  const statusCode = health.status === "ok" ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}