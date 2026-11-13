"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Top Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
                CIE Portfolio IP Analytics
              </h1>
              <p className="text-xs text-white/50">Bennett University Hatchery Executive Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a href="/api/v1/cie/reports/analytics?format=xlsx" download>
              <Button size="sm" variant="outline" className="text-xs border-white/20 text-white hover:bg-white/10 rounded-xl font-[family-name:var(--font-aldrich)]">
                <Download className="h-3.5 w-3.5 mr-1" /> Export Excel
              </Button>
            </a>
            <Link href="/cie/startups">
              <Button size="sm" variant="outline" className="text-xs border-white/20 text-white hover:bg-white/10 rounded-xl font-[family-name:var(--font-aldrich)]">
                Directory
              </Button>
            </Link>
            <Link href="/cie/reviewer/queue">
              <Button size="sm" className="bg-white text-slate-950 hover:bg-white/90 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] tracking-[0.05em]">
                Review Queue
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Total Startups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-normal text-white font-[family-name:var(--font-aldrich)]">{kpis.totalStartups}</div>
              <p className="text-xs text-white/40 mt-1">Registered in Bennett Hatchery</p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Assessed &amp; Approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-normal text-white font-[family-name:var(--font-aldrich)]">{kpis.totalAssessed}</div>
              <p className="text-xs text-white/40 mt-1">
                {kpis.totalStartups > 0
                  ? `${Math.round((kpis.totalAssessed / kpis.totalStartups) * 100)}% audit coverage`
                  : "No startups"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Portfolio Avg Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-normal text-white font-[family-name:var(--font-aldrich)]">{kpis.avgScore.toFixed(1)}%</div>
              <p className="text-xs text-white/40 mt-1">Latest approved evaluations</p>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-white/50 uppercase tracking-[0.2em] font-[family-name:var(--font-aldrich)]">
                Pending Reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-normal text-amber-400 font-[family-name:var(--font-aldrich)]">{kpis.pendingReview}</div>
              <p className="text-xs text-white/40 mt-1">Awaiting evaluation in queue</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* IP Maturity Tier Distribution */}
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">Maturity Tier Distribution</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Institutional readiness classifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 font-[family-name:var(--font-aldrich)]">
              {[
                { label: "Strong (81-100%)", count: kpis.distribution.strong, color: "bg-emerald-400" },
                { label: "Advanced (61-80%)", count: kpis.distribution.advanced, color: "bg-blue-400" },
                { label: "Intermediate (41-60%)", count: kpis.distribution.intermediate, color: "bg-indigo-400" },
                { label: "Developing (21-40%)", count: kpis.distribution.developing, color: "bg-amber-400" },
                { label: "Initial (0-20%)", count: kpis.distribution.initial, color: "bg-rose-400" },
              ].map((tier, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/80">{tier.label}</span>
                    <span className="font-bold text-white">{tier.count}</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${tier.color} rounded-full`}
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
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">Category IP Readiness</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Portfolio-wide average scores across IP categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 font-[family-name:var(--font-aldrich)]">
              {categories.map((c) => (
                <div key={c.code} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/90">{c.category}</span>
                    <span className="font-bold text-white">{c.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, c.averageScore))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40 block">
                    {c.startupsWithData} startup(s) contributing data
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 12-Month Trends */}
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-xl shadow-xl shadow-black/40 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">Annual Activity Cadence</CardTitle>
              <CardDescription className="text-xs text-white/60">
                Monthly submissions vs institutional approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto text-xs font-[family-name:var(--font-aldrich)]">
                {trends.slice(-6).map((t) => (
                  <div key={t.month} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.04] border border-white/10">
                    <span className="text-white/80">{t.month}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-white/60">Submissions: <b className="text-white">{t.submissions}</b></span>
                      <span className="text-emerald-400">Approvals: <b className="text-emerald-300">{t.approvals}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
