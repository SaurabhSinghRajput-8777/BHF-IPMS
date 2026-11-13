import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { ReviewerService } from "@/services/reviewer.service";
import { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ assessmentId: string }> };

const approveSchema = z.object({
  generalRemarks: z.string().optional(),
  trademarkRemarks: z.string().optional(),
  patentRemarks: z.string().optional(),
  copyrightRemarks: z.string().optional(),
  recommendations: z.string().optional(),
  nextReviewMonths: z.number().int().min(1).max(60).default(12),
});

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
    const parseResult = approveSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "VALIDATION_ERROR", message: parseResult.error.issues[0]?.message || "Invalid input", details: parseResult.error.issues }, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const result = await ReviewerService.approveAssessment(assessmentId, user.id, parseResult.data);
    const response: ApiResponse<typeof result> = { success: true, data: result, error: null, timestamp: new Date().toISOString() };
    return NextResponse.json(response);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to approve assessment";
    return NextResponse.json(
      { success: false, data: null, error: { code: msg.includes("Invalid transition") ? "VALIDATION_ERROR" : "SERVER_ERROR", message: msg }, timestamp: new Date().toISOString() },
      { status: msg.includes("Invalid transition") ? 400 : 500 }
    );
  }
}

