import { NextResponse } from "next/server";
import { connection } from "next/server";
import { QuestionnaireService } from "@/services/questionnaire.service";
import { ApiResponse } from "@/types";

export async function GET() {
  await connection();
  try {
    const questionnaire = await QuestionnaireService.getActiveQuestionnaire();
    if (!questionnaire) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "NOT_FOUND", message: "No active questionnaire available." }, timestamp: new Date().toISOString() },
        { status: 404 }
      );
    }
    const response: ApiResponse<typeof questionnaire> = {
      success: true, data: questionnaire, error: null, timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to load questionnaire" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

