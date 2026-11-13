import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { ReviewerService } from "@/services/reviewer.service";
import { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ assessmentId: string }> };

export async function GET(_req: Request, { params }: RouteParams) {
  await connection();
  const { assessmentId } = await params;
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "REVIEWER" && user.role !== "CIE_ADMIN")) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Reviewer access required." }, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }
    const assessment = await ReviewerService.getAssessmentForReview(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "Assessment not found." }, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }
    const response: ApiResponse<typeof assessment> = { success: true, data: assessment, error: null, timestamp: new Date().toISOString() };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to load assessment" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

