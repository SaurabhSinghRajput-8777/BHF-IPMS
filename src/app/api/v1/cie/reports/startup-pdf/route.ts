import { NextResponse } from "next/server";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { ReportService } from "@/services/report.service";

export async function GET(request: Request) {
  await connection();
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "CIE_ADMIN" && user.role !== "REVIEWER")) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "UNAUTHORIZED", message: "Institutional access required." },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const startupId = searchParams.get("startupId");

    if (!assessmentId || !startupId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: "BAD_REQUEST", message: "Missing assessmentId or startupId query parameters." },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const reportCode = await ReportService.generateReportCode();
    const pdfBuffer = await ReportService.buildStartupPdfReport(assessmentId, startupId, reportCode);

    await ReportService.logReportGeneration("STARTUP_REPORT", user.id, {
      startupId,
      assessmentId,
      filters: { reportCode },
    });

    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="BHF-Report-${reportCode}-${timestampStr}.pdf"`,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "INTERNAL_ERROR", message: errorMessage },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
