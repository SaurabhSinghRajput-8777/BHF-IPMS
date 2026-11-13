import { prisma } from "@/lib/prisma";

export interface UpdateStartupInput {
  name?: string;
  founderName?: string;
  contactNumber?: string;
  website?: string | null;
  industry?: string;
  startupStage?: string;
  incorporationDate?: Date | null;
  registrationNumber?: string | null;
  description?: string;
  productDescription?: string;
}

export interface ListStartupsParams {
  search?: string;
  industry?: string;
  stage?: string;
  page?: number;
  limit?: number;
}

export class StartupService {
  /**
   * Formats a standardized Bennett Hatchery startup code: BH-YYYY-NNN
   */
  static formatStartupCode(year: number, sequence: number): string {
    const paddedSequence = sequence.toString().padStart(3, "0");
    return `BH-${year}-${paddedSequence}`;
  }

  /**
   * Validates if a startup code matches BH-YYYY-NNN format.
   */
  static isValidStartupCode(code: string): boolean {
    const regex = /^BH-\d{4}-\d{3}$/;
    return regex.test(code);
  }

  /**
   * Generates the next sequential unique startup code for the current year.
   */
  static async generateNextStartupCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `BH-${currentYear}-`;

    const latest = await prisma.startup.findFirst({
      where: {
        startupCode: {
          startsWith: prefix,
        },
      },
      orderBy: {
        startupCode: "desc",
      },
      select: {
        startupCode: true,
      },
    });

    let nextSequence = 1;
    if (latest && latest.startupCode) {
      const parts = latest.startupCode.split("-");
      if (parts.length === 3) {
        const seq = parseInt(parts[2], 10);
        if (!isNaN(seq)) {
          nextSequence = seq + 1;
        }
      }
    }

    return this.formatStartupCode(currentYear, nextSequence);
  }

  /**
   * Retrieves startup profile by startup ID.
   */
  static async getStartupById(id: string) {
    return await prisma.startup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
              },
            },
          },
        },
        assessments: {
          orderBy: { version: "desc" },
          take: 5,
          include: {
            scores: true,
          },
        },
        schedules: {
          orderBy: { scheduledDate: "asc" },
          take: 3,
        },
      },
    });
  }

  /**
   * Retrieves startup profile linked to a user.
   */
  static async getStartupByUserId(userId: string) {
    const member = await prisma.startupMember.findUnique({
      where: { userId },
      include: {
        startup: {
          include: {
            assessments: {
              orderBy: { version: "desc" },
              include: {
                scores: true,
              },
            },
            schedules: {
              where: { status: "SCHEDULED" },
              orderBy: { scheduledDate: "asc" },
              take: 1,
            },
          },
        },
      },
    });

    return member?.startup ?? null;
  }

  /**
   * Updates a startup profile.
   */
  static async updateStartupProfile(startupId: string, data: UpdateStartupInput) {
    return await prisma.startup.update({
      where: { id: startupId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.founderName && { founderName: data.founderName }),
        ...(data.contactNumber && { contactNumber: data.contactNumber }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.industry && { industry: data.industry }),
        ...(data.startupStage && { startupStage: data.startupStage }),
        ...(data.incorporationDate !== undefined && { incorporationDate: data.incorporationDate }),
        ...(data.registrationNumber !== undefined && { registrationNumber: data.registrationNumber }),
        ...(data.description && { description: data.description }),
        ...(data.productDescription && { productDescription: data.productDescription }),
      },
    });
  }

  /**
   * Queries the centralized CIE Startup Directory with multi-facet filters and pagination.
   */
  static async listStartups(params: ListStartupsParams = {}) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 10));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { startupCode: { contains: params.search, mode: "insensitive" } },
        { founderName: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.industry && params.industry !== "ALL") {
      where.industry = params.industry;
    }

    if (params.stage && params.stage !== "ALL") {
      where.startupStage = params.stage;
    }

    const [startups, totalCount] = await Promise.all([
      prisma.startup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          assessments: {
            where: { status: "APPROVED" },
            orderBy: { version: "desc" },
            take: 1,
            include: {
              scores: true,
            },
          },
          schedules: {
            where: { status: "SCHEDULED" },
            orderBy: { scheduledDate: "asc" },
            take: 1,
          },
        },
      }),
      prisma.startup.count({ where }),
    ]);

    return {
      startups,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}

