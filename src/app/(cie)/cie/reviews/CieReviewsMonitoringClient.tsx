"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { ApiResponse } from "@/types";

interface ReviewScheduleItem {
  id: string;
  scheduledDate: string;
  status: string;
  startup: { id: string; startupCode: string; name: string };
  reviewer: { id: string; name: string };
  assessment: { id: string; version: number };
}

interface ReviewMonitoringData {
  overdue: ReviewScheduleItem[];
  due7Days: ReviewScheduleItem[];
  due30Days: ReviewScheduleItem[];
  upcoming: ReviewScheduleItem[];
}

export function CieReviewsMonitoringClient() {
  const [data, setData] = useState<ReviewMonitoringData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch("/api/v1/cie/reviews/upcoming");
        const json: ApiResponse<ReviewMonitoringData> = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  const renderScheduleTable = (items: ReviewScheduleItem[], emptyMessage: string) => {
    if (!items || items.length === 0) {
      return <div className="text-center py-8 text-white/40 text-sm">{emptyMessage}</div>;
    }

    return (
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <Table>
          <TableHeader className="bg-white/[0.03]">
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider py-4">Startup</TableHead>
              <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Scheduled Date</TableHead>
              <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Assigned Reviewer</TableHead>
              <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Evaluation Version</TableHead>
              <TableHead className="text-right font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((s) => (
              <TableRow key={s.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                <TableCell className="font-medium text-white py-4 text-sm">
                  <span className="font-mono text-xs text-white/60 mr-2">{s.startup.startupCode}</span>
                  {s.startup.name}
                </TableCell>
                <TableCell className="text-sm text-white/70">
                  {new Date(s.scheduledDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-white/70">{s.reviewer.name}</TableCell>
                <TableCell className="text-xs">
                  <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80 font-mono">
                    V{s.assessment.version}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Link href={`/cie/startups/${s.startup.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
                    >
                      Dossier
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-sky-950/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/cie/dashboard"
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
                Periodic Review Schedules
              </h1>
              <p className="text-xs text-white/50">CIE Institutional Audit &amp; Recertification Tracking</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/cie/dashboard">
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
              >
                Analytics Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {/* Overdue Alert Section */}
        {data && data.overdue.length > 0 && (
          <Card className="border-rose-500/30 bg-rose-950/20 backdrop-blur-2xl shadow-2xl rounded-3xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-4 border-b border-rose-500/20">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                <CardTitle className="text-lg font-semibold text-rose-300 font-[family-name:var(--font-aldrich)]">
                  Overdue IP Reviews ({data.overdue.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-4">
              {renderScheduleTable(data.overdue, "No overdue reviews")}
            </CardContent>
          </Card>
        )}

        {/* Due within 7 Days */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-lg font-semibold text-white font-[family-name:var(--font-aldrich)]">
                Due within 7 Days
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            {data && renderScheduleTable(data.due7Days, "No reviews scheduled within the next 7 days.")}
          </CardContent>
        </Card>

        {/* Due within 30 Days */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-sky-400" />
              <CardTitle className="text-lg font-semibold text-white font-[family-name:var(--font-aldrich)]">
                Due within 30 Days
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            {data && renderScheduleTable(data.due30Days, "No reviews scheduled within the next 30 days.")}
          </CardContent>
        </Card>

        {/* Later Upcoming */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10">
            <CardTitle className="text-lg font-semibold text-white font-[family-name:var(--font-aldrich)]">
              All Upcoming Institutional Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            {data && renderScheduleTable(data.upcoming, "No future reviews currently scheduled.")}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
