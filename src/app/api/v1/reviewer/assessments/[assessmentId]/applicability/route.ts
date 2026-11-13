import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { ReviewerService } from "@/services/reviewer.service";
import { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ assessmentId: string }> };

const applicabilitySchema = z.object({
  categoryId: z.string().uuid(),
  applicable: z.boolean(),
  remarks: z.string().optional(),
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
    const parseResult = applicabilitySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "VALIDATION_ERROR", message: parseResult.error.issues[0]?.message || "Invalid input", details: parseResult.error.issues }, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const { categoryId, applicable, remarks } = parseResult.data;
    const result = await ReviewerService.updateApplicability(assessmentId, categoryId, applicable, remarks, user.id);

    const response: ApiResponse<typeof result> = { success: true, data: result, error: null, timestamp: new Date().toISOString() };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to update applicability" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

