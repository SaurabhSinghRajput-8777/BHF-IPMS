import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { StartupService } from "@/services/startup.service";
import { ApiResponse } from "@/types";

export async function GET(request: Request) {
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "CIE_ADMIN" && user.role !== "REVIEWER")) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "FORBIDDEN", message: "CIE administrative or reviewer authorization required" },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const industry = searchParams.get("industry") || undefined;
    const stage = searchParams.get("stage") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await StartupService.listStartups({
      search,
      industry,
      stage,
      page,
      limit,
    });

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to query startup directory",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

