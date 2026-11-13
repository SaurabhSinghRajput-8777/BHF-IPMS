import { prisma } from "@/lib/prisma";
import { ScoringEngineService } from "@/services/scoring.service";
import { AssessmentStateMachine } from "@/services/assessment-state.service";
import { AssessmentStatus, ResponseValue } from "@prisma/client";

export class AssessmentService {
  /**
   * Creates a new DRAFT assessment for the startup, linked to the active questionnaire.
   * Version is auto-incremented based on existing assessments for this startup.
   */
  static async createDraftAssessment(startupId: string) {
    const activeQuestionnaire = await prisma.ipQuestionnaire.findFirst({
      where: { isActive: true },
    });
    if (!activeQuestionnaire) {
      throw new Error("No active questionnaire available. Contact CIE administration.");
    }

    // Find the highest existing version for this startup
    const latestAssessment = await prisma.ipAssessment.findFirst({
      where: { startupId },
      orderBy: { version: "desc" },
    });
    const nextVersion = latestAssessment ? latestAssessment.version + 1 : 1;

    return prisma.ipAssessment.create({
      data: {
        startupId,
        questionnaireId: activeQuestionnaire.id,
        version: nextVersion,
        status: AssessmentStatus.DRAFT,
      },
      include: {
        questionnaire: {
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { displayOrder: "asc" },
              include: { category: true },
            },
          },
        },
        responses: true,
        applicability: { include: { category: true } },
      },
    });
  }

  /**
   * Retrieves a draft assessment for a specific startup (enforcing tenant isolation).
   */
  static async getDraftAssessment(assessmentId: string, startupId: string) {
    return prisma.ipAssessment.findFirst({
      where: { id: assessmentId, startupId },
      include: {
        questionnaire: {
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { displayOrder: "asc" },
              include: { category: true },
            },
          },
        },
        responses: { include: { question: { include: { category: true } } } },
        applicability: { include: { category: true } },
        scores: { include: { category: true } },
      },
    });
  }

  /**
   * Retrieves any assessment by ID for a startup (for history/scoring views).
   */
  static async getAssessmentById(assessmentId: string, startupId: string) {
    return prisma.ipAssessment.findFirst({
      where: { id: assessmentId, startupId },
      include: {
        questionnaire: {
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { displayOrder: "asc" },
              include: { category: true },
            },
          },
        },
        responses: { include: { question: { include: { category: true } } } },
        applicability: { include: { category: true } },
        scores: { include: { category: true } },
        reviews: {
          orderBy: { reviewedAt: "desc" },
          include: { reviewer: { select: { id: true, name: true, email: true } } },
        },
        schedules: { orderBy: { scheduledDate: "asc" } },
      },
    });
  }

  /**
   * Bulk upserts IpResponse records for an assessment.
   * Only allowed on DRAFT assessments (startup tenant isolation enforced).
   */
  static async saveResponses(
    assessmentId: string,
    startupId: string,
    responses: Array<{ questionId: string; response: ResponseValue; textValue?: string; justification?: string }>
  ) {
    // Verify ownership and draft status
    const assessment = await prisma.ipAssessment.findFirst({
      where: { id: assessmentId, startupId, status: AssessmentStatus.DRAFT },
    });
    if (!assessment) {
      throw new Error("Assessment not found or cannot be modified.");
    }

    // Upsert all responses in a transaction
    await prisma.$transaction(
      responses.map((r) =>
        prisma.ipResponse.upsert({
          where: { assessmentId_questionId: { assessmentId, questionId: r.questionId } },
          update: { response: r.response, textValue: r.textValue, justification: r.justification },
          create: { assessmentId, questionId: r.questionId, response: r.response, textValue: r.textValue, justification: r.justification },
        })
      )
    );
  }

  /**
   * Saves category applicability declaration by the startup.
   */
  static async saveApplicability(
    assessmentId: string,
    startupId: string,
    categoryId: string,
    applicable: boolean,
    remarks?: string
  ) {
    const assessment = await prisma.ipAssessment.findFirst({
      where: { id: assessmentId, startupId, status: AssessmentStatus.DRAFT },
    });
    if (!assessment) throw new Error("Assessment not found or cannot be modified.");

    return prisma.assessmentApplicability.upsert({
      where: { assessmentId_categoryId: { assessmentId, categoryId } },
      update: { startupApplicable: applicable, startupRemarks: remarks },
      create: { assessmentId, categoryId, startupApplicable: applicable, startupRemarks: remarks },
    });
  }

  /**
   * Submits the assessment: validates, calculates provisional scores, transitions to SUBMITTED.
   * Full transactional — either all succeeds or rolls back.
   */
  static async submitAssessment(assessmentId: string, startupId: string) {
    const assessment = await prisma.ipAssessment.findFirst({
      where: { id: assessmentId, startupId },
      include: {
        questionnaire: {
          include: {
            questions: { where: { isActive: true, isRequired: true }, include: { category: true } },
          },
        },
        responses: true,
        applicability: { include: { category: true } },
      },
    });
    if (!assessment) throw new Error("Assessment not found.");

    // Validate state transition
    AssessmentStateMachine.validateTransition(assessment.status, AssessmentStatus.SUBMITTED);

    // Check all required questions have responses
    const requiredQuestionIds = assessment.questionnaire.questions.map((q) => q.id);
    const respondedQuestionIds = new Set(assessment.responses.map((r) => r.questionId));
    const unanswered = requiredQuestionIds.filter((id) => !respondedQuestionIds.has(id));
    if (unanswered.length > 0) {
      throw new Error(`${unanswered.length} required question(s) have not been answered.`);
    }

    // Calculate provisional scores
    const categories = await prisma.ipCategory.findMany({ where: { isActive: true } });
    const categoryScoreInputs: Array<{ category: string; score: number | null; isApplicable: boolean }> = [];
    const scoreRecords: Array<{
      assessmentId: string;
      categoryId: string | null;
      score: number;
      applicableQuestions: number;
      scoredQuestions: number;
    }> = [];

    // 1. General IP Strategy
    const generalResponses = assessment.responses
      .filter((r) => {
        const q = assessment.questionnaire.questions.find((q) => q.id === r.questionId);
        return !q?.categoryId;
      })
      .map((r) => r.response as string);

    if (generalResponses.length > 0) {
      const genScore = ScoringEngineService.calculateCategoryScore(generalResponses);
      categoryScoreInputs.push({
        category: "GENERAL_IP",
        score: genScore.score,
        isApplicable: true,
      });

      if (genScore.score !== null) {
        scoreRecords.push({
          assessmentId,
          categoryId: null,
          score: genScore.score,
          applicableQuestions: genScore.applicableQuestions,
          scoredQuestions: genScore.scoredQuestions,
        });
      }
    }

    // 2. Specific IP Categories
    for (const cat of categories) {
      const applicabilityRecord = assessment.applicability.find((a) => a.categoryId === cat.id);
      const isApplicable = applicabilityRecord ? applicabilityRecord.startupApplicable : true; // default applicable

      const catResponses = assessment.responses
        .filter((r) => {
          const q = assessment.questionnaire.questions.find((q) => q.id === r.questionId);
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
          assessmentId,
          categoryId: cat.id,
          score: catScore.score,
          applicableQuestions: catScore.applicableQuestions,
          scoredQuestions: catScore.scoredQuestions,
        });
      }
    }

    const overall = ScoringEngineService.calculateOverallScore(categoryScoreInputs);
    const finalScoreRecords = scoreRecords.filter((s) => s.categoryId !== null);
    finalScoreRecords.push({
      assessmentId,
      categoryId: null,
      score: overall.overallScore,
      applicableQuestions: overall.applicableCategoriesCount,
      scoredQuestions: overall.applicableCategoriesCount,
    });

    // Execute atomic transaction
    await prisma.$transaction(async (tx) => {
      // Update assessment status
      await tx.ipAssessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.SUBMITTED, submittedAt: new Date() },
      });

      // Delete existing provisional scores (if any)
      await tx.ipScore.deleteMany({ where: { assessmentId } });

      // Create new provisional scores
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
          userId: undefined,
          action: "ASSESSMENT_SUBMITTED",
          entityType: "IpAssessment",
          entityId: assessmentId,
          newValues: { status: "SUBMITTED", version: assessment.version, overallScore: overall.overallScore },
        },
      }).catch(() => {});
    });

    return { assessmentId, overallScore: overall.overallScore, classification: overall.classification };
  }

  /**
   * Creates a resubmission: clones the latest responses into a new DRAFT (V+1).
   */
  static async createResubmission(previousAssessmentId: string, startupId: string) {
    const previous = await prisma.ipAssessment.findFirst({
      where: { id: previousAssessmentId, startupId },
      include: { responses: true, applicability: true },
    });
    if (!previous) throw new Error("Previous assessment not found.");
    if (!["CHANGES_REQUESTED", "REJECTED"].includes(previous.status)) {
      throw new Error("Resubmission only allowed after Changes Requested or Rejection.");
    }

    const activeQuestionnaire = await prisma.ipQuestionnaire.findFirst({ where: { isActive: true } });
    if (!activeQuestionnaire) throw new Error("No active questionnaire.");

    const latestAssessment = await prisma.ipAssessment.findFirst({
      where: { startupId },
      orderBy: { version: "desc" },
    });
    const nextVersion = latestAssessment ? latestAssessment.version + 1 : 1;

    return prisma.$transaction(async (tx) => {
      const newAssessment = await tx.ipAssessment.create({
        data: {
          startupId,
          questionnaireId: activeQuestionnaire.id,
          version: nextVersion,
          status: AssessmentStatus.DRAFT,
        },
      });

      // Clone responses
      if (previous.responses.length > 0) {
        await tx.ipResponse.createMany({
          data: previous.responses.map((r) => ({
            assessmentId: newAssessment.id,
            questionId: r.questionId,
            response: r.response,
            textValue: r.textValue,
            justification: r.justification,
          })),
        });
      }

      // Clone applicability
      if (previous.applicability.length > 0) {
        await tx.assessmentApplicability.createMany({
          data: previous.applicability.map((a) => ({
            assessmentId: newAssessment.id,
            categoryId: a.categoryId,
            startupApplicable: a.startupApplicable,
            startupRemarks: a.startupRemarks,
          })),
        });
      }

      return newAssessment;
    });
  }

  /**
   * Lists all assessment versions for a startup.
   */
  static async listAssessmentVersions(startupId: string) {
    return prisma.ipAssessment.findMany({
      where: { startupId },
      orderBy: { version: "desc" },
      include: {
        scores: { include: { category: true } },
        schedules: { orderBy: { scheduledDate: "asc" }, take: 1 },
        reviews: { orderBy: { reviewedAt: "desc" }, take: 1 },
      },
    });
  }
}

