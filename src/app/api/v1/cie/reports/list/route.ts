import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ScoringEngineService } from "@/services/scoring.service";

export async function GET(request: Request) {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "CIE_ADMIN" && user.role !== "REVIEWER")) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "UNAUTHORIZED", message: "Institutional access required." },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase().trim();

    // Query all startups with all their assessments
    const startups = await prisma.startup.findMany({
      orderBy: { startupCode: "asc" },
      include: {
        assessments: {
          orderBy: { version: "desc" },
          include: {
            scores: {
              include: { category: true },
            },
            reviews: {
              orderBy: { reviewedAt: "desc" },
              take: 1,
              include: {
                reviewer: {
                  select: { name: true, email: true },
                },
              },
            },
            schedules: {
              orderBy: { scheduledDate: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    interface ReportItemRecord {
      startupId: string;
      startupCode: string;
      startupName: string;
      founderName: string;
      industry: string;
      startupStage: string;
      assessmentId: string | null;
      version: number | null;
      status: string;
      score: number | null;
      classification: string;
      submittedAt: string | null;
      reviewedAt: string | null;
      reviewerName: string | null;
    }

    const items: ReportItemRecord[] = [];

    for (const startup of startups) {
      if (startup.assessments.length === 0) {
        items.push({
          startupId: startup.id,
          startupCode: startup.startupCode,
          startupName: startup.name,
          founderName: startup.founderName,
          industry: startup.industry,
          startupStage: startup.startupStage,
          assessmentId: null,
          version: null,
          status: "NOT_STARTED",
          score: null,
          classification: "Not Assessed",
          submittedAt: null,
          reviewedAt: null,
          reviewerName: null,
        });
      } else {
        for (const a of startup.assessments) {
          const overallScoreObj = a.scores.find((s) => s.categoryId === null);
          const scoreVal = overallScoreObj ? Number(overallScoreObj.score) : null;
          const classification = scoreVal !== null ? ScoringEngineService.classifyScore(scoreVal) : "Not Scored";
          const review = a.reviews[0] ?? null;

          items.push({
            startupId: startup.id,
            startupCode: startup.startupCode,
            startupName: startup.name,
            founderName: startup.founderName,
            industry: startup.industry,
            startupStage: startup.startupStage,
            assessmentId: a.id,
            version: a.version,
            status: a.status,
            score: scoreVal,
            classification,
            submittedAt: a.submittedAt ? a.submittedAt.toISOString() : null,
            reviewedAt: review?.reviewedAt ? review.reviewedAt.toISOString() : null,
            reviewerName: review?.reviewer?.name ?? null,
          });
        }
      }
    }

    const filtered = search
      ? items.filter(
          (it: ReportItemRecord) =>
            it.startupName.toLowerCase().includes(search) ||
            it.startupCode.toLowerCase().includes(search) ||
            it.founderName.toLowerCase().includes(search)
        )
      : items;

    // Also fetch recent export logs
    const recentLogs = await prisma.reportRecord.findMany({
      orderBy: { generatedAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true, email: true } },
        startup: { select: { name: true, startupCode: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          items: filtered,
          total: filtered.length,
          recentLogs: recentLogs.map((l) => ({
            id: l.id,
            reportCode: l.reportCode,
            reportType: l.reportType,
            startupName: l.startup?.name ?? "Portfolio Consolidated",
            startupCode: l.startup?.startupCode ?? "ALL",
            generatedBy: l.user.name,
            generatedAt: l.generatedAt.toISOString(),
          })),
        },
        error: null,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "INTERNAL_ERROR", message: errorMessage },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
