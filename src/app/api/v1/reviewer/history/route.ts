import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { ReviewerService } from "@/services/reviewer.service";
import { ApiResponse } from "@/types";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "REVIEWER" && user.role !== "CIE_ADMIN")) {
      return NextResponse.json(
        { success: false, data: null, error: { code: "UNAUTHORIZED", message: "Reviewer access required." }, timestamp: new Date().toISOString() },
        { status: 401 }
      );
    }
    const history = await ReviewerService.getReviewHistory(user.id);
    const response: ApiResponse<typeof history> = { success: true, data: history, error: null, timestamp: new Date().toISOString() };
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, data: null, error: { code: "SERVER_ERROR", message: error instanceof Error ? error.message : "Failed to load history" }, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

