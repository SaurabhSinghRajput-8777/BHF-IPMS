import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { StartupService } from "@/services/startup.service";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types";

const updateStartupSchema = z.object({
  name: z.string().min(2, "Startup name is required").optional(),
  founderName: z.string().min(2, "Founder name is required").optional(),
  contactNumber: z.string().min(8, "Contact number is required").optional(),
  website: z.string().url("Invalid website URL").or(z.literal("")).nullable().optional(),
  industry: z.string().min(2, "Industry is required").optional(),
  startupStage: z.string().min(2, "Startup stage is required").optional(),
  incorporationDate: z.string().datetime().or(z.string()).nullable().optional(),
  registrationNumber: z.string().nullable().optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  productDescription: z.string().min(10, "Product description must be at least 10 characters").optional(),
});

export async function GET() {
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STARTUP") {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "UNAUTHORIZED", message: "Startup credentials required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const startup = await StartupService.getStartupByUserId(user.id);
    if (!startup) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "STARTUP_NOT_FOUND", message: "No startup profile associated with this account" },
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
          message: error instanceof Error ? error.message : "Failed to retrieve startup profile",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  await connection();

  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "STARTUP" || !user.startupId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "UNAUTHORIZED", message: "Startup credentials required" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = updateStartupSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parseResult.error.issues[0]?.message || "Invalid input data",
            details: parseResult.error.issues,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const updateInput = {
      ...data,
      incorporationDate: data.incorporationDate ? new Date(data.incorporationDate) : undefined,
      website: data.website || null,
    };

    const updatedStartup = await StartupService.updateStartupProfile(user.startupId, updateInput);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "STARTUP_PROFILE_UPDATED",
        entityType: "Startup",
        entityId: user.startupId,
        newValues: data,
      },
    }).catch(() => {});

    const response: ApiResponse<typeof updatedStartup> = {
      success: true,
      data: updatedStartup,
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
          message: error instanceof Error ? error.message : "Failed to update startup profile",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

