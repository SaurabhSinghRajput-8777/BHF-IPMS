import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { AuthService } from "@/services/auth.service";
import { setSessionCookie } from "@/lib/session";
import { ApiResponse, AuthUserContext } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  await connection();

  try {
    const body = await request.json();
    const parseResult = loginSchema.safeParse(body);

    if (!parseResult.success) {
      const response: ApiResponse = {
        success: false,
        data: null,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Invalid input data",
          details: parseResult.error.issues,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { email, password } = parseResult.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        startupMembership: {
          include: {
            startup: true,
          },
        },
      },
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        data: null,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 401 });
    }

    if (!user.isActive) {
      const response: ApiResponse = {
        success: false,
        data: null,
        error: {
          code: "ACCOUNT_DEACTIVATED",
          message: "Your institutional account has been deactivated. Contact CIE administration.",
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 403 });
    }

    const isPasswordValid = await AuthService.verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        data: null,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Create database session
    const { rawToken, expiresAt } = await AuthService.createSession(user.id);
    await setSessionCookie(rawToken, expiresAt);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
        newValues: { email: user.email, role: user.role },
      },
    }).catch(() => {});

    const userContext: AuthUserContext = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      startupId: user.startupMembership?.startupId ?? null,
      startupCode: user.startupMembership?.startup.startupCode ?? null,
      startupName: user.startupMembership?.startup.name ?? null,
    };

    const response: ApiResponse<AuthUserContext> = {
      success: true,
      data: userContext,
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
        message: error instanceof Error ? error.message : "An unexpected authentication error occurred",
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

