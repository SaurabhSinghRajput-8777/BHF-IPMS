"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Failed to load institutional analytics.</p>
      </div>
    );
  }

  const { kpis, categories, trends } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              BH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base">CIE Portfolio IP Analytics</h1>
              <p className="text-xs text-slate-500">Bennett University Hatchery Executive Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <a href="/api/v1/cie/reports/analytics?format=xlsx" download>
              <Button size="sm" variant="outline" className="text-xs">
                <Download className="h-3.5 w-3.5 mr-1" /> Export Portfolio Excel
              </Button>
            </a>
            <Link href="/cie/startups">
              <Button size="sm" variant="outline" className="text-xs">Startup Directory</Button>
            </Link>
            <Link href="/cie/reviewer/queue">
              <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-xs">Review Queue</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Portfolio Startups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{kpis.totalStartups}</div>
              <p className="text-xs text-slate-400 mt-1">Officially registered in Bennett Hatchery</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Assessed &amp; Approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{kpis.totalAssessed}</div>
              <p className="text-xs text-slate-400 mt-1">
                {kpis.totalStartups > 0
                  ? `${Math.round((kpis.totalAssessed / kpis.totalStartups) * 100)}% portfolio audit coverage`
                  : "No startups"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Portfolio Avg IP Score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{kpis.avgScore.toFixed(1)}%</div>
              <p className="text-xs text-slate-400 mt-1">Latest approved evaluations</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{kpis.pendingReview}</div>
              <p className="text-xs text-slate-400 mt-1">Awaiting evaluation in queue</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Distributions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* IP Maturity Tier Distribution */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Maturity Tier Distribution</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Institutional readiness classifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Strong IP Readiness (81-100%)", count: kpis.distribution.strong, color: "bg-emerald-500" },
                { label: "Advanced (61-80%)", count: kpis.distribution.advanced, color: "bg-blue-600" },
                { label: "Intermediate (41-60%)", count: kpis.distribution.intermediate, color: "bg-indigo-500" },
                { label: "Developing (21-40%)", count: kpis.distribution.developing, color: "bg-amber-500" },
                { label: "Initial (0-20%)", count: kpis.distribution.initial, color: "bg-rose-500" },
              ].map((tier, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-700">{tier.label}</span>
                    <span className="font-bold text-slate-900">{tier.count}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
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
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Category IP Readiness</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Portfolio-wide average scores across IP categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((c) => (
                <div key={c.code} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800">{c.category}</span>
                    <span className="font-bold text-blue-900">{c.averageScore.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-900 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, c.averageScore))}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {c.startupsWithData} startup(s) contributing data
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 12-Month Trends */}
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-900">Annual Activity Cadence</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Monthly submissions vs institutional approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                {trends.slice(-6).map((t) => (
                  <div key={t.month} className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <span className="font-mono text-slate-700">{t.month}</span>
                    <div className="flex items-center space-x-3">
                      <span className="text-slate-600">Submissions: <b>{t.submissions}</b></span>
                      <span className="text-emerald-700">Approvals: <b>{t.approvals}</b></span>
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
