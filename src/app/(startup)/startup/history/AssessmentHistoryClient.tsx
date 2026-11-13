"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Loader2, ArrowRight } from "lucide-react";

interface AssessmentVersion {
  id: string;
  version: number;
  status: string;
  submittedAt: string | null;
  approvedAt: string | null;
  scores: Array<{ score: number; categoryId: string | null }>;
  reviews: Array<{ decision: string; reviewedAt: string }>;
  schedules: Array<{ scheduledDate: string }>;
}

export function AssessmentHistoryClient() {
  const [assessments, setAssessments] = useState<AssessmentVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/v1/assessments");
        const json = await res.json();
        if (json.success && json.data) {
          setAssessments(json.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/startup/dashboard" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold text-slate-900 text-base">Assessment Version History</h1>
          </div>
          <Link href="/startup/assessment">
            <Button size="sm" className="bg-blue-900 hover:bg-blue-800">New Assessment</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Submitted &amp; Historical Evaluations</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              All submitted versions are permanently preserved to track intellectual property progress over time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessments.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No assessments submitted yet.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">Version</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Submitted On</TableHead>
                    <TableHead className="font-semibold text-slate-700">Approval Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Score</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((a) => {
                    const overall = a.scores.find((s) => s.categoryId === null);
                    return (
                      <TableRow key={a.id} className="border-slate-100">
                        <TableCell className="font-mono text-xs font-semibold text-blue-900">
                          Version {a.version}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "Draft"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {a.approvedAt ? new Date(a.approvedAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-bold text-slate-900">
                          {overall ? `${Number(overall.score).toFixed(1)}%` : "Pending"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/startup/assessment?id=${a.id}`}>
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                              View <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
