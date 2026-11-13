import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, CheckCircle2, Award, ArrowRight, BarChart3, Lock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Institutional Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              BH
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight block text-base sm:text-lg">
                Bennett Hatchery IPMS
              </span>
              <span className="text-xs text-slate-500 font-medium block">
                Centre for Innovation & Entrepreneurship • Bennett University
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/apply">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                Apply &amp; Assess IP
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="border-slate-300">
                Staff Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-4 py-1.5 px-3.5 border-blue-200 bg-blue-50 text-blue-900 font-medium">
              Institutional Incubation Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
              Centralized Intellectual Property Management & Monitoring
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">
              Evaluating, tracking, and elevating the intellectual property readiness of incubated startups across 
              Trademarks, Patents, and Copyrights through structured institutional assessment and expert CIE reviews.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/apply" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 shadow-md text-base font-semibold">
                  Start Startup IP Assessment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-12 px-6 text-base border-slate-300">
                  CIE Reviewer / Admin Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Module Cards Grid */}
          <div id="modules" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Startup Portal</CardTitle>
                <CardDescription className="text-slate-500">
                  For Incubated Founders & Representatives
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 shrink-0" />
                  <span>Dynamic multi-step IP questionnaire across Trademarks, Patents & Copyrights</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 shrink-0" />
                  <span>Draft auto-saving & immutable versioning upon submission</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2 mt-0.5 shrink-0" />
                  <span>Download official individual PDF assessment reports</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center mb-2">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">Reviewer Workspace</CardTitle>
                <CardDescription className="text-slate-500">
                  For Designated CIE Evaluators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 shrink-0" />
                  <span>Review queue for incoming submissions & resubmissions</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 shrink-0" />
                  <span>Category applicability verification & detailed remark entry</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 mr-2 mt-0.5 shrink-0" />
                  <span>Approve, request changes, or reject with review scheduling</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center mb-2">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900">CIE Administration</CardTitle>
                <CardDescription className="text-slate-500">
                  For Bennett Hatchery Leadership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5 text-sm text-slate-600">
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
                  <span>Executive portfolio KPIs based on latest approved assessments</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
                  <span>Maturity distributions, category readiness & review monitoring</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mr-2 mt-0.5 shrink-0" />
                  <span>Consolidated portfolio reports in PDF and Excel formats</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Institutional Highlights */}
          <div className="mt-16 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <Award className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-900">Institutional Rigor</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Built specifically to institutional standards of Bennett University CIE.
                </p>
              </div>
              <div>
                <Lock className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-900">Strict Data Isolation</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Multi-tenant isolation ensures confidential startup invention protection.
                </p>
              </div>
              <div>
                <ShieldCheck className="h-8 w-8 text-blue-900 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-900">Complete Auditability</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Full versioning and timestamped reviewer remarks preserved permanently.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          <p>© 2026 Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University. All rights reserved.</p>
          <p className="mt-1">Bennett Hatchery IPMS v1.0.0 • Institutional Intellectual Property Monitoring Ecosystem</p>
        </div>
      </footer>
    </div>
  );
}
