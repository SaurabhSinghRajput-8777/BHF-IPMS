import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/services/auth.service";
import { ApiResponse } from "@/types";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters long"),
});

export async function POST(request: Request) {
  await connection();

  try {
    const userContext = await getCurrentUser();
    if (!userContext) {
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

    const body = await request.json();
    const parseResult = changePasswordSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parseResult.error.issues[0]?.message || "Invalid input",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { id: userContext.id },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "USER_NOT_FOUND", message: "User not found" },
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    const isCurrentValid = await AuthService.verifyPassword(user.passwordHash, currentPassword);
    if (!isCurrentValid) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "INVALID_CURRENT_PASSWORD", message: "Incorrect current password" },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const newHash = await AuthService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_CHANGED",
        entityType: "User",
        entityId: user.id,
      },
    }).catch(() => {});

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Password updated successfully" },
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
          message: error instanceof Error ? error.message : "Failed to change password",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

