"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Loader2, Inbox } from "lucide-react";

interface QueueItem {
  id: string;
  version: number;
  status: string;
  submittedAt: string;
  startup: {
    id: string;
    startupCode: string;
    name: string;
    founderName: string;
    industry: string;
  };
  scores: Array<{ score: number }>;
}

export function ReviewerQueueClient() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
      try {
        const res = await fetch("/api/v1/reviewer/queue");
        const json = await res.json();
        if (json.success && json.data) {
          setQueue(json.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchQueue();
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
            <div className="h-9 w-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              BH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base">CIE Reviewer Workspace</h1>
              <p className="text-xs text-slate-500">Bennett University Incubation Intellectual Property Office</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/cie/dashboard">
              <Button size="sm" variant="outline">Analytics Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Pending Review Queue</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Assessments awaiting institutional evaluation, applicability verification, and scoring sign-off.
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-200">
                {queue.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Inbox className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">All pending assessments have been evaluated.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">Code</TableHead>
                    <TableHead className="font-semibold text-slate-700">Startup Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Founder</TableHead>
                    <TableHead className="font-semibold text-slate-700">Version</TableHead>
                    <TableHead className="font-semibold text-slate-700">Submitted On</TableHead>
                    <TableHead className="font-semibold text-slate-700">Provisional Score</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queue.map((item) => {
                    const provScore = item.scores[0]?.score ? Number(item.scores[0].score) : null;
                    return (
                      <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="font-mono text-xs font-semibold text-blue-900">
                          {item.startup.startupCode}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{item.startup.name}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{item.startup.founderName}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="secondary">V{item.version}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-800">
                          {provScore !== null ? `${provScore.toFixed(1)}%` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/cie/reviewer/assessments/${item.id}`}>
                            <Button size="sm" className="bg-blue-900 hover:bg-blue-800 h-8 text-xs">
                              Review <ChevronRight className="ml-1 h-3 w-3" />
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
