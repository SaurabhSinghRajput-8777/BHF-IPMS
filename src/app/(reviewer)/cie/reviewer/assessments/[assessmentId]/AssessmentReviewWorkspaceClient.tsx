"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { ApiResponse } from "@/types";

interface AssessmentDetail {
  id: string;
  version: number;
  status: string;
  submittedAt: string | null;
  startup: {
    id: string;
    startupCode: string;
    name: string;
    founderName: string;
    industry: string;
    startupStage: string;
    description: string;
    productDescription: string;
  };
  applicability: Array<{
    categoryId: string;
    startupApplicable: boolean;
    startupRemarks: string | null;
    reviewerApplicable: boolean | null;
    reviewerRemarks: string | null;
    category: { id: string; name: string; code: string };
  }>;
  responses: Array<{
    id: string;
    questionId: string;
    response: string;
    textValue: string | null;
    question: {
      questionText: string;
      category?: { name: string; code: string } | null;
    };
  }>;
  scores: Array<{
    categoryId: string | null;
    score: number;
    category?: { name: string; code: string } | null;
  }>;
}

export function AssessmentReviewWorkspaceClient({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [data, setData] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState("");

  // Review Form States
  const [generalRemarks, setGeneralRemarks] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [nextReviewMonths, setNextReviewMonths] = useState(12);

  // Applicability overrides: catId -> { applicable: boolean, remarks: string }
  const [applicabilityOverrides, setApplicabilityOverrides] = useState<Record<string, { applicable: boolean; remarks: string }>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/v1/reviewer/assessments/${assessmentId}`);
        const json: ApiResponse<AssessmentDetail> = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          // Initialize overrides
          const initMap: Record<string, { applicable: boolean; remarks: string }> = {};
          for (const app of json.data.applicability) {
            initMap[app.categoryId] = {
              applicable: app.reviewerApplicable !== null ? app.reviewerApplicable : app.startupApplicable,
              remarks: app.reviewerRemarks || "",
            };
          }
          setApplicabilityOverrides(initMap);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [assessmentId]);

  const handleApplicabilityChange = async (categoryId: string, applicable: boolean) => {
    setApplicabilityOverrides((prev) => ({
      ...prev,
      [categoryId]: {
        applicable,
        remarks: prev[categoryId]?.remarks || "",
      },
    }));

    try {
      await fetch(`/api/v1/reviewer/assessments/${assessmentId}/applicability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          applicable,
          remarks: applicabilityOverrides[categoryId]?.remarks,
        }),
      });
    } catch {
      // silent fallback
    }
  };

  const handleApprove = async () => {
    setActing(true);
    setActionError("");
    try {
      const res = await fetch(`/api/v1/reviewer/assessments/${assessmentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generalRemarks: generalRemarks || "Assessment approved upon institutional review.",
          recommendations,
          nextReviewMonths,
        }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/cie/reviewer/queue");
      } else {
        setActionError(json.error?.message || "Failed to approve assessment.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setActing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!generalRemarks || generalRemarks.length < 5) {
      setActionError("Please provide clear revision instructions in the General Review Remarks field.");
      return;
    }
    setActing(true);
    setActionError("");
    try {
      const res = await fetch(`/api/v1/reviewer/assessments/${assessmentId}/request-changes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: generalRemarks }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/cie/reviewer/queue");
      } else {
        setActionError(json.error?.message || "Failed to request changes.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!generalRemarks || generalRemarks.length < 10) {
      setActionError("Please provide a formal rejection reason (at least 10 characters).");
      return;
    }
    setActing(true);
    setActionError("");
    try {
      const res = await fetch(`/api/v1/reviewer/assessments/${assessmentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: generalRemarks }),
      });
      const json = await res.json();
      if (json.success) {
        router.push("/cie/reviewer/queue");
      } else {
        setActionError(json.error?.message || "Failed to reject assessment.");
      }
    } catch {
      setActionError("Network error.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <p className="text-white/60 mb-4 font-[family-name:var(--font-aldrich)]">Assessment record not found.</p>
        <Link href="/cie/reviewer/queue">
          <Button variant="outline" className="border-white/20 text-white rounded-xl">Return to Queue</Button>
        </Link>
      </div>
    );
  }

  const overallScoreObj = data.scores.find((s) => s.categoryId === null);
  const overallScore = overallScoreObj ? Number(overallScoreObj.score) : null;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-sky-950/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 w-full">
        <div className="w-full px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/cie/reviewer/queue"
              className="text-white/70 hover:text-white transition-colors p-2.5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer"
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
                Review Workspace: {data.startup.name} (V{data.version})
              </h1>
              <p className="text-xs text-white/50">{data.startup.startupCode} • Submitted {data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : ""}</p>
            </div>
          </div>
          <Badge variant="outline" className="font-[family-name:var(--font-aldrich)] text-xs border-white/20 bg-white/10 text-white px-3.5 py-1 font-semibold rounded-full shadow-sm tracking-wider">
            {data.status}
          </Badge>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {actionError && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center space-x-3 text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Startup Overview Card */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10">
            <CardTitle className="text-lg font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
              Venture Background &amp; Telemetry
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-5 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Founder</span>
              <span className="font-semibold text-white">{data.startup.founderName}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Sector</span>
              <span className="font-semibold text-white">{data.startup.industry}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Incubation Stage</span>
              <span className="font-semibold text-white">{data.startup.startupStage}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Provisional Score</span>
              <span className="font-bold text-emerald-400 text-base font-[family-name:var(--font-aldrich)]">
                {overallScore !== null ? `${overallScore.toFixed(1)}%` : "Not Scored"}
              </span>
            </div>
            <div className="md:col-span-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mt-1">
              <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Proprietary Technology &amp; Innovation</span>
              <p className="text-white/80 text-sm leading-relaxed">{data.startup.productDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* Applicability Verification */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10">
            <CardTitle className="text-lg font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
              Category Applicability Verification
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-white/50 mt-1">
              Reviewers have institutional authority to verify or override category applicability. Inapplicable categories are excluded from portfolio calculations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 space-y-3">
            {data.applicability.map((app) => {
              const currentOverride = applicabilityOverrides[app.categoryId]?.applicable ?? app.startupApplicable;
              return (
                <div key={app.categoryId} className="p-4 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-semibold text-white block font-[family-name:var(--font-aldrich)]">{app.category.name}</span>
                    <span className="text-xs text-white/50">
                      Founder Declared: <b className="text-white/80">{app.startupApplicable ? "Applicable" : "Not Applicable"}</b>
                      {app.startupRemarks && ` (${app.startupRemarks})`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Button
                      size="sm"
                      variant={currentOverride ? "default" : "outline"}
                      className={
                        currentOverride
                          ? "bg-white text-slate-950 font-semibold h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer"
                          : "border-white/20 text-white/70 hover:text-white h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer"
                      }
                      onClick={() => handleApplicabilityChange(app.categoryId, true)}
                    >
                      Applicable
                    </Button>
                    <Button
                      size="sm"
                      variant={!currentOverride ? "default" : "outline"}
                      className={
                        !currentOverride
                          ? "bg-white/20 text-white h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer"
                          : "border-white/20 text-white/70 hover:text-white h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer"
                      }
                      onClick={() => handleApplicabilityChange(app.categoryId, false)}
                    >
                      Excluded (N/A)
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Responses Table */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10">
            <CardTitle className="text-lg font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
              Founder Assessment Responses
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-white/50 mt-1">
              Direct questionnaire responses submitted by the founding team.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5">
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <Table>
                <TableHeader className="bg-white/[0.03]">
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider py-4">Question</TableHead>
                    <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Category</TableHead>
                    <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Response</TableHead>
                    <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider pr-6">Application / Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.responses.map((r) => (
                    <TableRow key={r.id} className="border-white/5 hover:bg-white/[0.02]">
                      <TableCell className="text-sm text-white max-w-md py-4 leading-relaxed font-medium">{r.question.questionText}</TableCell>
                      <TableCell className="text-xs text-white/60 font-[family-name:var(--font-aldrich)]">
                        {r.question.category?.name || "General IP"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.response === "YES"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs font-[family-name:var(--font-aldrich)]"
                              : r.response === "APPLIED"
                              ? "bg-blue-500/10 text-blue-300 border-blue-500/30 text-xs font-[family-name:var(--font-aldrich)]"
                              : "bg-white/5 text-white/60 border-white/10 text-xs font-[family-name:var(--font-aldrich)]"
                          }
                        >
                          {r.response}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-white/50 pr-6">{r.textValue || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Decision & Sign-off Panel */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10">
            <CardTitle className="text-lg font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
              Institutional Review &amp; Decision
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-white/50 mt-1">
              Approving this evaluation finalizes the scores, assigns a next review date, and publishes to the CIE portfolio dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 pt-5 space-y-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-white/90 font-[family-name:var(--font-aldrich)]">
                General Review Remarks *
              </Label>
              <Textarea
                placeholder="Institutional remarks, audit observations, and feedback for the founders..."
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                className="text-sm bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 rounded-xl p-4 min-h-24"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-white/90 font-[family-name:var(--font-aldrich)]">
                  Next Review Schedule (Months)
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={nextReviewMonths}
                  onChange={(e) => setNextReviewMonths(Number(e.target.value) || 12)}
                  className="h-12 text-base bg-white/[0.05] border-white/15 text-white rounded-xl px-4"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-white/90 font-[family-name:var(--font-aldrich)]">
                  Strategic Recommendations
                </Label>
                <Input
                  placeholder="e.g. Expedite provisional patent before Q3 conference"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="h-12 text-base bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 rounded-xl px-4"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant="outline"
                className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 h-11 px-4 text-xs font-[family-name:var(--font-aldrich)] rounded-xl cursor-pointer"
                disabled={acting}
                onClick={handleReject}
              >
                <XCircle className="h-4 w-4 mr-1.5" /> Reject Assessment
              </Button>
              <Button
                variant="outline"
                className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 h-11 px-4 text-xs font-[family-name:var(--font-aldrich)] rounded-xl cursor-pointer"
                disabled={acting}
                onClick={handleRequestChanges}
              >
                <AlertCircle className="h-4 w-4 mr-1.5" /> Request Changes
              </Button>
              <Button
                className="bg-white text-slate-950 hover:bg-white/90 font-semibold h-11 px-6 text-xs font-[family-name:var(--font-aldrich)] rounded-xl shadow-lg shadow-white/10 cursor-pointer"
                disabled={acting}
                onClick={handleApprove}
              >
                {acting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-600" />}
                Approve &amp; Finalize Score
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
