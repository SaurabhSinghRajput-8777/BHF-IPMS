"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  const handleApplicabilityChange = async (catId: string, applicable: boolean) => {
    setApplicabilityOverrides((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], applicable },
    }));

    try {
      await fetch(`/api/v1/reviewer/assessments/${assessmentId}/applicability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: catId,
          applicable,
          remarks: applicabilityOverrides[catId]?.remarks,
        }),
      });
    } catch {
      // silent
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
          generalRemarks,
          recommendations,
          nextReviewMonths: Number(nextReviewMonths) || 12,
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
    if (!generalRemarks || generalRemarks.length < 10) {
      setActionError("Please provide specific revision remarks (at least 10 characters).");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <p className="text-slate-600 mb-4">Assessment record not found.</p>
        <Link href="/cie/reviewer/queue">
          <Button variant="outline">Return to Queue</Button>
        </Link>
      </div>
    );
  }

  const overallScoreObj = data.scores.find((s) => s.categoryId === null);
  const overallScore = overallScoreObj ? Number(overallScoreObj.score) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/cie/reviewer/queue" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900 text-base">
                Review Workspace: {data.startup.name} (V{data.version})
              </h1>
              <p className="text-xs text-slate-500">{data.startup.startupCode} • Submitted {data.submittedAt ? new Date(data.submittedAt).toLocaleDateString() : ""}</p>
            </div>
          </div>
          <Badge className="font-mono text-xs bg-blue-900 text-white">
            {data.status}
          </Badge>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {actionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-3 text-rose-800 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Startup Overview Card */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">Venture Background</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Founder</span>
              <span className="font-semibold text-slate-800">{data.startup.founderName}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Sector</span>
              <span className="font-semibold text-slate-800">{data.startup.industry}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Stage</span>
              <span className="font-semibold text-slate-800">{data.startup.startupStage}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Provisional Score</span>
              <span className="font-semibold text-blue-900 text-sm">
                {overallScore !== null ? `${overallScore.toFixed(1)}%` : "Not Scored"}
              </span>
            </div>
            <div className="md:col-span-4 pt-2 border-t border-slate-100">
              <span className="text-slate-400 block">Proprietary Technology</span>
              <p className="text-slate-700 mt-1">{data.startup.productDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* Applicability Verification */}
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Category Applicability Verification</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Reviewers have institutional authority to verify or override category applicability. Inapplicable categories are excluded from portfolio calculations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.applicability.map((app) => {
              const currentOverride = applicabilityOverrides[app.categoryId]?.applicable ?? app.startupApplicable;
              return (
                <div key={app.categoryId} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{app.category.name}</span>
                    <span className="text-[11px] text-slate-500">
                      Founder Declared: {app.startupApplicable ? "Applicable" : "Not Applicable"}
                      {app.startupRemarks && ` (${app.startupRemarks})`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={currentOverride ? "default" : "outline"}
                      className={currentOverride ? "bg-blue-900 text-white h-7 text-xs" : "h-7 text-xs"}
                      onClick={() => handleApplicabilityChange(app.categoryId, true)}
                    >
                      Applicable
                    </Button>
                    <Button
                      size="sm"
                      variant={!currentOverride ? "default" : "outline"}
                      className={!currentOverride ? "bg-slate-700 text-white h-7 text-xs" : "h-7 text-xs"}
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
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Founder Assessment Responses</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Direct questionnaire responses submitted by the founding team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100">
                  <TableHead className="font-semibold text-slate-700">Question</TableHead>
                  <TableHead className="font-semibold text-slate-700">Category</TableHead>
                  <TableHead className="font-semibold text-slate-700">Response</TableHead>
                  <TableHead className="font-semibold text-slate-700">Application / Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.responses.map((r) => (
                  <TableRow key={r.id} className="border-slate-100">
                    <TableCell className="text-xs text-slate-800 max-w-md">{r.question.questionText}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {r.question.category?.name || "General IP"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          r.response === "YES"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 text-xs"
                            : r.response === "APPLIED"
                            ? "bg-blue-50 text-blue-800 border-blue-200 text-xs"
                            : "bg-slate-50 text-slate-700 text-xs"
                        }
                      >
                        {r.response}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">{r.textValue || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Decision & Sign-off Panel */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">Institutional Review &amp; Decision</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Approving this evaluation finalizes the scores, assigns a next review date, and publishes to the CIE portfolio dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">General Review Remarks *</Label>
              <Textarea
                placeholder="Institutional remarks, audit observations, and feedback for the founders..."
                value={generalRemarks}
                onChange={(e) => setGeneralRemarks(e.target.value)}
                className="text-xs"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Next Review Schedule (Months)</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={nextReviewMonths}
                  onChange={(e) => setNextReviewMonths(Number(e.target.value) || 12)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Strategic Recommendations</Label>
                <Input
                  placeholder="e.g. Expedite provisional patent before Q3 conference"
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                className="text-rose-700 border-rose-200 hover:bg-rose-50 text-xs"
                disabled={acting}
                onClick={handleReject}
              >
                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Assessment
              </Button>
              <Button
                variant="outline"
                className="text-amber-700 border-amber-200 hover:bg-amber-50 text-xs"
                disabled={acting}
                onClick={handleRequestChanges}
              >
                <AlertCircle className="h-3.5 w-3.5 mr-1" /> Request Changes
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-5"
                disabled={acting}
                onClick={handleApprove}
              >
                {acting ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                Approve &amp; Finalize Score
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
