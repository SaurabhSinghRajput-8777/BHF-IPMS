import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types";

export async function GET() {
  // Opt out of prerendering and execute dynamically at request time
  await connection();

  let dbStatus: "connected" | "disconnected" | "unconfigured" = "disconnected";
  let dbLatencyMs: number | null = null;
  let dbError: string | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = "connected";
  } catch (error: unknown) {
    dbStatus = "disconnected";
    dbError = error instanceof Error ? error.message : "Database connection failed";
  }

  const payload: ApiResponse<{
    status: "healthy" | "degraded";
    uptimeSeconds: number;
    timestamp: string;
    environment: string;
    version: string;
    database: {
      status: string;
      latencyMs: number | null;
      error?: string | null;
    };
  }> = {
    success: dbStatus === "connected",
    data: {
      status: dbStatus === "connected" ? "healthy" : "degraded",
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        ...(dbError && { error: dbError }),
      },
    },
    error:
      dbStatus !== "connected"
        ? {
            code: "DATABASE_UNAVAILABLE",
            message: "Application is running, but database connection could not be established.",
            details: dbError,
          }
        : null,
    timestamp: new Date().toISOString(),
  };

  const httpStatus = dbStatus === "connected" ? 200 : 503;
  return NextResponse.json(payload, { status: httpStatus });
}
