"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Loader2,
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
} from "lucide-react";

interface ReportItem {
  startupId: string;
  startupCode: string;
  startupName: string;
  founderName: string;
  industry: string;
  startupStage: string;
  assessmentId: string | null;
  version: number | null;
  status: string;
  score: number | null;
  classification: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewerName: string | null;
}

interface ExportLog {
  id: string;
  reportCode: string;
  reportType: string;
  startupName: string;
  startupCode: string;
  generatedBy: string;
  generatedAt: string;
}

export function CieReportsClient() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [recentLogs, setRecentLogs] = useState<ExportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const fetchReports = async (query = "") => {
    try {
      const res = await fetch(`/api/v1/cie/reports/list${query ? `?search=${encodeURIComponent(query)}` : ""}`);
      const json = await res.json();
      if (json.success && json.data) {
        setItems(json.data.items || []);
        setRecentLogs(json.data.recentLogs || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    startTransition(() => {
      fetchReports(val);
    });
  };

  const downloadStartupPdf = async (startupId: string, assessmentId: string, startupCode: string) => {
    try {
      setDownloadingId(assessmentId);
      const url = `/api/v1/cie/reports/startup-pdf?startupId=${startupId}&assessmentId=${assessmentId}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData?.error?.message || "Failed to generate PDF report.");
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `BHF-IP-Report-${startupCode}-${timestamp}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Refresh recent logs
      fetchReports(search);
    } catch {
      alert("An unexpected error occurred while downloading the PDF report.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[850px] h-[360px] bg-sky-950/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/cie/dashboard"
              className="text-white/70 hover:text-white transition-colors p-2.5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="IPMS Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain drop-shadow"
              />
            </Link>
            <div>
              <h1 className="font-semibold text-white text-base sm:text-lg tracking-wide font-[family-name:var(--font-aldrich)]">
                CIE Institutional Reports &amp; Exports
              </h1>
              <p className="text-xs text-white/50">Official Timestamped PDF Generation &amp; Audit Logs</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <a href="/api/v1/cie/reports/analytics?format=xlsx" download>
              <Button
                size="sm"
                variant="outline"
                className="h-10 border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Export Excel
              </Button>
            </a>
            <Link href="/cie/dashboard">
              <Button
                size="sm"
                variant="outline"
                className="h-10 border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
              >
                Dashboard
              </Button>
            </Link>
            <Link href="/cie/reviewer/queue">
              <Button
                size="sm"
                className="h-10 bg-white text-slate-950 hover:bg-white/90 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] tracking-[0.05em] cursor-pointer shadow-md shadow-white/10"
              >
                Review Queue <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
            <UserProfileMenu />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* Banner Info Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-2xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-300 text-xs font-[family-name:var(--font-aldrich)]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>INSTITUTIONAL AUDIT ENGINE</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
                Startup IP Evaluation Reports
              </h2>
              <p className="text-sm text-white/60 leading-relaxed">
                Generate and download official PDF reports for incubated startups. Every generated document includes an
                immutable timestamp, unique institutional code (<span className="text-white/80 font-mono">BHF-REP-2026-XXXX</span>),
                detailed category score breakdowns, and reviewer recommendations.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <a href="/api/v1/cie/reports/analytics?format=xlsx" download className="w-full sm:w-auto">
                <Button
                  className="w-full h-11 border border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-[family-name:var(--font-aldrich)] tracking-wider cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-400" />
                  Portfolio Excel Register
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search startup name, code, founder..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:border-white/30 text-sm font-[family-name:var(--font-aldrich)]"
            />
          </div>
          <div className="flex items-center space-x-4 text-xs font-[family-name:var(--font-aldrich)] text-white/50 w-full sm:w-auto justify-end">
            <span>TOTAL RECORDS: <strong className="text-white">{items.length}</strong></span>
            <span>•</span>
            <span>FORMAT: <strong className="text-sky-400">PDF / A4</strong></span>
          </div>
        </div>

        {/* Startups Table Card */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-xl shadow-black/60 rounded-3xl overflow-hidden">
          <CardHeader className="p-6 border-b border-white/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)] flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-white/50" />
                <span>Incubated Ventures Assessment Registry</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/50 mt-1">
                Select an assessment to generate a timestamped official PDF
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-7 w-7 animate-spin text-white/60" />
                <p className="text-xs text-white/40 font-[family-name:var(--font-aldrich)]">Loading report records...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-sm text-white/40 font-[family-name:var(--font-aldrich)]">No assessment records found matching query.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white/[0.02]">
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                      <TableHead className="text-xs font-semibold text-white/50 uppercase tracking-[0.1em] font-[family-name:var(--font-aldrich)] py-4 pl-6">
                        Venture &amp; Code
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-white/50 uppercase tracking-[0.1em] font-[family-name:var(--font-aldrich)] py-4">
                        Founder / Sector
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-white/50 uppercase tracking-[0.1em] font-[family-name:var(--font-aldrich)] py-4">
                        Assessment Version
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-white/50 uppercase tracking-[0.1em] font-[family-name:var(--font-aldrich)] py-4">
                        Score &amp; Tier
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-white/50 uppercase tracking-[0.1em] font-[family-name:var(--font-aldrich)] py-4">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-white/50 uppercase tracking-[0.1em] font-[family-name:var(--font-aldrich)] py-4 pr-6 text-right">
                        PDF Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((row, idx) => {
                      const isDownloading = downloadingId === row.assessmentId;
                      const hasAssessment = !!row.assessmentId;

                      return (
                        <TableRow
                          key={`${row.startupId}-${row.assessmentId || idx}`}
                          className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                        >
                          <TableCell className="py-4 pl-6">
                            <div className="font-semibold text-white text-sm">{row.startupName}</div>
                            <div className="text-xs text-white/50 font-mono tracking-wider mt-0.5">{row.startupCode}</div>
                          </TableCell>

                          <TableCell className="py-4">
                            <div className="text-sm text-white/80">{row.founderName}</div>
                            <div className="text-xs text-white/40">{row.industry} • {row.startupStage}</div>
                          </TableCell>

                          <TableCell className="py-4">
                            {hasAssessment ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-xs font-[family-name:var(--font-aldrich)] text-white/80">
                                  Version {row.version}
                                </span>
                                {row.submittedAt && (
                                  <div className="text-[11px] text-white/40 mt-1 flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(row.submittedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-white/30 italic">No submissions yet</span>
                            )}
                          </TableCell>

                          <TableCell className="py-4">
                            {row.score !== null ? (
                              <div>
                                <div className="text-base font-bold text-white font-[family-name:var(--font-aldrich)]">
                                  {row.score.toFixed(1)}%
                                </div>
                                <div className="text-[11px] text-white/50">{row.classification}</div>
                              </div>
                            ) : (
                              <span className="text-xs text-white/30">N/A</span>
                            )}
                          </TableCell>

                          <TableCell className="py-4">
                            {row.status === "APPROVED" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
                              </span>
                            ) : row.status === "SUBMITTED" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-sky-500/20 bg-sky-500/10 text-sky-300">
                                Submitted
                              </span>
                            ) : row.status === "REVISION_REQUESTED" ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-amber-500/20 bg-amber-500/10 text-amber-300">
                                Revisions
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-white/40">
                                Not Assessed
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="py-4 pr-6 text-right">
                            {hasAssessment ? (
                              <Button
                                size="sm"
                                disabled={isDownloading}
                                onClick={() => downloadStartupPdf(row.startupId, row.assessmentId!, row.startupCode)}
                                className="h-9 px-3 bg-white text-slate-950 hover:bg-white/90 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] tracking-wider cursor-pointer shadow-md shadow-white/10 disabled:opacity-50"
                              >
                                {isDownloading ? (
                                  <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                    <span>Generating...</span>
                                  </>
                                ) : (
                                  <>
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    <span>Generate PDF</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled
                                className="h-9 px-3 border-white/10 text-white/30 text-xs rounded-xl"
                              >
                                Unavailable
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Log Card */}
        {recentLogs.length > 0 && (
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-xl shadow-black/60 rounded-3xl p-6 sm:p-8">
            <CardHeader className="p-0 pb-5">
              <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)] flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Recent Institutional Export Audit Logs</span>
              </CardTitle>
              <CardDescription className="text-xs text-white/50 mt-1">
                Cryptographically tracked generation receipts with institutional codes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-sky-400">{log.reportCode}</span>
                      <span className="text-[10px] text-white/40 font-[family-name:var(--font-aldrich)]">
                        {log.reportType === "STARTUP_EVALUATION_REPORT" ? "PDF" : "XLSX"}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">{log.startupName}</div>
                    <div className="text-[11px] text-white/50 flex items-center justify-between">
                      <span>By: {log.generatedBy}</span>
                      <span>{new Date(log.generatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

