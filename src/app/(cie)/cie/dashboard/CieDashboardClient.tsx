"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserProfileMenu } from "@/components/UserProfileMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, ArrowLeft, Building2, CheckCircle2, TrendingUp, Clock, Calendar, ChevronRight } from "lucide-react";
import { ApiResponse } from "@/types";

interface CieOverviewData {
  kpis: {
    totalStartups: number;
    totalAssessed: number;
    avgScore: number;
    pendingReview: number;
    distribution: {
      initial: number;
      developing: number;
      intermediate: number;
      advanced: number;
      strong: number;
    };
  };
  categories: Array<{
    category: string;
    code: string;
    averageScore: number;
    startupsWithData: number;
  }>;
  trends: Array<{
    month: string;
    submissions: number;
    approvals: number;
  }>;
}

export function CieDashboardClient() {
  const [data, setData] = useState<CieOverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/v1/cie/analytics/overview");
        const json: ApiResponse<CieOverviewData> = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-white/50 font-[family-name:var(--font-aldrich)]">Failed to load institutional analytics.</p>
      </div>
    );
  }

  const { kpis, categories, trends } = data;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-sky-950/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 w-full">
        <div className="w-full px-4 sm:px-10 min-h-16 sm:h-20 py-3 sm:py-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer shrink-0"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="IPMS Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow"
              />
            </Link>
            <div>
              <h1 className="font-semibold text-white text-sm sm:text-lg tracking-wide font-[family-name:var(--font-aldrich)]">
                CIE Portfolio Analytics
              </h1>
              <p className="text-[10px] sm:text-xs text-white/50">Bennett University Hatchery Executive Dashboard</p>
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-2 sm:space-x-3">
            <Link href="/cie/reports">
              <Button
                size="sm"
                variant="outline"
                className="h-9 sm:h-10 border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 mr-1 sm:mr-1.5 text-sky-400" />
                <span className="hidden xs:inline">Export</span> Reports
              </Button>
            </Link>
            <Link href="/cie/startups">
              <Button
                size="sm"
                variant="outline"
                className="h-9 sm:h-10 border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
              >
                Directory
              </Button>
            </Link>
            <Link href="/cie/reviewer/queue">
              <Button
                size="sm"
                className="h-9 sm:h-10 bg-white text-slate-950 hover:bg-white/90 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] tracking-[0.05em] cursor-pointer shadow-md shadow-white/10"
              >
                Queue <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
            <UserProfileMenu />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-xl shadow-black/60 rounded-3xl p-5 sm:p-6 transition-all hover:border-white/25">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Total Startups
              </CardDescription>
              <Building2 className="h-4 w-4 text-white/40" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-normal text-white font-[family-name:var(--font-aldrich)]">{kpis.totalStartups}</div>
              <p className="text-xs text-white/40 mt-1.5">Registered in Bennett Hatchery</p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-xl shadow-black/60 rounded-3xl p-5 sm:p-6 transition-all hover:border-white/25">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Assessed &amp; Approved
              </CardDescription>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-normal text-white font-[family-name:var(--font-aldrich)]">{kpis.totalAssessed}</div>
              <p className="text-xs text-white/40 mt-1.5">
                {kpis.totalStartups > 0
                  ? `${Math.round((kpis.totalAssessed / kpis.totalStartups) * 100)}% audit coverage`
                  : "No startups"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-xl shadow-black/60 rounded-3xl p-5 sm:p-6 transition-all hover:border-white/25">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Portfolio Avg Score
              </CardDescription>
              <TrendingUp className="h-4 w-4 text-sky-400" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-normal text-emerald-400 font-[family-name:var(--font-aldrich)]">
                {kpis.avgScore.toFixed(1)}%
              </div>
              <p className="text-xs text-white/40 mt-1.5">Latest approved evaluations</p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-xl shadow-black/60 rounded-3xl p-5 sm:p-6 transition-all hover:border-white/25">
            <CardHeader className="p-0 pb-3 flex flex-row items-center justify-between">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Pending Reviews
              </CardDescription>
              <Clock className="h-4 w-4 text-amber-400" />
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-3xl sm:text-4xl font-normal text-amber-400 font-[family-name:var(--font-aldrich)]">
                {kpis.pendingReview}
              </div>
              <p className="text-xs text-white/40 mt-1.5">Awaiting evaluation in queue</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* IP Maturity Tier Distribution */}
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-5 border-b border-white/10">
              <CardTitle className="text-lg font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
                Maturity Tier Distribution
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-white/50 mt-1">
                Institutional readiness classifications
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6 space-y-4 font-[family-name:var(--font-aldrich)]">
              {[
                { label: "Strong (81-100%)", count: kpis.distribution.strong, color: "bg-emerald-400" },
                { label: "Advanced (61-80%)", count: kpis.distribution.advanced, color: "bg-sky-400" },
                { label: "Intermediate (41-60%)", count: kpis.distribution.intermediate, color: "bg-indigo-400" },
                { label: "Developing (21-40%)", count: kpis.distribution.developing, color: "bg-amber-400" },
                { label: "Initial (0-20%)", count: kpis.distribution.initial, color: "bg-rose-400" },
              ].map((tier, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-white/80">{tier.label}</span>
                    <span className="font-bold text-white">{tier.count}</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tier.color} rounded-full transition-all duration-500`}
                      style={{
                        width: `${kpis.totalAssessed > 0 ? (tier.count / kpis.totalAssessed) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Category Readiness */}
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-5 border-b border-white/10">
              <CardTitle className="text-lg font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
                Category IP Readiness
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-white/50 mt-1">
                Portfolio-wide average scores across IP categories
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-6 space-y-5 font-[family-name:var(--font-aldrich)]">
              {categories.map((c) => (
                <div key={c.code} className="space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-white/90">{c.category}</span>
                    <span className="font-bold text-white">{c.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, c.averageScore))}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40 block">
                    {c.startupsWithData} startup(s) contributing data
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
