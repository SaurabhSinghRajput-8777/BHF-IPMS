"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <p className="text-slate-600 mb-4">Startup dossier could not be located.</p>
        <Link href="/cie/startups">
          <Button variant="outline">Return to Directory</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/cie/startups" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-9 w-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              BH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base">{dossier.name}</h1>
              <p className="text-xs text-slate-500">Official Startup Dossier</p>
            </div>
          </div>
          <Badge className="font-mono text-xs bg-blue-900 text-white">
            {dossier.startupCode}
          </Badge>
        </div>
      </header>

      {/* Main Dossier Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900">Venture Profile</CardTitle>
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <CardDescription className="text-xs text-slate-500">
                General incubation master record and official corporate contact info.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Founder</span>
                  <span className="font-medium text-slate-900">{dossier.founderName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Email Address</span>
                  <span className="font-medium text-slate-900">{dossier.email}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Contact Phone</span>
                  <span className="font-medium text-slate-900">{dossier.contactNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Website</span>
                  {dossier.website ? (
                    <a href={dossier.website} target="_blank" rel="noreferrer" className="text-blue-900 underline flex items-center gap-1">
                      {dossier.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400">N/A</span>
                  )}
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Sector</span>
                  <span className="font-medium text-slate-900">{dossier.industry}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Incubation Stage</span>
                  <Badge variant="outline" className="text-xs bg-slate-50 mt-0.5">{dossier.startupStage}</Badge>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-xs text-slate-400 block">Executive Summary</span>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed">{dossier.description}</p>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">Proprietary Technology &amp; Innovation</span>
                <p className="text-slate-700 text-xs mt-1 leading-relaxed">{dossier.productDescription}</p>
              </div>
            </CardContent>
          </Card>

          {/* Account & Members */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-900">Associated Users</CardTitle>
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <CardDescription className="text-xs text-slate-500">
                Authorized platform accounts linked to this startup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dossier.members.map((m) => (
                <div key={m.user.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{m.user.name}</span>
                    <Badge variant="outline" className="text-[10px] bg-white">{m.memberRole}</Badge>
                  </div>
                  <span className="text-slate-500 block">{m.user.email}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Assessment History */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Assessment Version History</CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Chronological record of submitted, under-review, and approved IP evaluations.
                </CardDescription>
              </div>
              <Award className="h-5 w-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            {dossier.assessments.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-400">No assessments submitted yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">Version</TableHead>
                    <TableHead className="font-semibold text-slate-700">Status</TableHead>
                    <TableHead className="font-semibold text-slate-700">Submission Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Approval Date</TableHead>
                    <TableHead className="font-semibold text-slate-700">Overall Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dossier.assessments.map((a) => {
                    const overallScore = a.scores.find((s) => s.categoryId === null);
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
                        <TableCell className="font-semibold text-xs text-slate-900">
                          {overallScore ? `${Number(overallScore.score).toFixed(1)}%` : "Pending"}
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
