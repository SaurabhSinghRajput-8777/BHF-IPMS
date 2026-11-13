import { prisma } from "@/lib/prisma";
import { AssessmentStatus } from "@prisma/client";
import { ScoringEngineService } from "@/services/scoring.service";

export interface AssessmentRecordForAnalytics {
  id: string;
  startupId: string;
  version: number;
  status: string;
  score: number;
  approvedAt: Date | null;
}

export type ReviewUrgencyCategory = "OVERDUE" | "DUE_7_DAYS" | "DUE_30_DAYS" | "UPCOMING";

export class AnalyticsService {
  /**
   * Filters a collection of assessments to retain strictly the latest approved assessment per startup.
   */
  static filterLatestApprovedAssessments<T extends { startupId: string; version: number; status: string }>(
    assessments: T[]
  ): T[] {
    const approved = assessments.filter((a) => a.status === "APPROVED");
    const latestByStartup = new Map<string, T>();

    for (const a of approved) {
      const existing = latestByStartup.get(a.startupId);
      if (!existing || a.version > existing.version) {
        latestByStartup.set(a.startupId, a);
      }
    }

    return Array.from(latestByStartup.values());
  }

  /**
   * Categorizes a scheduled review date into monitoring buckets relative to a reference date.
   */
  static categorizeReviewSchedule(scheduledDate: Date, referenceDate: Date = new Date()): ReviewUrgencyCategory {
    const diffMs = scheduledDate.getTime() - referenceDate.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "OVERDUE";
    if (diffDays <= 7) return "DUE_7_DAYS";
    if (diffDays <= 30) return "DUE_30_DAYS";
    return "UPCOMING";
  }

  /**
   * Returns portfolio KPIs: total startups, assessed, average score, distribution.
   */
  static async getPortfolioKpis() {
    const totalStartups = await prisma.startup.count();

    // Get latest approved assessment per startup with their overall scores
    const approvedAssessments = await prisma.ipAssessment.findMany({
      where: { status: AssessmentStatus.APPROVED },
      include: { scores: { where: { categoryId: null } } },
      orderBy: { version: "desc" },
    });

    // Keep only the latest approved per startup
    const latestApproved = this.filterLatestApprovedAssessments(
      approvedAssessments.map((a) => ({
        ...a,
        status: a.status as string,
        score: Number(a.scores[0]?.score ?? 0),
      }))
    );

    const totalAssessed = latestApproved.length;
    const avgScore = totalAssessed > 0
      ? latestApproved.reduce((acc, a) => acc + a.score, 0) / totalAssessed
      : 0;

    // Score distribution
    const distribution = {
      initial: 0,
      developing: 0,
      intermediate: 0,
      advanced: 0,
      strong: 0,
    };
    for (const a of latestApproved) {
      const cls = ScoringEngineService.classifyScore(a.score);
      if (cls === "Initial") distribution.initial++;
      else if (cls === "Developing") distribution.developing++;
      else if (cls === "Intermediate") distribution.intermediate++;
      else if (cls === "Advanced") distribution.advanced++;
      else distribution.strong++;
    }

    // Pending queue
    const pendingReview = await prisma.ipAssessment.count({
      where: { status: { in: [AssessmentStatus.SUBMITTED, AssessmentStatus.RESUBMITTED, AssessmentStatus.UNDER_REVIEW] } },
    });

    return {
      totalStartups,
      totalAssessed,
      avgScore: Math.round(avgScore * 100) / 100,
      pendingReview,
      distribution,
    };
  }

  /**
   * Returns category-wise IP readiness scores across the portfolio.
   */
  static async getCategoryDistribution() {
    const categories = await prisma.ipCategory.findMany({ where: { isActive: true } });

    const result = [];
    for (const cat of categories) {
      // Latest approved scores for this category
      const scores = await prisma.ipScore.findMany({
        where: {
          categoryId: cat.id,
          assessment: { status: AssessmentStatus.APPROVED },
        },
        include: { assessment: { select: { startupId: true, version: true } } },
      });

      // Keep only latest approved per startup (by highest version)
      const latestByStartup = new Map<string, { score: number; version: number }>();
      for (const s of scores) {
        const existing = latestByStartup.get(s.assessment.startupId);
        if (!existing || s.assessment.version > existing.version) {
          latestByStartup.set(s.assessment.startupId, {
            score: Number(s.score),
            version: s.assessment.version,
          });
        }
      }

      const scoreArr = Array.from(latestByStartup.values()).map((v) => v.score);
      const avg = scoreArr.length > 0 ? scoreArr.reduce((a, b) => a + b, 0) / scoreArr.length : 0;

      result.push({
        category: cat.name,
        code: cat.code,
        averageScore: Math.round(avg * 100) / 100,
        startupsWithData: scoreArr.length,
      });
    }

    return result;
  }

  /**
   * Returns monthly submission and approval counts for trend charts.
   */
  static async getMonthlyTrends(months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const submissions = await prisma.ipAssessment.findMany({
      where: { submittedAt: { gte: startDate } },
      select: { submittedAt: true },
    });

    const approvals = await prisma.ipAssessment.findMany({
      where: { approvedAt: { gte: startDate } },
      select: { approvedAt: true },
    });

    // Build monthly buckets
    const buckets: Record<string, { month: string; submissions: number; approvals: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date(startDate);
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets[key] = { month: key, submissions: 0, approvals: 0 };
    }

    for (const s of submissions) {
      if (s.submittedAt) {
        const key = `${s.submittedAt.getFullYear()}-${String(s.submittedAt.getMonth() + 1).padStart(2, "0")}`;
        if (buckets[key]) buckets[key].submissions++;
      }
    }

    for (const a of approvals) {
      if (a.approvedAt) {
        const key = `${a.approvedAt.getFullYear()}-${String(a.approvedAt.getMonth() + 1).padStart(2, "0")}`;
        if (buckets[key]) buckets[key].approvals++;
      }
    }

    return Object.values(buckets);
  }

  /**
   * Returns review schedule monitoring data categorized by urgency.
   */
  static async getReviewMonitoring() {
    const schedules = await prisma.reviewSchedule.findMany({
      where: { status: "SCHEDULED" },
      include: {
        startup: { select: { id: true, startupCode: true, name: true } },
        reviewer: { select: { id: true, name: true } },
        assessment: { select: { id: true, version: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    const categorized = {
      overdue: [] as typeof schedules,
      due7Days: [] as typeof schedules,
      due30Days: [] as typeof schedules,
      upcoming: [] as typeof schedules,
    };

    for (const s of schedules) {
      const cat = this.categorizeReviewSchedule(new Date(s.scheduledDate));
      if (cat === "OVERDUE") categorized.overdue.push(s);
      else if (cat === "DUE_7_DAYS") categorized.due7Days.push(s);
      else if (cat === "DUE_30_DAYS") categorized.due30Days.push(s);
      else categorized.upcoming.push(s);
    }

    return categorized;
  }
}
