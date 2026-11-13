"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!data?.startup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4 text-white">
        <AlertCircle className="h-10 w-10 text-amber-400 mb-2" />
        <h2 className="text-lg font-normal font-[family-name:var(--font-aldrich)]">No Startup Associated</h2>
        <p className="text-sm text-white/60 mb-4">Please complete your startup profile first.</p>
        <Link href="/startup/profile">
          <Button className="bg-white text-slate-950 hover:bg-white/90 rounded-xl font-[family-name:var(--font-aldrich)]">Complete Profile</Button>
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Top Bar */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="IPMS"
                width={36}
                height={36}
                className="h-8 w-8 object-contain"
              />
            </Link>
            <div>
              <h1 className="font-semibold text-white text-base tracking-wide font-[family-name:var(--font-aldrich)]">
                {data.startup.name}
              </h1>
              <p className="text-xs text-white/50">Founder Portal • <span className="font-mono text-white/70">{data.startup.startupCode}</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/startup/assessment">
              <Button size="sm" className="bg-white text-slate-950 hover:bg-white/90 font-semibold rounded-xl font-[family-name:var(--font-aldrich)] tracking-[0.05em]">
                {latestAssessment?.status === "DRAFT" ? "Continue Assessment" : "New Assessment"}
              </Button>
            </Link>
            <Link href="/startup/profile">
              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl font-[family-name:var(--font-aldrich)]">
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
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-300 font-[family-name:var(--font-aldrich)]">Reviewer Requested Changes</h4>
              <p className="text-xs text-amber-200/80 mt-1">
                {latestAssessment.reviews[0]?.generalRemarks || "Please update your assessment answers per reviewer feedback and resubmit."}
              </p>
              <div className="mt-3">
                <Link href={`/startup/assessment?id=${latestAssessment.id}`}>
                  <Button size="sm" variant="outline" className="h-8 text-xs border-amber-400/40 text-amber-300 hover:bg-amber-400/10 rounded-xl font-[family-name:var(--font-aldrich)]">
                    Update &amp; Resubmit <RotateCcw className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Overall IP Readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between font-[family-name:var(--font-aldrich)]">
                <div className="text-3xl font-normal text-white">
                  {overallScore !== null ? `${overallScore.toFixed(1)}%` : "Pending"}
                </div>
                {overallScore !== null && (
                  <Badge
                    className={
                      overallScore >= 80
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : overallScore >= 60
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : overallScore >= 40
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
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
              <p className="text-xs text-white/40 mt-1">
                {latestApproved ? `Verified score (V${latestApproved.version})` : "Provisional / Pending approval"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Assessment Status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs font-semibold border-white/20 bg-white/10 text-white font-[family-name:var(--font-aldrich)]">
                  {latestAssessment ? latestAssessment.status.replace("_", " ") : "NOT STARTED"}
                </Badge>
              </div>
              <p className="text-xs text-white/40 mt-1">
                {latestAssessment ? `Latest Version: V${latestAssessment.version}` : "No submissions yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Next Review Due
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-normal text-white font-[family-name:var(--font-aldrich)]">
                {nextReviewSchedule ? new Date(nextReviewSchedule.scheduledDate).toLocaleDateString() : "Pending"}
              </div>
              <p className="text-xs text-white/40 mt-1">
                {nextReviewSchedule ? "Institutional audit schedule" : "Assigned upon CIE approval"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Total Submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-normal text-white font-[family-name:var(--font-aldrich)]">{data.assessments.length}</div>
              <p className="text-xs text-white/40 mt-1">Version histories retained</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown & Action Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">Category Readiness Breakdown</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Scores reflect compliance, protection filings, and proprietary IP protocols.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 font-[family-name:var(--font-aldrich)]">
              {categoryScores.length === 0 ? (
                <div className="py-8 text-center text-white/40 text-xs">
                  Submit an assessment to see detailed category scores across Trademarks, Patents, and Copyrights.
                </div>
              ) : (
                categoryScores.map((c, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-white/80">{c.category?.name || "IP Category"}</span>
                      <span className="font-bold text-white">{Number(c.score).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, Number(c.score)))}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & Guidance */}
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">Institutional Guidance</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Bennett CIE Incubation recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-white/70">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-start space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <p>Complete all category assessments accurately. Trademark and Copyright protection can be initiated early.</p>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/10 flex items-start space-x-2">
                <ShieldAlert className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <p>Patent novelty checks must precede public disclosure or paper publication.</p>
              </div>
              <Link href="/startup/assessment" className="block pt-2">
                <Button className="w-full bg-white text-slate-950 hover:bg-white/90 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] tracking-[0.05em]">
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
