"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Building2, User, Award, ExternalLink, Loader2 } from "lucide-react";
import { ApiResponse } from "@/types";

interface StartupDossier {
  id: string;
  startupCode: string;
  name: string;
  founderName: string;
  email: string;
  contactNumber: string;
  website: string | null;
  industry: string;
  startupStage: string;
  incorporationDate: string | null;
  registrationNumber: string | null;
  description: string;
  productDescription: string;
  members: Array<{
    memberRole: string;
    user: { id: string; name: string; email: string; role: string; isActive: boolean };
  }>;
  assessments: Array<{
    id: string;
    version: number;
    status: string;
    submittedAt: string | null;
    approvedAt: string | null;
    scores: Array<{ score: number; categoryId: string | null }>;
  }>;
  schedules: Array<{
    id: string;
    scheduledDate: string;
    status: string;
  }>;
}

export function StartupDossierClient({ startupId }: { startupId: string }) {
  const [dossier, setDossier] = useState<StartupDossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDossier() {
      try {
        const res = await fetch(`/api/v1/cie/startups/${startupId}`);
        const json: ApiResponse<StartupDossier> = await res.json();
        if (json.success && json.data) {
          setDossier(json.data);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    loadDossier();
  }, [startupId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-4">
        <p className="text-white/60 mb-4 font-[family-name:var(--font-aldrich)]">Startup dossier could not be located.</p>
        <Link href="/cie/startups">
          <Button variant="outline" className="border-white/20 text-white rounded-xl">Return to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-sky-950/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0 w-full">
        <div className="w-full px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/cie/startups"
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
                {dossier.name}
              </h1>
              <p className="text-xs text-white/50">{dossier.startupCode} • Official Startup Dossier</p>
            </div>
          </div>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white font-[family-name:var(--font-aldrich)] px-3 py-1">
            {dossier.startupStage}
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {/* Startup Overview Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-4 border-b border-white/10">
              <CardTitle className="text-lg font-semibold text-white font-[family-name:var(--font-aldrich)] flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-white/70" /> Venture Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Founder / CEO</span>
                  <span className="font-semibold text-white">{dossier.founderName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Sector</span>
                  <span className="font-semibold text-white">{dossier.industry}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Official Email</span>
                  <span className="font-semibold text-white">{dossier.email}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Contact Phone</span>
                  <span className="font-semibold text-white">{dossier.contactNumber}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Executive Summary</span>
                <p className="text-white/80 leading-relaxed">{dossier.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-white/40 block text-xs font-[family-name:var(--font-aldrich)] mb-1">Proprietary Technology &amp; Innovation</span>
                <p className="text-white/80 leading-relaxed">{dossier.productDescription}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
            <CardHeader className="p-0 pb-4 border-b border-white/10">
              <CardTitle className="text-lg font-semibold text-white font-[family-name:var(--font-aldrich)] flex items-center">
                <User className="h-4 w-4 mr-2 text-white/70" /> Authorized Personnel
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-5 space-y-3">
              {dossier.members.length === 0 ? (
                <p className="text-sm text-white/40">No linked user accounts.</p>
              ) : (
                dossier.members.map((m, idx) => (
                  <div key={idx} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs space-y-1">
                    <span className="font-semibold text-white block text-sm">{m.user.name}</span>
                    <span className="text-white/50">{m.user.email}</span>
                    <span className="text-white/40 block font-[family-name:var(--font-aldrich)]">{m.memberRole}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assessment Evaluation History */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-4 border-b border-white/10 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white font-[family-name:var(--font-aldrich)] flex items-center">
              <Award className="h-4 w-4 mr-2 text-white/70" /> Assessment History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-5">
            {dossier.assessments.length === 0 ? (
              <p className="text-sm text-white/40">No assessments completed.</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <Table>
                  <TableHeader className="bg-white/[0.03]">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider py-4">Version</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Submitted Date</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Approved Date</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Overall Score</TableHead>
                      <TableHead className="text-right font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dossier.assessments.map((a) => {
                      const overallScoreObj = a.scores.find((s) => s.categoryId === null);
                      const scoreVal = overallScoreObj ? Number(overallScoreObj.score) : null;

                      return (
                        <TableRow key={a.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                          <TableCell className="font-mono text-sm font-semibold text-white py-4">
                            V{a.version}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80 font-mono text-xs">
                              {a.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-white/60">
                            {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="text-sm text-white/60">
                            {a.approvedAt ? new Date(a.approvedAt).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell className="text-sm font-semibold font-[family-name:var(--font-aldrich)]">
                            {scoreVal !== null ? (
                              <span className="text-emerald-400 font-bold">{scoreVal.toFixed(1)}%</span>
                            ) : (
                              <span className="text-white/40">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Link href={`/cie/reviewer/assessments/${a.id}`}>
                              <Button
                                size="sm"
                                className="bg-white text-slate-950 hover:bg-white/90 h-9 px-4 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer shadow-md"
                              >
                                Review Workspace <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
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
