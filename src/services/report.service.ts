import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
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

  /**
   * Generates a high-precision, executive-ready PDF report for an individual startup.
   */
  static async buildStartupPdfReport(
    assessmentId: string,
    startupId: string,
    reportCode: string
  ): Promise<Buffer> {
    const data = await this.getStartupReportData(assessmentId, startupId);

    const startup = data.startup;
    const overallScoreObj = data.scores.find((s) => s.categoryId === null);
    const overallScore = overallScoreObj ? Number(overallScoreObj.score) : 0;
    const classification = ScoringEngineService.classifyScore(overallScore);
    const review = data.reviews[0] ?? null;
    const schedule = data.schedules[0] ?? null;

    const generatedAt = new Date();
    const formattedTimestamp = generatedAt.toISOString().replace("T", " ").substring(0, 19) + " UTC";
    const submittedAt = data.submittedAt ? new Date(data.submittedAt).toLocaleDateString("en-IN", { dateStyle: "long" }) : "N/A";
    const reviewedAt = review?.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString("en-IN", { dateStyle: "long" }) : "Pending Review";
    const nextReviewDate = schedule?.scheduledDate ? new Date(schedule.scheduledDate).toLocaleDateString("en-IN", { dateStyle: "long" }) : "To be scheduled";

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margin: 40,
          bufferPages: true,
          info: {
            Title: `IP Readiness Report - ${startup.name} (${startup.startupCode})`,
            Author: "Bennett Hatchery - Centre for Innovation & Entrepreneurship",
            Subject: "Startup IP Maturity Assessment & Audit",
            Keywords: "IPMS, Bennett University, Intellectual Property, Assessment",
          },
        });

        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", (err: Error) => reject(err));

        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 40;
        const contentWidth = pageWidth - margin * 2;

        // Top Institutional Banner
        doc.rect(0, 0, pageWidth, 90).fill("#090D16");
        doc.rect(0, 88, pageWidth, 2).fill("#2563EB"); // Blue accent line

        // Banner Typography
        doc.fillColor("#FFFFFF").fontSize(16).font("Helvetica-Bold").text("BENNETT UNIVERSITY HATCHERY", margin, 24);
        doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("CENTRE FOR INNOVATION & ENTREPRENEURSHIP (CIE)", margin, 44);
        doc.fillColor("#60A5FA").fontSize(8.5).font("Helvetica-Bold").text("INTELLECTUAL PROPERTY MANAGEMENT SYSTEM | OFFICIAL REPORT", margin, 60);

        // Right side metadata in banner
        doc.fillColor("#FFFFFF").fontSize(9).font("Helvetica-Bold").text(reportCode, pageWidth - margin - 150, 26, { width: 150, align: "right" });
        doc.fillColor("#94A3B8").fontSize(7.5).font("Helvetica").text(`Generated: ${formattedTimestamp}`, pageWidth - margin - 200, 42, { width: 200, align: "right" });
        doc.fillColor("#10B981").fontSize(8).font("Helvetica-Bold").text(`STATUS: ${data.status}`, pageWidth - margin - 150, 58, { width: 150, align: "right" });

        let currentY = 110;

        // Section 1: Executive Venture Overview
        doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text("1. EXECUTIVE VENTURE OVERVIEW", margin, currentY);
        currentY += 18;

        // Draw profile box
        doc.rect(margin, currentY, contentWidth, 80).fillAndStroke("#F8FAFC", "#E2E8F0");

        // Column 1
        const col1X = margin + 14;
        const col2X = margin + 180;
        const col3X = margin + 350;

        doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("STARTUP VENTURE", col1X, currentY + 12);
        doc.fillColor("#0F172A").fontSize(10.5).font("Helvetica-Bold").text(startup.name, col1X, currentY + 24);

        doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("FOUNDER / LEAD", col1X, currentY + 44);
        doc.fillColor("#1E293B").fontSize(9.5).font("Helvetica").text(startup.founderName, col1X, currentY + 56);

        // Column 2
        doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("STARTUP CODE", col2X, currentY + 12);
        doc.fillColor("#2563EB").fontSize(10.5).font("Helvetica-Bold").text(startup.startupCode, col2X, currentY + 24);

        doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("INCUBATION STAGE", col2X, currentY + 44);
        doc.fillColor("#1E293B").fontSize(9.5).font("Helvetica").text(startup.startupStage.toUpperCase(), col2X, currentY + 56);

        // Column 3
        doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("INDUSTRY DOMAIN", col3X, currentY + 12);
        doc.fillColor("#0F172A").fontSize(10).font("Helvetica-Bold").text(startup.industry, col3X, currentY + 24);

        doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("ASSESSMENT VERSION", col3X, currentY + 44);
        doc.fillColor("#1E293B").fontSize(9.5).font("Helvetica").text(`Version ${data.version} (Submitted: ${submittedAt})`, col3X, currentY + 56);

        currentY += 95;

        // Section 2: IP Readiness Index & Classification
        doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text("2. IP READINESS INDEX & CLASSIFICATION", margin, currentY);
        currentY += 18;

        // Main Score Badge Card
        const scoreCardHeight = 82;
        doc.rect(margin, currentY, contentWidth, scoreCardHeight).fillAndStroke("#F0F9FF", "#BAE6FD");

        // Left Score Column (Width ~ 160)
        doc.fillColor("#0369A1").fontSize(8).font("Helvetica-Bold").text("OVERALL IP READINESS SCORE", margin + 18, currentY + 16, { width: 140 });
        doc.fillColor("#0284C7").fontSize(32).font("Helvetica-Bold").text(`${overallScore.toFixed(1)}%`, margin + 18, currentY + 32, { width: 140 });

        // Divider between score and classification description
        doc.moveTo(margin + 170, currentY + 14).lineTo(margin + 170, currentY + scoreCardHeight - 14).strokeColor("#BAE6FD").stroke();

        const scoreTierDesc =
          overallScore >= 80 ? "STRONG IP READINESS (TIER 5)" :
          overallScore >= 60 ? "ADVANCED IP READINESS (TIER 4)" :
          overallScore >= 40 ? "INTERMEDIATE IP READINESS (TIER 3)" :
          overallScore >= 20 ? "DEVELOPING IP READINESS (TIER 2)" : "INITIAL IP READINESS (TIER 1)";

        const rightColX = margin + 185;
        const rightColWidth = contentWidth - 195;

        doc.fillColor("#0F172A").fontSize(11.5).font("Helvetica-Bold").text(scoreTierDesc, rightColX, currentY + 18, { width: rightColWidth });
        doc.fillColor("#475569").fontSize(8.5).font("Helvetica").text(
          `Classification tier evaluates comprehensive statutory protection across applicable patents, trademarks, copyrights, and foundational general IP governance policies.`,
          rightColX,
          currentY + 38,
          { width: rightColWidth, lineGap: 2 }
        );

        currentY += scoreCardHeight + 16;

        // Section 3: Category Breakdown
        doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text("3. CATEGORY PERFORMANCE BREAKDOWN", margin, currentY);
        currentY += 18;

        // Table Header
        const tableY = currentY;
        doc.rect(margin, tableY, contentWidth, 22).fill("#1E293B");
        doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold").text("IP CATEGORY", margin + 10, tableY + 6);
        doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold").text("APPLICABILITY STATUS", margin + 200, tableY + 6);
        doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold").text("CATEGORY SCORE", margin + 350, tableY + 6);
        doc.fillColor("#FFFFFF").fontSize(8.5).font("Helvetica-Bold").text("TIER RATING", margin + 450, tableY + 6);

        currentY += 22;

        const categoriesList = [
          { code: "GENERAL_IP", name: "General IP Strategy & Foundation" },
          { code: "TRADEMARK", name: "Trademarks & Brand Identity" },
          { code: "PATENT", name: "Patents & Novel Inventions" },
          { code: "COPYRIGHT", name: "Copyrights, Code & Content" },
        ];

        for (let i = 0; i < categoriesList.length; i++) {
          const cat = categoriesList[i];
          const appRecord = data.applicability.find((a) => a.category?.code === cat.code);
          const isApplicable = appRecord
            ? (appRecord.reviewerApplicable !== null && appRecord.reviewerApplicable !== undefined
                ? appRecord.reviewerApplicable
                : appRecord.startupApplicable)
            : true; // Default General IP is always applicable

          let catScoreVal: number;
          if (cat.code === "GENERAL_IP") {
            // General IP questions have no categoryId; score is stored in overall or general
            const genScoreRecord = data.scores.find((s) => s.categoryId === null);
            catScoreVal = genScoreRecord ? Number(genScoreRecord.score) : 0;
          } else {
            const scoreRecord = data.scores.find((s) => s.category?.code === cat.code);
            catScoreVal = scoreRecord ? Number(scoreRecord.score) : 0;
          }

          const rowBg = i % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
          doc.rect(margin, currentY, contentWidth, 24).fillAndStroke(rowBg, "#E2E8F0");

          doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(cat.name, margin + 10, currentY + 7);
          
          if (isApplicable) {
            doc.fillColor("#059669").fontSize(8).font("Helvetica-Bold").text("APPLICABLE", margin + 200, currentY + 7);
            doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(`${catScoreVal.toFixed(1)}%`, margin + 350, currentY + 7);
            const tier = ScoringEngineService.classifyScore(catScoreVal);
            doc.fillColor("#475569").fontSize(8).font("Helvetica").text(tier, margin + 450, currentY + 7);
          } else {
            doc.fillColor("#DC2626").fontSize(8).font("Helvetica-Bold").text("EXCLUDED (N/A)", margin + 200, currentY + 7);
            doc.fillColor("#94A3B8").fontSize(8.5).font("Helvetica").text("Excluded", margin + 350, currentY + 7);
            doc.fillColor("#94A3B8").fontSize(8).font("Helvetica").text("Not Applicable", margin + 450, currentY + 7);
          }

          currentY += 24;
        }

        currentY += 20;

        // Section 4: Institutional Review & Observations
        doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text("4. CIE REVIEWER OBSERVATIONS & RECOMMENDATIONS", margin, currentY);
        currentY += 18;

        const reviewBoxHeight = 110;
        doc.rect(margin, currentY, contentWidth, reviewBoxHeight).fillAndStroke("#FDFDFD", "#CBD5E1");

        const reviewerName = review?.reviewer?.name ?? "Designated Institutional Reviewer";
        const reviewerEmail = review?.reviewer?.email ?? "cie@bennett.edu.in";
        const feedbackText = review?.recommendations || review?.generalRemarks || "Assessment reviewed by Bennett Hatchery Institutional Panel. Continue regular execution of intellectual property protection cadence according to incubation guidelines.";

        doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text("REVIEWER ASSIGNED", margin + 12, currentY + 10);
        doc.fillColor("#0F172A").fontSize(9.5).font("Helvetica").text(`${reviewerName} (${reviewerEmail})`, margin + 12, currentY + 22);

        doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text("REVIEW VERDICT DATE", margin + 320, currentY + 10);
        doc.fillColor("#0F172A").fontSize(9.5).font("Helvetica").text(`${reviewedAt} | Next Cadence: ${nextReviewDate}`, margin + 320, currentY + 22);

        doc.fillColor("#64748B").fontSize(8).font("Helvetica-Bold").text("STRATEGIC RECOMMENDATIONS & ADVISORY NOTES", margin + 12, currentY + 42);
        doc.fillColor("#1E293B").fontSize(8.5).font("Helvetica").text(feedbackText, margin + 12, currentY + 54, {
          width: contentWidth - 24,
          height: 48,
          ellipsis: true,
        });

        currentY += reviewBoxHeight + 25;

        // Institutional Certification Seal & Footer
        doc.rect(margin, currentY, contentWidth, 50).fillAndStroke("#F8FAFC", "#E2E8F0");
        doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text("OFFICIAL INSTITUTIONAL RECORD CERTIFICATION", margin + 12, currentY + 10);
        doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text(
          `This document is certified by the Centre for Innovation and Entrepreneurship (CIE), Bennett University. It serves as an official IP status report for internal records, grant applications, and investor diligence. Document verification code: ${reportCode} | Generated on ${formattedTimestamp}.`,
          margin + 12,
          currentY + 24,
          { width: contentWidth - 24 }
        );

        // Page Numbering Footer on all pages
        const pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
          doc.switchToPage(i);
          doc.fillColor("#94A3B8").fontSize(7.5).font("Helvetica").text(
            `Bennett Hatchery IPMS | Official Report ${reportCode} | Page ${i + 1} of ${pages.count}`,
            margin,
            pageHeight - 28,
            { width: contentWidth, align: "center" }
          );
        }

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
