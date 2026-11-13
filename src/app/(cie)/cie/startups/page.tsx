"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Search, Loader2, ExternalLink } from "lucide-react";
import { ApiResponse } from "@/types";

interface StartupListItem {
  id: string;
  startupCode: string;
  name: string;
  founderName: string;
  industry: string;
  startupStage: string;
  assessments: Array<{
    id: string;
    version: number;
    scores: Array<{ score: number; categoryId: string | null }>;
  }>;
  schedules: Array<{
    scheduledDate: string;
  }>;
}

export default function CieStartupDirectoryPage() {
  const [startups, setStartups] = useState<StartupListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("ALL");
  const [stage, setStage] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (industry !== "ALL") params.set("industry", industry);
    if (stage !== "ALL") params.set("stage", stage);
    params.set("page", page.toString());
    params.set("limit", "10");

    fetch(`/api/v1/cie/startups?${params.toString()}`)
      .then((res) => res.json())
      .then((json: ApiResponse<{
        startups: StartupListItem[];
        pagination: { page: number; limit: number; totalCount: number; totalPages: number };
      }>) => {
        if (!cancelled && json.success && json.data) {
          setStartups(json.data.startups);
          setTotalPages(json.data.pagination.totalPages);
          setTotalCount(json.data.pagination.totalCount);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [search, industry, stage, page]);

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
                CIE Startup Directory
              </h1>
              <p className="text-xs text-white/50">Bennett Hatchery Incubation Portfolio</p>
            </div>
          </div>
          <Badge variant="outline" className="border-white/20 bg-white/10 text-white font-[family-name:var(--font-aldrich)] px-3 py-1">
            {totalCount} Total Startups
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {/* Search & Filters */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search by startup name, founder, code..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 h-11 text-sm bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 rounded-xl"
                />
              </div>

              <div>
                <Select
                  value={industry}
                  onValueChange={(val) => {
                    setIndustry(val ?? "ALL");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="!h-11 text-sm w-full bg-white/[0.05] border-white/15 text-white rounded-xl">
                    <SelectValue placeholder="Industry Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Sectors</SelectItem>
                    <SelectItem value="Artificial Intelligence / SaaS">AI / SaaS</SelectItem>
                    <SelectItem value="Healthcare & BioTech">Healthcare & BioTech</SelectItem>
                    <SelectItem value="FinTech & InsurTech">FinTech & InsurTech</SelectItem>
                    <SelectItem value="CleanTech & AgriTech">CleanTech & AgriTech</SelectItem>
                    <SelectItem value="Hardware & Robotics">Hardware & Robotics</SelectItem>
                    <SelectItem value="EdTech & Consumer Internet">EdTech & Consumer</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select
                  value={stage}
                  onValueChange={(val) => {
                    setStage(val ?? "ALL");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="!h-11 text-sm w-full bg-white/[0.05] border-white/15 text-white rounded-xl">
                    <SelectValue placeholder="Incubation Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Stages</SelectItem>
                    <SelectItem value="Ideation">Ideation</SelectItem>
                    <SelectItem value="PoC / Prototype">PoC / Prototype</SelectItem>
                    <SelectItem value="MVP Ready">MVP Ready</SelectItem>
                    <SelectItem value="Early Traction">Early Traction</SelectItem>
                    <SelectItem value="Scaling">Scaling</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Startups Table */}
        <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7">
          <CardHeader className="p-0 pb-6 border-b border-white/10 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-normal text-white tracking-wide font-[family-name:var(--font-aldrich)]">
                Incubated Ventures
              </CardTitle>
              <p className="text-sm text-white/50 mt-1">
                Founders, IP readiness ratings, and institutional dossiers
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : startups.length === 0 ? (
              <div className="text-center py-16 text-white/40">
                <p className="text-sm font-medium">No venture records matching criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <Table>
                  <TableHeader className="bg-white/[0.03]">
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider py-4">Code</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Startup Name</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Primary Founder</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Industry</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Stage</TableHead>
                      <TableHead className="font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider">Latest Score</TableHead>
                      <TableHead className="text-right font-semibold text-white/70 font-[family-name:var(--font-aldrich)] text-xs uppercase tracking-wider pr-6">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {startups.map((st) => {
                      const latestAssessment = st.assessments[0];
                      const overallScoreObj = latestAssessment?.scores.find((s) => s.categoryId === null);
                      const scoreVal = overallScoreObj ? Number(overallScoreObj.score) : null;

                      return (
                        <TableRow key={st.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                          <TableCell className="font-mono text-sm font-semibold text-white py-4">
                            {st.startupCode}
                          </TableCell>
                          <TableCell className="font-semibold text-white text-sm">{st.name}</TableCell>
                          <TableCell className="text-white/70 text-sm">{st.founderName}</TableCell>
                          <TableCell className="text-xs text-white/60 font-[family-name:var(--font-aldrich)]">{st.industry}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="border-white/20 bg-white/5 text-white/80">
                              {st.startupStage}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm font-semibold font-[family-name:var(--font-aldrich)]">
                            {scoreVal !== null ? (
                              <span className="text-emerald-400 font-bold">{scoreVal.toFixed(1)}%</span>
                            ) : (
                              <span className="text-white/40">Unrated</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Link href={`/cie/startups/${st.id}`}>
                              <Button
                                size="sm"
                                className="bg-white text-slate-950 hover:bg-white/90 h-9 px-4 text-xs font-semibold rounded-xl font-[family-name:var(--font-aldrich)] cursor-pointer shadow-md"
                              >
                                Dossier <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6 text-sm">
                <span className="text-xs text-white/50 font-[family-name:var(--font-aldrich)]">
                  Page {page} of {totalPages} ({totalCount} total)
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs font-[family-name:var(--font-aldrich)] cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
