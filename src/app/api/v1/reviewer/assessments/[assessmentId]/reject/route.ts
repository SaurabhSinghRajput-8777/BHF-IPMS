import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { ReviewerService } from "@/services/reviewer.service";
import { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ assessmentId: string }> };

const schema = z.object({ reason: z.string().min(10, "Please provide a rejection reason (at least 10 characters).") });

export async function POST(request: Request, { params }: RouteParams) {
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

    const body = await request.json();
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "VALIDATION_ERROR", message: parseResult.error.issues[0]?.message || "Invalid input" }, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    await ReviewerService.rejectAssessment(assessmentId, user.id, parseResult.data.reason);
    const response: ApiResponse<{ message: string }> = { success: true, data: { message: "Assessment rejected." }, error: null, timestamp: new Date().toISOString() };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to reject assessment" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

