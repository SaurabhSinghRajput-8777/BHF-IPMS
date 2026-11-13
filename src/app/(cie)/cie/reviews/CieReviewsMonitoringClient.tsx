"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  const renderScheduleTable = (items: ReviewScheduleItem[], emptyMessage: string) => {
    if (!items || items.length === 0) {
      return <div className="text-center py-6 text-slate-400 text-xs">{emptyMessage}</div>;
    }

    return (
      <Table>
        <TableHeader>
          <TableRow className="border-slate-100">
            <TableHead className="font-semibold text-slate-700">Startup</TableHead>
            <TableHead className="font-semibold text-slate-700">Scheduled Date</TableHead>
            <TableHead className="font-semibold text-slate-700">Assigned Reviewer</TableHead>
            <TableHead className="font-semibold text-slate-700">Evaluation Version</TableHead>
            <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id} className="border-slate-100">
              <TableCell className="font-medium text-slate-900">
                <span className="font-mono text-xs text-blue-900 mr-2">{s.startup.startupCode}</span>
                {s.startup.name}
              </TableCell>
              <TableCell className="text-xs text-slate-600">
                {new Date(s.scheduledDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-xs text-slate-600">{s.reviewer.name}</TableCell>
              <TableCell className="text-xs">
                <Badge variant="secondary">V{s.assessment.version}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/cie/startups/${s.startup.id}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Dossier
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/cie/dashboard" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-bold text-slate-900 text-base">CIE Review Schedule Monitoring</h1>
              <p className="text-xs text-slate-500">Upcoming Institutional IP Audits &amp; Annual Review Tracking</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Overdue Section */}
        {data && data.overdue.length > 0 && (
          <Card className="border-rose-200 bg-white">
            <CardHeader className="bg-rose-50/50 pb-3 border-b border-rose-100">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <CardTitle className="text-sm font-bold text-rose-900">
                  Overdue Annual Reviews ({data.overdue.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {renderScheduleTable(data.overdue, "No overdue reviews.")}
            </CardContent>
          </Card>
        )}

        {/* Due in 7 Days */}
        <Card className="border-amber-200 bg-white">
          <CardHeader className="bg-amber-50/50 pb-3 border-b border-amber-100">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-amber-900">
                Due Within 7 Days ({data?.due7Days.length || 0})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {renderScheduleTable(data?.due7Days || [], "No reviews due in the next 7 days.")}
          </CardContent>
        </Card>

        {/* Due in 30 Days */}
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-slate-600" />
              <CardTitle className="text-sm font-bold text-slate-900">
                Due Within 30 Days ({data?.due30Days.length || 0})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {renderScheduleTable(data?.due30Days || [], "No reviews due in the next 30 days.")}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
