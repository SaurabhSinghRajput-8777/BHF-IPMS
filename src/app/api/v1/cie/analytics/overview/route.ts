import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { AnalyticsService } from "@/services/analytics.service";
import { ApiResponse } from "@/types";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "CIE_ADMIN" && user.role !== "REVIEWER")) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "CIE access required." }, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const [kpis, categories, trends] = await Promise.all([
      AnalyticsService.getPortfolioKpis(),
      AnalyticsService.getCategoryDistribution(),
      AnalyticsService.getMonthlyTrends(12),
    ]);

    const response: ApiResponse<{ kpis: typeof kpis; categories: typeof categories; trends: typeof trends }> = {
      success: true,
      data: { kpis, categories, trends },
      error: null,
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to load analytics" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

