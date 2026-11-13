import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { AssessmentService } from "@/services/assessment.service";
import { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/v1/assessments/[id]/submit
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

    const result = await AssessmentService.submitAssessment(id, user.startupId);
    const response: ApiResponse<typeof result> = {
      success: true, data: result, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to submit assessment";
    const isValidation = msg.includes("required question") || msg.includes("Invalid transition") || msg.includes("cannot be modified");
    return NextResponse.json(
      { success: false, data: null, error: { code: isValidation ? "VALIDATION_ERROR" : "SERVER_ERROR", message: msg }, timestamp: new Date().toISOString() },
      { status: isValidation ? 400 : 500 }
    );
  }
}

