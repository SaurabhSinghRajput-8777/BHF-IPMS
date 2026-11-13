import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { AssessmentService } from "@/services/assessment.service";
import { ApiResponse } from "@/types";
import { ResponseValue } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/v1/assessments/[id]
export async function GET(_req: Request, { params }: RouteParams) {
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

    const assessment = await AssessmentService.getAssessmentById(id, user.startupId);
    if (!assessment) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "Assessment not found." }, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof assessment> = {
      success: true, data: assessment, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to get assessment" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

const saveResponsesSchema = z.object({
  responses: z.array(z.object({
    questionId: z.string().uuid(),
    response: z.nativeEnum(ResponseValue),
    textValue: z.string().optional(),
    justification: z.string().optional(),
  })),
  applicability: z.array(z.object({
    categoryId: z.string().uuid(),
    applicable: z.boolean(),
    remarks: z.string().optional(),
  })).optional(),
});

// PUT /api/v1/assessments/[id] — Save draft responses
export async function PUT(request: Request, { params }: RouteParams) {
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

    const body = await request.json();
    const parseResult = saveResponsesSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "VALIDATION_ERROR", message: parseResult.error.issues[0]?.message || "Invalid input", details: parseResult.error.issues }, timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const { responses, applicability } = parseResult.data;

    if (responses.length > 0) {
      await AssessmentService.saveResponses(id, user.startupId, responses);
    }

    if (applicability && applicability.length > 0) {
      for (const app of applicability) {
        await AssessmentService.saveApplicability(id, user.startupId, app.categoryId, app.applicable, app.remarks);
      }
    }

    const response: ApiResponse<{ message: string }> = {
      success: true, data: { message: "Draft saved successfully." }, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to save responses" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

