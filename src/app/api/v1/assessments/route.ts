import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { AssessmentService } from "@/services/assessment.service";
import { ApiResponse } from "@/types";

// POST /api/v1/assessments — Create a new draft
export async function POST() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STARTUP" || !user.startupId) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Startup authentication required." }, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const assessment = await AssessmentService.createDraftAssessment(user.startupId);
    const response: ApiResponse<typeof assessment> = {
      success: true, data: assessment, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to create assessment" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

// GET /api/v1/assessments — List assessment versions for startup
export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STARTUP" || !user.startupId) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Startup authentication required." }, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const assessments = await AssessmentService.listAssessmentVersions(user.startupId);
    const response: ApiResponse<typeof assessments> = {
      success: true, data: assessments, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to list assessments" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

