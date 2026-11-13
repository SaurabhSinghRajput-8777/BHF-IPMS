import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { StartupService } from "@/services/startup.service";
import { ApiResponse } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();

  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "UNAUTHORIZED", message: "Authentication required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    // Startup users can only view their own startup
    if (user.role === "STARTUP" && user.startupId !== id) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "FORBIDDEN", message: "Access to other startup dossiers is prohibited" },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
    }

    const startup = await StartupService.getStartupById(id);
    if (!startup) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "NOT_FOUND", message: "Startup not found" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const response: ApiResponse<typeof startup> = {
      success: true,
      data: startup,
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
          message: error instanceof Error ? error.message : "Failed to load startup",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

