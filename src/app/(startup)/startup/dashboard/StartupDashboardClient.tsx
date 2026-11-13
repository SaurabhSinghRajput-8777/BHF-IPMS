"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

interface StartupDashboardData {
  startup: {
    id: string;
    startupCode: string;
    name: string;
    founderName: string;
    industry: string;
    startupStage: string;
  };
  assessments: Array<{
    id: string;
    version: number;
    status: string;
    submittedAt: string | null;
    approvedAt: string | null;
    scores: Array<{
      categoryId: string | null;
      score: number;
      applicableQuestions: number;
      scoredQuestions: number;
      category?: { name: string; code: string };
    }>;
    reviews: Array<{
      decision: string;
      generalRemarks: string | null;
      recommendations: string | null;
      reviewedAt: string;
    }>;
    schedules: Array<{
      scheduledDate: string;
      status: string;
    }>;
  }>;
}

export function StartupDashboardClient() {
  const [data, setData] = useState<StartupDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [profileRes, assessmentsRes] = await Promise.all([
          fetch("/api/v1/startups/me"),
          fetch("/api/v1/assessments"),
        ]);

        const profileJson = await profileRes.json();
        const assessmentsJson = await assessmentsRes.json();

        if (profileJson.success && assessmentsJson.success) {
          setData({
            startup: profileJson.data,
            assessments: assessmentsJson.data,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (!data?.startup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
        <h2 className="text-lg font-bold text-slate-800">No Startup Associated</h2>
        <p className="text-sm text-slate-600 mb-4">Please complete your startup profile first.</p>
        <Link href="/startup/profile">
          <Button>Complete Profile</Button>
        </Link>
      </div>
    );
  }

  const latestAssessment = data.assessments[0];
  const latestApproved = data.assessments.find((a) => a.status === "APPROVED");
  const overallScoreObj = (latestApproved || latestAssessment)?.scores.find((s) => s.categoryId === null);
  const overallScore = overallScoreObj ? Number(overallScoreObj.score) : null;

  // Category scores breakdown
  const categoryScores = (latestApproved || latestAssessment)?.scores.filter((s) => s.categoryId !== null) || [];

  const nextReviewSchedule = latestApproved?.schedules[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              BH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base">{data.startup.name}</h1>
              <p className="text-xs text-slate-500">Founder Portal • {data.startup.startupCode}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/startup/assessment">
              <Button size="sm" className="bg-blue-900 hover:bg-blue-800">
                {latestAssessment?.status === "DRAFT" ? "Continue Assessment" : "New Assessment"}
              </Button>
            </Link>
            <Link href="/startup/profile">
              <Button size="sm" variant="outline">
                Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Status Banner */}
        {latestAssessment?.status === "CHANGES_REQUESTED" && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-amber-900">Reviewer Requested Changes</h4>
              <p className="text-xs text-amber-700 mt-1">
                {latestAssessment.reviews[0]?.generalRemarks || "Please update your assessment answers per reviewer feedback and resubmit."}
              </p>
              <div className="mt-3">
                <Link href={`/startup/assessment?id=${latestAssessment.id}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs border-amber-300 text-amber-800 bg-white">
                    Update &amp; Resubmit <RotateCcw className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Overall IP Readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold text-slate-900">
                  {overallScore !== null ? `${overallScore.toFixed(1)}%` : "Pending"}
                </div>
                {overallScore !== null && (
                  <Badge
                    className={
                      overallScore >= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : overallScore >= 60
                        ? "bg-blue-100 text-blue-800"
                        : overallScore >= 40
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }
                  >
                    {overallScore >= 80
                      ? "Strong"
                      : overallScore >= 60
                      ? "Advanced"
                      : overallScore >= 40
                      ? "Intermediate"
                      : "Developing"}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {latestApproved ? `Official verified score (V${latestApproved.version})` : "Provisional / Pending approval"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assessment Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-sm font-semibold">
                  {latestAssessment ? latestAssessment.status.replace("_", " ") : "NOT STARTED"}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {latestAssessment ? `Latest Version: V${latestAssessment.version}` : "No submissions yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Next Review Due
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-slate-900">
                {nextReviewSchedule ? new Date(nextReviewSchedule.scheduledDate).toLocaleDateString() : "Pending Approval"}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {nextReviewSchedule ? "Institutional audit schedule" : "Assigned upon CIE approval"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{data.assessments.length}</div>
              <p className="text-xs text-slate-400 mt-1">Version histories retained</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown & Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Category Readiness Breakdown</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Scores reflect compliance, protection filings, and proprietary IP protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryScores.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Submit an assessment to see detailed category scores across Trademarks, Patents, and Copyrights.
                </div>
              ) : (
                categoryScores.map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{c.category?.name || "IP Category"}</span>
                      <span className="font-bold text-slate-900">{Number(c.score).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-900 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, Number(c.score)))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Guidance */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Institutional Guidance</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Bennett CIE Incubation recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-blue-900 mt-0.5 shrink-0" />
                <p>Complete all category assessments accurately. Trademark and Copyright protection can be initiated early.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-start space-x-2">
                <ShieldAlert className="h-4 w-4 text-slate-700 mt-0.5 shrink-0" />
                <p>Patent novelty checks must precede public disclosure or paper publication.</p>
              </div>
              <Link href="/startup/assessment" className="block pt-2">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-xs">
                  Start Assessment Wizard <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
