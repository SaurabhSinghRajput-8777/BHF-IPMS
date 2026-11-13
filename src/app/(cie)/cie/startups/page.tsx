"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Search, Loader2, Building, ExternalLink } from "lucide-react";
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      .catch(() => {/* error handled silently */})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [search, industry, stage, page]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/cie/dashboard" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-9 w-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              BH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base">CIE Startup Directory</h1>
              <p className="text-xs text-slate-500">Bennett Hatchery Incubation Portfolio</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-900 border-blue-200">
            {totalCount} Total Startups
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Search & Filters */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by startup name, code, or founder..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 border-slate-200"
                />
              </div>

              <Select
                value={industry}
                onValueChange={(val) => {
                  setIndustry(val ?? "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Industries</SelectItem>
                  <SelectItem value="Artificial Intelligence / SaaS">Artificial Intelligence / SaaS</SelectItem>
                  <SelectItem value="Healthcare & BioTech">Healthcare & BioTech</SelectItem>
                  <SelectItem value="FinTech & InsurTech">FinTech & InsurTech</SelectItem>
                  <SelectItem value="CleanTech & AgriTech">CleanTech & AgriTech</SelectItem>
                  <SelectItem value="Hardware & Robotics">Hardware & Robotics</SelectItem>
                  <SelectItem value="EdTech & Consumer Internet">EdTech & Consumer Internet</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={stage}
                onValueChange={(val) => {
                  setStage(val ?? "ALL");
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Incubation Stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Stages</SelectItem>
                  <SelectItem value="Idea Stage">Idea Stage</SelectItem>
                  <SelectItem value="Prototype Stage">Prototype Stage</SelectItem>
                  <SelectItem value="MVP Stage">MVP Stage</SelectItem>
                  <SelectItem value="Early Revenue">Early Revenue</SelectItem>
                  <SelectItem value="Growth Stage">Growth Stage</SelectItem>
                  <SelectItem value="Established Business">Established Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Directory Table */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">Registered Ventures</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Showing official incubated startup records, latest verified IP readiness scores, and scheduled reviews.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center items-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
              </div>
            ) : startups.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Building className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium">No startups match the search criteria.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-100">
                    <TableHead className="font-semibold text-slate-700">Code</TableHead>
                    <TableHead className="font-semibold text-slate-700">Startup Name</TableHead>
                    <TableHead className="font-semibold text-slate-700">Founder</TableHead>
                    <TableHead className="font-semibold text-slate-700">Sector</TableHead>
                    <TableHead className="font-semibold text-slate-700">Stage</TableHead>
                    <TableHead className="font-semibold text-slate-700">Latest IP Score</TableHead>
                    <TableHead className="font-semibold text-slate-700">Next Review</TableHead>
                    <TableHead className="text-right font-semibold text-slate-700">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {startups.map((s) => {
                    // Extract overall score if available
                    const latestAssessment = s.assessments[0];
                    const overallScoreObj = latestAssessment?.scores.find((sc) => sc.categoryId === null);
                    const scoreVal = overallScoreObj ? Number(overallScoreObj.score) : null;
                    const nextReviewDate = s.schedules[0]?.scheduledDate
                      ? new Date(s.schedules[0].scheduledDate).toLocaleDateString()
                      : "Pending";

                    return (
                      <TableRow key={s.id} className="border-slate-100 hover:bg-slate-50/50">
                        <TableCell className="font-mono text-xs font-semibold text-blue-900">
                          {s.startupCode}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900">{s.name}</TableCell>
                        <TableCell className="text-slate-600 text-sm">{s.founderName}</TableCell>
                        <TableCell className="text-slate-600 text-xs">{s.industry}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700 font-normal">
                            {s.startupStage}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {scoreVal !== null ? (
                            <Badge
                              className={`text-xs ${
                                scoreVal >= 80
                                  ? "bg-emerald-100 text-emerald-800"
                                  : scoreVal >= 60
                                  ? "bg-blue-100 text-blue-800"
                                  : scoreVal >= 40
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {scoreVal.toFixed(1)}% (V{latestAssessment?.version})
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">Not Scored</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{nextReviewDate}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/cie/startups/${s.id}`}>
                            <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200">
                              Dossier <ExternalLink className="ml-1 h-3 w-3" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

