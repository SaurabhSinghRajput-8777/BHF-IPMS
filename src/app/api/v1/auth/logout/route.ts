import { NextResponse } from "next/server";
import { connection } from "next/server";
import { AuthService } from "@/services/auth.service";
import { getSessionCookie, clearSessionCookie, getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types";

export async function POST() {
  await connection();

  try {
    const user = await getCurrentUser();
    const token = await getSessionCookie();

    if (token) {
      await AuthService.revokeSession(token);
    }

    await clearSessionCookie();

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "USER_LOGOUT",
          entityType: "User",
          entityId: user.id,
        },
      }).catch(() => {});
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Successfully logged out" },
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const response: ApiResponse = {
      success: false,
      data: null,
      error: {
        code: "LOGOUT_ERROR",
        message: error instanceof Error ? error.message : "Error during logout",
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

