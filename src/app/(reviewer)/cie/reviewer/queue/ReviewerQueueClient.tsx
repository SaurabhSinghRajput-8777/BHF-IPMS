"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronRight, Loader2, Inbox, ArrowLeft } from "lucide-react";

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
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-sky-950/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/cie/dashboard"
              className="text-white/70 hover:text-white transition-colors p-2.5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center cursor-pointer"
              aria-label="Back to dashboard"
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
              <h1 className="font-semibold text-white text-lg tracking-wide font-[family-name:var(--font-aldrich)]">
                CIE Reviewer Workspace
              </h1>
              <p className="text-xs text-white/50">Bennett University Intellectual Property Office</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/cie/reports">
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
              >
                Export Reports
              </Button>
            </Link>
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
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl sm:text-2xl font-normal text-white tracking-wide font-[family-name:var(--font-aldrich)]">
                  Pending Review Queue
                </CardTitle>
                <CardDescription className="text-sm text-white/60 mt-1">
                  Assessments awaiting institutional evaluation, applicability verification, and scoring sign-off.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="bg-white/10 text-white border-white/20 font-[family-name:var(--font-aldrich)] px-3 py-1 text-xs"
              >
                {queue.length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            {queue.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <Inbox className="h-12 w-12 mx-auto text-white/20 mb-3" />
                <p className="text-sm font-medium">All pending assessments have been evaluated.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <Table>
                  <TableHeader className="bg-white/[0.03]">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider py-4">Code</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Startup Name</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Founder</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Version</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Submitted On</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Provisional Score</TableHead>
                      <TableHead className="text-right font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map((item) => {
                      const provScore = item.scores[0]?.score ? Number(item.scores[0].score) : null;
                      return (
                        <TableRow key={item.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                          <TableCell className="font-mono text-sm font-semibold text-white py-4">
                            {item.startup.startupCode}
                          </TableCell>
                          <TableCell className="font-semibold text-white text-sm">{item.startup.name}</TableCell>
                          <TableCell className="text-white/70 text-sm">{item.startup.founderName}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80 font-mono">
                              V{item.version}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-white/50">
                            {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-white font-[family-name:var(--font-aldrich)]">
                            {provScore !== null ? (
                              <span className="text-emerald-400 font-bold">{provScore.toFixed(1)}%</span>
                            ) : (
                              <span className="text-white/40">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Link href={`/cie/reviewer/assessments/${item.id}`}>
                              <Button
                                size="sm"
                                className="bg-white text-slate-950 hover:bg-white/90 h-9 px-4 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer shadow-md"
                              >
                                Review <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
