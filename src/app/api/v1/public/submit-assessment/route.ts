import { NextResponse } from "next/server";
import { connection } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { StartupService } from "@/services/startup.service";
import { ScoringEngineService } from "@/services/scoring.service";
import { AssessmentStatus, ResponseValue } from "@prisma/client";
import { ApiResponse } from "@/types";

const publicSubmissionSchema = z.object({
  startup: z.object({
    name: z.string().min(2, "Startup name is required"),
    founderName: z.string().min(2, "Founder name is required"),
    email: z.string().email("Valid email address is required"),
    contactNumber: z.string().min(8, "Valid contact number is required"),
    website: z.string().url("Invalid website URL").or(z.literal("")).nullable().optional(),
    industry: z.string().min(2, "Industry is required"),
    startupStage: z.string().min(2, "Startup stage is required"),
    incorporationDate: z.string().nullable().optional(),
    registrationNumber: z.string().nullable().optional(),
    description: z.string().min(10, "Summary must be at least 10 characters"),
    productDescription: z.string().min(10, "Innovation details must be at least 10 characters"),
  }),
  responses: z.array(
    z.object({
      questionId: z.string().uuid(),
      response: z.nativeEnum(ResponseValue),
      textValue: z.string().optional(),
      justification: z.string().optional(),
    })
  ),
  applicability: z
    .array(
      z.object({
        categoryId: z.string().uuid(),
        applicable: z.boolean(),
        remarks: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  await connection();

  try {
    const body = await request.json();
    const parseResult = publicSubmissionSchema.safeParse(body);

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

    const { startup: startupInput, responses, applicability } = parseResult.data;

    // 1. Get active questionnaire
    const activeQuestionnaire = await prisma.ipQuestionnaire.findFirst({
      where: { isActive: true },
      include: {
        questions: {
          where: { isActive: true },
          include: { category: true },
        },
      },
    });

    if (!activeQuestionnaire) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "CONFIGURATION_ERROR", message: "No active questionnaire configured." },
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    // 2. Validate all required questions are answered for applicable categories
    const nonApplicableCategoryIds = new Set(
      (applicability || [])
        .filter((a) => a.applicable === false)
        .map((a) => a.categoryId)
    );

    const requiredQuestions = activeQuestionnaire.questions.filter((q) => {
      if (!q.isRequired) return false;
      // Exclude required questions belonging to categories marked as non-applicable
      if (q.categoryId && nonApplicableCategoryIds.has(q.categoryId)) {
        return false;
      }
      return true;
    });

    const answeredMap = new Map(responses.map((r) => [r.questionId, r.response]));
    const missing = requiredQuestions.filter((q) => !answeredMap.has(q.id));

    if (missing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: "INCOMPLETE_SUBMISSION",
            message: `${missing.length} required question(s) were not answered.`,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // 3. Find or Create Startup (deduplicate by email)
    const normalizedEmail = startupInput.email.toLowerCase().trim();
    const existingStartup = await prisma.startup.findFirst({
      where: { email: normalizedEmail },
    });

    let startupCode: string;
    if (existingStartup) {
      startupCode = existingStartup.startupCode;
    } else {
      startupCode = await StartupService.generateNextStartupCode();
    }

    // Run creation, assessment creation, and scoring within an atomic transaction
    const submissionResult = await prisma.$transaction(async (tx) => {
      let startupId: string;

      if (existingStartup) {
        startupId = existingStartup.id;
        await tx.startup.update({
          where: { id: startupId },
          data: {
            name: startupInput.name,
            founderName: startupInput.founderName,
            contactNumber: startupInput.contactNumber,
            website: startupInput.website || null,
            industry: startupInput.industry,
            startupStage: startupInput.startupStage,
            incorporationDate: startupInput.incorporationDate ? new Date(startupInput.incorporationDate) : null,
            registrationNumber: startupInput.registrationNumber || null,
            description: startupInput.description,
            productDescription: startupInput.productDescription,
          },
        });
      } else {
        const createdStartup = await tx.startup.create({
          data: {
            startupCode,
            name: startupInput.name,
            founderName: startupInput.founderName,
            email: normalizedEmail,
            contactNumber: startupInput.contactNumber,
            website: startupInput.website || null,
            industry: startupInput.industry,
            startupStage: startupInput.startupStage,
            incorporationDate: startupInput.incorporationDate ? new Date(startupInput.incorporationDate) : null,
            registrationNumber: startupInput.registrationNumber || null,
            description: startupInput.description,
            productDescription: startupInput.productDescription,
          },
        });
        startupId = createdStartup.id;
      }

      // Determine next version
      const latestAssessment = await tx.ipAssessment.findFirst({
        where: { startupId },
        orderBy: { version: "desc" },
      });
      const version = latestAssessment ? latestAssessment.version + 1 : 1;

      // Create new submitted assessment
      const assessment = await tx.ipAssessment.create({
        data: {
          startupId,
          questionnaireId: activeQuestionnaire.id,
          version,
          status: AssessmentStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      // Insert responses
      if (responses.length > 0) {
        await tx.ipResponse.createMany({
          data: responses.map((r) => ({
            assessmentId: assessment.id,
            questionId: r.questionId,
            response: r.response,
            textValue: r.textValue || null,
            justification: r.justification || null,
          })),
        });
      }

      // Insert applicability declarations
      if (applicability && applicability.length > 0) {
        await tx.assessmentApplicability.createMany({
          data: applicability.map((a) => ({
            assessmentId: assessment.id,
            categoryId: a.categoryId,
            startupApplicable: a.applicable,
            startupRemarks: a.remarks || null,
          })),
        });
      }

      // Compute provisional scores
      const categories = await tx.ipCategory.findMany({ where: { isActive: true } });
      const categoryScoreInputs: Array<{ category: string; score: number | null; isApplicable: boolean }> = [];
      const scoreRecords: Array<{
        assessmentId: string;
        categoryId: string | null;
        score: number;
        applicableQuestions: number;
        scoredQuestions: number;
      }> = [];

      for (const cat of categories) {
        const appDecl = applicability?.find((a) => a.categoryId === cat.id);
        const isApplicable = appDecl ? appDecl.applicable : true;

        const catResponses = responses
          .filter((r) => {
            const q = activeQuestionnaire.questions.find((quest) => quest.id === r.questionId);
            return q?.categoryId === cat.id;
          })
          .map((r) => r.response as string);

        const catScore = ScoringEngineService.calculateCategoryScore(catResponses);

        categoryScoreInputs.push({
          category: cat.code,
          score: isApplicable ? catScore.score : null,
          isApplicable,
        });

        if (isApplicable && catScore.score !== null) {
          scoreRecords.push({
            assessmentId: assessment.id,
            categoryId: cat.id,
            score: catScore.score,
            applicableQuestions: catScore.applicableQuestions,
            scoredQuestions: catScore.scoredQuestions,
          });
        }
      }

      const overall = ScoringEngineService.calculateOverallScore(categoryScoreInputs);
      scoreRecords.push({
        assessmentId: assessment.id,
        categoryId: null,
        score: overall.overallScore,
        applicableQuestions: overall.applicableCategoriesCount,
        scoredQuestions: overall.applicableCategoriesCount,
      });

      await tx.ipScore.createMany({
        data: scoreRecords.map((s) => ({
          assessmentId: s.assessmentId,
          categoryId: s.categoryId ?? undefined,
          score: s.score,
          applicableQuestions: s.applicableQuestions,
          scoredQuestions: s.scoredQuestions,
        })),
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          action: "PUBLIC_ASSESSMENT_SUBMITTED",
          entityType: "IpAssessment",
          entityId: assessment.id,
          newValues: {
            startupCode,
            email: normalizedEmail,
            version,
            overallScore: overall.overallScore,
          },
        },
      });

      return {
        startupCode,
        startupName: startupInput.name,
        founderName: startupInput.founderName,
        version,
        assessmentId: assessment.id,
        overallScore: overall.overallScore,
        classification: overall.classification,
      };
    });

    const response: ApiResponse<typeof submissionResult> = {
      success: true,
      data: submissionResult,
      error: null,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to process application",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
