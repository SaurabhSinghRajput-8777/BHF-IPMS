import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import { ReportType } from "@prisma/client";
import { AnalyticsService } from "./analytics.service";
import { ScoringEngineService } from "./scoring.service";

export class ReportService {
  /**
   * Generates a unique institutional report code (e.g. BHF-REP-2026-0001).
   */
  static async generateReportCode(): Promise<string> {
    const year = 2026;
    const count = await prisma.reportRecord.count();
    const seq = String(count + 1).padStart(4, "0");
    return `BHF-REP-${year}-${seq}`;
  }

  /**
   * Retrieves data needed for an individual startup IP assessment report.
   */
  static async getStartupReportData(assessmentId: string, startupId: string) {
    const assessment = await prisma.ipAssessment.findFirst({
      where: { id: assessmentId, startupId },
      include: {
        startup: true,
        questionnaire: true,
        scores: { include: { category: true } },
        applicability: { include: { category: true } },
        responses: {
          include: {
            question: {
              include: { category: true },
            },
          },
        },
        reviews: {
          orderBy: { reviewedAt: "desc" },
          take: 1,
          include: {
            reviewer: {
              select: { name: true, email: true },
            },
          },
        },
        schedules: {
          orderBy: { scheduledDate: "asc" },
          take: 1,
        },
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found or unauthorized.");
    }

    return assessment;
  }

  /**
   * Creates an audit log record for a generated report.
   */
  static async logReportGeneration(
    reportType: ReportType,
    userId: string,
    params: { startupId?: string; assessmentId?: string; filters?: Record<string, string | number | boolean | null> }
  ) {
    const reportCode = await this.generateReportCode();

    const record = await prisma.reportRecord.create({
      data: {
        reportCode,
        reportType,
        startupId: params.startupId,
        assessmentId: params.assessmentId,
        generatedBy: userId,
        filters: params.filters ? JSON.parse(JSON.stringify(params.filters)) : undefined,
      },
    });

    return record;
  }

  /**
   * Builds an Excel workbook for CIE Consolidated Portfolio Analytics.
   */
  static async buildCiePortfolioExcelWorkbook(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Bennett Hatchery IPMS";
    workbook.created = new Date();

    // Sheet 1: Summary KPIs
    const kpis = await AnalyticsService.getPortfolioKpis();
    const summarySheet = workbook.addWorksheet("Portfolio Summary");
    summarySheet.columns = [
      { header: "Metric", key: "metric", width: 35 },
      { header: "Value", key: "value", width: 25 },
    ];

    summarySheet.addRow({ metric: "Total Incubated Startups", value: kpis.totalStartups });
    summarySheet.addRow({ metric: "Startups with Approved Assessments", value: kpis.totalAssessed });
    summarySheet.addRow({ metric: "Average Portfolio IP Readiness Score (%)", value: kpis.avgScore });
    summarySheet.addRow({ metric: "Pending Reviews in Queue", value: kpis.pendingReview });
    summarySheet.addRow({ metric: "Tier: Initial (0-20%)", value: kpis.distribution.initial });
    summarySheet.addRow({ metric: "Tier: Developing (21-40%)", value: kpis.distribution.developing });
    summarySheet.addRow({ metric: "Tier: Intermediate (41-60%)", value: kpis.distribution.intermediate });
    summarySheet.addRow({ metric: "Tier: Advanced (61-80%)", value: kpis.distribution.advanced });
    summarySheet.addRow({ metric: "Tier: Strong IP Readiness (81-100%)", value: kpis.distribution.strong });

    // Format Header Row
    summarySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    summarySheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" }, // Slate/Blue
    };

    // Sheet 2: Startups & Scores
    const startups = await prisma.startup.findMany({
      include: {
        assessments: {
          where: { status: "APPROVED" },
          orderBy: { version: "desc" },
          take: 1,
          include: {
            scores: { include: { category: true } },
            schedules: { take: 1, orderBy: { scheduledDate: "asc" } },
          },
        },
      },
      orderBy: { startupCode: "asc" },
    });

    const startupSheet = workbook.addWorksheet("Startup IP Register");
    startupSheet.columns = [
      { header: "Startup Code", key: "code", width: 15 },
      { header: "Startup Name", key: "name", width: 30 },
      { header: "Founder", key: "founder", width: 25 },
      { header: "Sector", key: "industry", width: 25 },
      { header: "Stage", key: "stage", width: 20 },
      { header: "Latest Version", key: "version", width: 15 },
      { header: "Overall IP Score (%)", key: "overallScore", width: 20 },
      { header: "Classification", key: "classification", width: 25 },
      { header: "Next Review Date", key: "nextReview", width: 20 },
    ];

    startupSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    startupSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E3A8A" },
    };

    for (const s of startups) {
      const latest = s.assessments[0];
      const overallScoreObj = latest?.scores.find((sc) => sc.categoryId === null);
      const scoreVal = overallScoreObj ? Number(overallScoreObj.score) : null;
      const classification = scoreVal !== null ? ScoringEngineService.classifyScore(scoreVal) : "Not Assessed";
      const nextReview = latest?.schedules[0]?.scheduledDate
        ? new Date(latest.schedules[0].scheduledDate).toISOString().split("T")[0]
        : "Pending";

      startupSheet.addRow({
        code: s.startupCode,
        name: s.name,
        founder: s.founderName,
        industry: s.industry,
        stage: s.startupStage,
        version: latest ? `V${latest.version}` : "None",
        overallScore: scoreVal !== null ? `${scoreVal.toFixed(1)}%` : "N/A",
        classification,
        nextReview,
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
