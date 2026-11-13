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

    const monitoring = await AnalyticsService.getReviewMonitoring();
    const response: ApiResponse<typeof monitoring> = {
      success: true, data: monitoring, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to load review schedule" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

