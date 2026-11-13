import { prisma } from "@/lib/prisma";
import { AssessmentStatus, ReviewDecision, ReviewStatus } from "@prisma/client";
import { ScoringEngineService } from "@/services/scoring.service";
import { AssessmentStateMachine } from "@/services/assessment-state.service";

export class ReviewerService {
  /**
   * Returns all assessments in the reviewer queue (SUBMITTED, RESUBMITTED, UNDER_REVIEW).
   */
  static async getReviewQueue() {
    return prisma.ipAssessment.findMany({
      where: {
        status: { in: [AssessmentStatus.SUBMITTED, AssessmentStatus.RESUBMITTED, AssessmentStatus.UNDER_REVIEW] },
      },
      orderBy: { submittedAt: "asc" },
      include: {
        startup: { select: { id: true, startupCode: true, name: true, founderName: true, industry: true } },
        scores: { where: { categoryId: null } },
        reviews: { orderBy: { reviewedAt: "desc" }, take: 1 },
      },
    });
  }

  /**
   * Returns full assessment details for review (all responses, applicability, scores, reviews).
   */
  static async getAssessmentForReview(assessmentId: string) {
    return prisma.ipAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        startup: true,
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
   * Reviewer overrides category applicability for scoring purposes.
   */
  static async updateApplicability(
    assessmentId: string,
    categoryId: string,
    applicable: boolean,
    remarks: string | undefined,
    reviewerId: string
  ) {
    return prisma.assessmentApplicability.upsert({
      where: { assessmentId_categoryId: { assessmentId, categoryId } },
      update: { reviewerApplicable: applicable, reviewerRemarks: remarks, verifiedBy: reviewerId, verifiedAt: new Date() },
      create: {
        assessmentId, categoryId,
        startupApplicable: applicable, // fallback
        reviewerApplicable: applicable,
        reviewerRemarks: remarks,
        verifiedBy: reviewerId,
        verifiedAt: new Date(),
      },
    });
  }

  /**
   * Approves an assessment: recalculates final scores using reviewer applicability,
   * creates ReviewRecord, creates ReviewSchedule, sets status to APPROVED.
   */
  static async approveAssessment(
    assessmentId: string,
    reviewerId: string,
    params: {
      generalRemarks?: string;
      trademarkRemarks?: string;
      patentRemarks?: string;
      copyrightRemarks?: string;
      recommendations?: string;
      nextReviewMonths?: number;
    }
  ) {
    const assessment = await prisma.ipAssessment.findUnique({
      where: { id: assessmentId },
      include: {
        responses: { include: { question: { include: { category: true } } } },
        applicability: true,
      },
    });
    if (!assessment) throw new Error("Assessment not found.");

    AssessmentStateMachine.validateTransition(assessment.status, AssessmentStatus.APPROVED);

    const categories = await prisma.ipCategory.findMany({ where: { isActive: true } });

    const categoryScoreInputs: Array<{ category: string; score: number | null; isApplicable: boolean }> = [];
    const scoreRecords: Array<{
      assessmentId: string;
      categoryId: string | null;
      score: number;
      applicableQuestions: number;
      scoredQuestions: number;
    }> = [];

    for (const cat of categories) {
      const applicabilityRecord = assessment.applicability.find((a) => a.categoryId === cat.id);
      // Reviewer decision takes precedence over startup declaration
      const isApplicable = applicabilityRecord?.reviewerApplicable !== null && applicabilityRecord?.reviewerApplicable !== undefined
        ? applicabilityRecord.reviewerApplicable
        : (applicabilityRecord?.startupApplicable ?? true);

      const catResponses = assessment.responses
        .filter((r) => r.question.categoryId === cat.id)
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
    scoreRecords.push({
      assessmentId,
      categoryId: null,
      score: overall.overallScore,
      applicableQuestions: overall.applicableCategoriesCount,
      scoredQuestions: overall.applicableCategoriesCount,
    });

    const nextReviewDate = new Date();
    nextReviewDate.setMonth(nextReviewDate.getMonth() + (params.nextReviewMonths ?? 12));

    await prisma.$transaction(async (tx) => {
      // Update assessment
      await tx.ipAssessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.APPROVED, approvedAt: new Date() },
      });

      // Replace scores with final reviewer-verified scores
      await tx.ipScore.deleteMany({ where: { assessmentId } });
      await tx.ipScore.createMany({
        data: scoreRecords.map((s) => ({
          assessmentId: s.assessmentId,
          categoryId: s.categoryId ?? undefined,
          score: s.score,
          applicableQuestions: s.applicableQuestions,
          scoredQuestions: s.scoredQuestions,
        })),
      });

      // Create review record
      await tx.reviewRecord.create({
        data: {
          assessmentId,
          reviewerId,
          decision: ReviewDecision.APPROVED,
          generalRemarks: params.generalRemarks,
          trademarkRemarks: params.trademarkRemarks,
          patentRemarks: params.patentRemarks,
          copyrightRemarks: params.copyrightRemarks,
          recommendations: params.recommendations,
          previousStatus: assessment.status,
          newStatus: AssessmentStatus.APPROVED,
        },
      });

      // Create review schedule (next review)
      await tx.reviewSchedule.create({
        data: {
          startupId: assessment.startupId,
          assessmentId,
          reviewerId,
          scheduledDate: nextReviewDate,
          status: ReviewStatus.SCHEDULED,
        },
      });

      // Audit log
      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "ASSESSMENT_APPROVED",
          entityType: "IpAssessment",
          entityId: assessmentId,
          newValues: { overallScore: overall.overallScore, nextReviewDate },
        },
      }).catch(() => {});
    });

    return { assessmentId, overallScore: overall.overallScore, classification: overall.classification, nextReviewDate };
  }

  /**
   * Requests changes on an assessment.
   */
  static async requestChanges(
    assessmentId: string,
    reviewerId: string,
    remarks: string
  ) {
    const assessment = await prisma.ipAssessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) throw new Error("Assessment not found.");

    AssessmentStateMachine.validateTransition(assessment.status, AssessmentStatus.CHANGES_REQUESTED);

    await prisma.$transaction(async (tx) => {
      await tx.ipAssessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.CHANGES_REQUESTED },
      });

      await tx.reviewRecord.create({
        data: {
          assessmentId,
          reviewerId,
          decision: ReviewDecision.CHANGES_REQUESTED,
          generalRemarks: remarks,
          previousStatus: assessment.status,
          newStatus: AssessmentStatus.CHANGES_REQUESTED,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "ASSESSMENT_CHANGES_REQUESTED",
          entityType: "IpAssessment",
          entityId: assessmentId,
          newValues: { remarks },
        },
      }).catch(() => {});
    });
  }

  /**
   * Rejects an assessment.
   */
  static async rejectAssessment(
    assessmentId: string,
    reviewerId: string,
    reason: string
  ) {
    const assessment = await prisma.ipAssessment.findUnique({ where: { id: assessmentId } });
    if (!assessment) throw new Error("Assessment not found.");

    AssessmentStateMachine.validateTransition(assessment.status, AssessmentStatus.REJECTED);

    await prisma.$transaction(async (tx) => {
      await tx.ipAssessment.update({
        where: { id: assessmentId },
        data: { status: AssessmentStatus.REJECTED },
      });

      await tx.reviewRecord.create({
        data: {
          assessmentId,
          reviewerId,
          decision: ReviewDecision.REJECTED,
          generalRemarks: reason,
          previousStatus: assessment.status,
          newStatus: AssessmentStatus.REJECTED,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: reviewerId,
          action: "ASSESSMENT_REJECTED",
          entityType: "IpAssessment",
          entityId: assessmentId,
          newValues: { reason },
        },
      }).catch(() => {});
    });
  }

  /**
   * Returns historical review records for the reviewer.
   */
  static async getReviewHistory(reviewerId: string) {
    return prisma.reviewRecord.findMany({
      where: { reviewerId },
      orderBy: { reviewedAt: "desc" },
      include: {
        assessment: {
          include: {
            startup: { select: { id: true, startupCode: true, name: true } },
          },
        },
      },
    });
  }
}

