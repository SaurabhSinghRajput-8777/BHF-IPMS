import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { AssessmentService } from "@/services/assessment.service";
import { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/v1/assessments/[id]/resubmit
export async function POST(_req: Request, { params }: RouteParams) {
  await connection();
  const { id } = await params;
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STARTUP" || !user.startupId) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Startup authentication required." }, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }

    const newAssessment = await AssessmentService.createResubmission(id, user.startupId);
    const response: ApiResponse<typeof newAssessment> = {
      success: true, data: newAssessment, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create resubmission";
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: msg }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

