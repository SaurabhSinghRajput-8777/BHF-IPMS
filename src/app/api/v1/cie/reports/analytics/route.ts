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
    const format = searchParams.get("format") || "xlsx";

    if (format === "xlsx") {
      const buffer = await ReportService.buildCiePortfolioExcelWorkbook();
      await ReportService.logReportGeneration("CIE_ANALYTICS_REPORT", user.id, {
        filters: { format: "xlsx" },
      });

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="CIE-IP-Portfolio-${new Date().toISOString().split("T")[0]}.xlsx"`,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: "UNSUPPORTED_FORMAT", message: "Requested format is not supported directly via this endpoint." },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate report",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
