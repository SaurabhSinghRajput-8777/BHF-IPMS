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

    if (diffDays < 0) {
      return "OVERDUE";
    }
    if (diffDays <= 7) {
      return "DUE_7_DAYS";
    }
    if (diffDays <= 30) {
      return "DUE_30_DAYS";
    }
    return "UPCOMING";
  }
}

