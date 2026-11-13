import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { ApiResponse, AuthUserContext } from "@/types";

export async function GET() {
  await connection();

  try {
    const user = await getCurrentUser();

    if (!user) {
      const response: ApiResponse = {
        success: false,
        data: null,
        error: {
          code: "UNAUTHORIZED",
          message: "No active authenticated session found",
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 401 });
    }

    const response: ApiResponse<AuthUserContext> = {
      success: true,
      data: user,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const response: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: "SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to retrieve session",
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

