"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Building2,
  FileCheck2,
} from "lucide-react";
import { ResponseValue } from "@prisma/client";

interface Question {
  id: string;
  categoryId: string | null;
  questionText: string;
  description: string | null;
  isRequired: boolean;
  displayOrder: number;
  category?: { id: string; name: string; code: string };
}

interface Category {
  id: string;
  name: string;
  code: string;
}

interface SubmissionSuccessData {
  startupCode: string;
  startupName: string;
  founderName: string;
  version: number;
  overallScore: number;
  classification: string;
}

export function PublicApplicationWizardClient() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<SubmissionSuccessData | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Startup Profile Fields
  const [startupForm, setStartupForm] = useState({
    name: "",
    founderName: "",
    email: "",
    contactNumber: "",
    website: "",
    industry: "",
    startupStage: "",
    incorporationDate: "",
    registrationNumber: "",
    description: "",
    productDescription: "",
  });

  // Assessment responses & category applicability
  const [responses, setResponses] = useState<Record<string, { response: ResponseValue; textValue?: string }>>({});
  const [applicability, setApplicability] = useState<Record<string, { applicable: boolean; remarks?: string }>>({});

  // Active step: 0 = Startup Details, 1 = General IP, 2..N = Categories, Last = Review & Submit
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedMissing, setHighlightedMissing] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const qRes = await fetch("/api/v1/questionnaires/active");
        const qJson = await qRes.json();
        if (!qJson.success) {
          setErrorMessage(qJson.error?.message || "Failed to load questionnaire");
          return;
        }

        const loadedQuestions: Question[] = qJson.data.questions;
        setQuestions(loadedQuestions);

        const catMap = new Map<string, Category>();
        for (const q of loadedQuestions) {
          if (q.category) {
            catMap.set(q.category.id, q.category);
          }
        }
        setCategories(Array.from(catMap.values()));
      } catch {
        setErrorMessage("Network error loading application form.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleResponseChange = (questionId: string, val: ResponseValue) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], response: val },
    }));
    if (highlightedMissing[questionId]) {
      setHighlightedMissing((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleTextChange = (questionId: string, text: string) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        response: prev[questionId]?.response || ResponseValue.NO,
        textValue: text,
      },
    }));
  };

  const handleApplicabilityToggle = (catId: string, applicable: boolean) => {
    setApplicability((prev) => ({
      ...prev,
      [catId]: { ...prev[catId], applicable },
    }));
  };

  const scrollToElement = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus?.();
      }
    }, 50);
  };

  const validateStartupDetails = (): boolean => {
    const missing: Record<string, boolean> = {};

    if (!startupForm.name.trim()) missing.name = true;
    if (!startupForm.founderName.trim()) missing.founderName = true;
    if (!startupForm.email.trim() || !startupForm.email.includes("@")) missing.email = true;
    if (!startupForm.contactNumber.trim() || startupForm.contactNumber.length < 8) missing.contactNumber = true;
    if (!startupForm.industry) missing.industry = true;
    if (!startupForm.startupStage) missing.startupStage = true;
    if (startupForm.description.trim().length < 10) missing.description = true;
    if (startupForm.productDescription.trim().length < 10) missing.productDescription = true;

    setHighlightedMissing(missing);

    const firstMissingKey = Object.keys(missing)[0];
    if (firstMissingKey) {
      if (firstMissingKey === "name") setErrorMessage("Startup Name is required.");
      else if (firstMissingKey === "founderName") setErrorMessage("Primary Founder Name is required.");
      else if (firstMissingKey === "email") setErrorMessage("Valid Founder Email Address is required.");
      else if (firstMissingKey === "contactNumber") setErrorMessage("Valid Contact Phone Number is required.");
      else if (firstMissingKey === "industry") setErrorMessage("Please select an Industry Sector.");
      else if (firstMissingKey === "startupStage") setErrorMessage("Please select an Incubation Stage.");
      else if (firstMissingKey === "description") setErrorMessage("Executive Summary is required (min 10 characters).");
      else if (firstMissingKey === "productDescription") setErrorMessage("Proprietary Innovation description is required (min 10 characters).");
      
      scrollToElement(firstMissingKey);
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const validateCurrentStepQuestions = (stepIdx: number): boolean => {
    const stepObj = steps[stepIdx];
    if (!stepObj || stepObj.id === "PROFILE" || stepObj.id === "REVIEW") return true;

    // If category is explicitly marked as not applicable, questions are not required
    if (stepObj.categoryId && applicability[stepObj.categoryId]?.applicable === false) {
      return true;
    }

    const currentQuestions = questions.filter((q) =>
      stepObj.categoryId === null ? q.categoryId === null : q.categoryId === stepObj.categoryId
    );

    const missingQuestions: Record<string, boolean> = {};
    for (const q of currentQuestions) {
      if (q.isRequired && !responses[q.id]?.response) {
        missingQuestions[q.id] = true;
      }
    }

    setHighlightedMissing(missingQuestions);

    const firstMissingQId = Object.keys(missingQuestions)[0];
    if (firstMissingQId) {
      setErrorMessage("Please answer all required questions before proceeding.");
      scrollToElement(`question-${firstMissingQId}`);
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const canNavigateToStep = (targetIdx: number): boolean => {
    if (targetIdx <= currentStep) return true;

    // Check all previous steps from 0 to targetIdx - 1
    for (let i = 0; i < targetIdx; i++) {
      if (i === 0) {
        if (!validateStartupDetails()) {
          setCurrentStep(0);
          return false;
        }
      } else if (i < steps.length - 1) {
        if (!validateCurrentStepQuestions(i)) {
          setCurrentStep(i);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMessage("");

    try {
      const payloadResponses = Object.entries(responses).map(([qId, val]) => ({
        questionId: qId,
        response: val.response,
        textValue: val.textValue,
      }));

      const payloadApplicability = Object.entries(applicability).map(([cId, val]) => ({
        categoryId: cId,
        applicable: val.applicable,
        remarks: val.remarks,
      }));

      const res = await fetch("/api/v1/public/submit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup: startupForm,
          responses: payloadResponses,
          applicability: payloadApplicability,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessData(json.data);
      } else {
        setErrorMessage(json.error?.message || "Failed to submit assessment.");
      }
    } catch {
      setErrorMessage("Network error occurred during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  // Success view
  if (successData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <Card className="max-w-xl w-full border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/60 rounded-2xl">
          <CardHeader className="text-center pb-4">
            <div className="h-14 w-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-normal text-white font-[family-name:var(--font-bruno)]">Application Submitted!</CardTitle>
            <CardDescription className="text-sm text-white/60">
              Your startup details and IP readiness evaluation have been successfully registered with Bennett Hatchery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-4 bg-white/[0.04] rounded-xl border border-white/10 space-y-2 text-sm font-[family-name:var(--font-aldrich)]">
              <div className="flex justify-between">
                <span className="text-white/50">Official Startup Code:</span>
                <span className="font-mono font-bold text-white tracking-widest">{successData.startupCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Startup Name:</span>
                <span className="font-semibold text-white">{successData.startupName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Founder:</span>
                <span className="text-white/90">{successData.founderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Evaluation Version:</span>
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">Version {successData.version}</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-white/50">Provisional IP Score:</span>
                <div className="text-right">
                  <span className="text-base font-bold text-white">{successData.overallScore.toFixed(1)}%</span>
                  <Badge className="ml-2 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {successData.classification}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white/80 space-y-1">
              <p className="font-semibold text-white flex items-center font-[family-name:var(--font-aldrich)]">
                <FileCheck2 className="h-4 w-4 mr-1.5 text-white/70" /> What happens next?
              </p>
              <p className="text-white/60">
                A CIE Intellectual Property Reviewer will evaluate your submission, verify category applicability, and schedule your institutional review. Keep your startup code <b className="text-white">{successData.startupCode}</b> for future correspondence.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link href="/">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl font-[family-name:var(--font-aldrich)]">
                  Return to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stepper Structure
  const steps: { title: string; id?: string; categoryId?: string | null }[] = [
    { title: "Startup Profile", id: "PROFILE" },
    { title: "General IP Strategy", categoryId: null },
    ...categories.map((c) => ({ title: c.name, categoryId: c.id })),
    { title: "Review & Submit", id: "REVIEW" },
  ];

  const currentStepObj = steps[currentStep];

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateStartupDetails()) return;
    } else if (currentStep < steps.length - 1) {
      if (!validateCurrentStepQuestions(currentStep)) return;
    }
    setErrorMessage("");
    setHighlightedMissing({});
    setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const handlePrevious = () => {
    setErrorMessage("");
    setHighlightedMissing({});
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-slate-800 selection:text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-sky-950/20 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-20 bg-slate-900/60 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="w-full px-6 sm:px-10 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <Link
              href="/"
              className="text-white/70 hover:text-white transition-colors p-2.5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center justify-center shrink-0"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-white text-lg sm:text-xl tracking-wide font-[family-name:var(--font-aldrich)]">
                Startup IP Assessment
              </h1>
              <p className="text-xs sm:text-sm text-white/50">Bennett Hatchery • Direct Application Portal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stepper Navigation */}
      <div className="relative z-10 bg-slate-900/40 backdrop-blur-md border-b border-white/10 py-4">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-start md:justify-center space-x-3 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-sm font-[family-name:var(--font-aldrich)]">
          {steps.map((st, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (!canNavigateToStep(idx)) return;
                setErrorMessage("");
                setHighlightedMissing({});
                setCurrentStep(idx);
              }}
              className={`flex items-center space-x-2.5 px-4 py-2 rounded-full transition-all shrink-0 cursor-pointer ${
                currentStep === idx
                  ? "bg-white text-slate-950 font-semibold shadow-lg shadow-white/10"
                  : idx < currentStep
                  ? "text-white/90 hover:bg-white/10 font-medium"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center text-xs font-mono">
                {idx + 1}
              </span>
              <span>{st.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-6 sm:p-8 space-y-8">
        {errorMessage && (
          <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center space-x-3 text-red-300 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 0: STARTUP DETAILS */}
        {currentStep === 0 && (
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/60 rounded-3xl p-2 sm:p-4">
            <CardHeader className="pb-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white/90">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl sm:text-2xl font-normal text-white tracking-wide font-[family-name:var(--font-aldrich)]">
                    Startup Venture Information
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-white/60 mt-1">
                    Please enter your corporate registration and founder details. No prior account or login is required.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2" id="name">
                  <Label htmlFor="nameInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.name ? "text-red-400" : "text-white/90"}`}>
                    Startup Name *
                  </Label>
                  <Input
                    id="nameInput"
                    placeholder="e.g. NovaTrace AI Solutions"
                    value={startupForm.name}
                    onChange={(e) => {
                      setStartupForm((f) => ({ ...f, name: e.target.value }));
                      if (highlightedMissing.name) setHighlightedMissing((prev) => ({ ...prev, name: false }));
                    }}
                    className={`h-12 text-base bg-white/[0.05] rounded-xl px-4 focus-visible:ring-white/30 ${
                      highlightedMissing.name
                        ? "border-red-500/80 ring-2 ring-red-500/30 text-white placeholder:text-red-300/50"
                        : "border-white/15 text-white placeholder:text-white/30 focus-visible:border-white/40"
                    }`}
                  />
                  {highlightedMissing.name && <p className="text-xs text-red-400 font-medium">Startup name is required</p>}
                </div>

                <div className="space-y-2" id="founderName">
                  <Label htmlFor="founderNameInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.founderName ? "text-red-400" : "text-white/90"}`}>
                    Primary Founder Name *
                  </Label>
                  <Input
                    id="founderNameInput"
                    placeholder="Full legal name"
                    value={startupForm.founderName}
                    onChange={(e) => {
                      setStartupForm((f) => ({ ...f, founderName: e.target.value }));
                      if (highlightedMissing.founderName) setHighlightedMissing((prev) => ({ ...prev, founderName: false }));
                    }}
                    className={`h-12 text-base bg-white/[0.05] rounded-xl px-4 focus-visible:ring-white/30 ${
                      highlightedMissing.founderName
                        ? "border-red-500/80 ring-2 ring-red-500/30 text-white placeholder:text-red-300/50"
                        : "border-white/15 text-white placeholder:text-white/30 focus-visible:border-white/40"
                    }`}
                  />
                  {highlightedMissing.founderName && <p className="text-xs text-red-400 font-medium">Founder name is required</p>}
                </div>

                <div className="space-y-2" id="email">
                  <Label htmlFor="emailInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.email ? "text-red-400" : "text-white/90"}`}>
                    Founder / Contact Email *
                  </Label>
                  <Input
                    id="emailInput"
                    type="email"
                    placeholder="founder@yourstartup.com"
                    value={startupForm.email}
                    onChange={(e) => {
                      setStartupForm((f) => ({ ...f, email: e.target.value }));
                      if (highlightedMissing.email) setHighlightedMissing((prev) => ({ ...prev, email: false }));
                    }}
                    className={`h-12 text-base bg-white/[0.05] rounded-xl px-4 focus-visible:ring-white/30 ${
                      highlightedMissing.email
                        ? "border-red-500/80 ring-2 ring-red-500/30 text-white placeholder:text-red-300/50"
                        : "border-white/15 text-white placeholder:text-white/30 focus-visible:border-white/40"
                    }`}
                  />
                  {highlightedMissing.email && <p className="text-xs text-red-400 font-medium">Valid email address is required</p>}
                </div>

                <div className="space-y-2" id="contactNumber">
                  <Label htmlFor="contactNumberInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.contactNumber ? "text-red-400" : "text-white/90"}`}>
                    Contact Phone Number *
                  </Label>
                  <Input
                    id="contactNumberInput"
                    placeholder="+91 98765 43210"
                    value={startupForm.contactNumber}
                    onChange={(e) => {
                      setStartupForm((f) => ({ ...f, contactNumber: e.target.value }));
                      if (highlightedMissing.contactNumber) setHighlightedMissing((prev) => ({ ...prev, contactNumber: false }));
                    }}
                    className={`h-12 text-base bg-white/[0.05] rounded-xl px-4 focus-visible:ring-white/30 ${
                      highlightedMissing.contactNumber
                        ? "border-red-500/80 ring-2 ring-red-500/30 text-white placeholder:text-red-300/50"
                        : "border-white/15 text-white placeholder:text-white/30 focus-visible:border-white/40"
                    }`}
                  />
                  {highlightedMissing.contactNumber && <p className="text-xs text-red-400 font-medium">Valid phone number is required</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm font-semibold text-white/90 font-[family-name:var(--font-aldrich)]">
                    Website URL (Optional)
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourstartup.com"
                    value={startupForm.website}
                    onChange={(e) => setStartupForm((f) => ({ ...f, website: e.target.value }))}
                    className="h-12 text-base bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 rounded-xl px-4 focus-visible:ring-white/30 focus-visible:border-white/40"
                  />
                </div>

                <div className="space-y-2" id="industry">
                  <Label htmlFor="industryInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.industry ? "text-red-400" : "text-white/90"}`}>
                    Industry / Sector *
                  </Label>
                  <Select
                    value={startupForm.industry}
                    onValueChange={(val) => {
                      setStartupForm((f) => ({ ...f, industry: val ?? "" }));
                      if (highlightedMissing.industry) setHighlightedMissing((prev) => ({ ...prev, industry: false }));
                    }}
                  >
                    <SelectTrigger id="industryInput" className={`!h-12 text-base w-full bg-white/[0.05] rounded-xl px-4 focus-visible:ring-white/30 ${
                      highlightedMissing.industry
                        ? "border-red-500/80 ring-2 ring-red-500/30 text-white"
                        : "border-white/15 text-white focus-visible:border-white/40"
                    }`}>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Artificial Intelligence / SaaS">Artificial Intelligence / SaaS</SelectItem>
                      <SelectItem value="Healthcare & BioTech">Healthcare & BioTech</SelectItem>
                      <SelectItem value="FinTech & InsurTech">FinTech & InsurTech</SelectItem>
                      <SelectItem value="CleanTech & AgriTech">CleanTech & AgriTech</SelectItem>
                      <SelectItem value="Hardware & Robotics">Hardware & Robotics</SelectItem>
                      <SelectItem value="EdTech & Consumer Internet">EdTech & Consumer Internet</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {highlightedMissing.industry && <p className="text-xs text-red-400 font-medium">Please select an industry sector</p>}
                </div>

                <div className="space-y-2" id="startupStage">
                  <Label htmlFor="startupStageInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.startupStage ? "text-red-400" : "text-white/90"}`}>
                    Incubation Stage *
                  </Label>
                  <Select
                    value={startupForm.startupStage}
                    onValueChange={(val) => {
                      setStartupForm((f) => ({ ...f, startupStage: val ?? "" }));
                      if (highlightedMissing.startupStage) setHighlightedMissing((prev) => ({ ...prev, startupStage: false }));
                    }}
                  >
                    <SelectTrigger id="startupStageInput" className={`!h-12 text-base w-full bg-white/[0.05] rounded-xl px-4 focus-visible:ring-white/30 ${
                      highlightedMissing.startupStage
                        ? "border-red-500/80 ring-2 ring-red-500/30 text-white"
                        : "border-white/15 text-white focus-visible:border-white/40"
                    }`}>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea Stage">Idea Stage</SelectItem>
                      <SelectItem value="Prototype Stage">Prototype Stage</SelectItem>
                      <SelectItem value="MVP Stage">MVP Stage</SelectItem>
                      <SelectItem value="Early Revenue">Early Revenue</SelectItem>
                      <SelectItem value="Growth Stage">Growth Stage</SelectItem>
                      <SelectItem value="Established Business">Established Business</SelectItem>
                    </SelectContent>
                  </Select>
                  {highlightedMissing.startupStage && <p className="text-xs text-red-400 font-medium">Please select an incubation stage</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registrationNumber" className="text-sm font-semibold text-white/90 font-[family-name:var(--font-aldrich)]">
                    CIN / Registration (Optional)
                  </Label>
                  <Input
                    id="registrationNumber"
                    placeholder="e.g. U72900UP2024PTC199876"
                    value={startupForm.registrationNumber}
                    onChange={(e) => setStartupForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                    className="h-12 text-base bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 rounded-xl px-4 focus-visible:ring-white/30 focus-visible:border-white/40"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2" id="description">
                <Label htmlFor="descriptionInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.description ? "text-red-400" : "text-white/90"}`}>
                  Executive Summary *
                </Label>
                <Textarea
                  id="descriptionInput"
                  placeholder="Summarize your product, target market, and value proposition..."
                  value={startupForm.description}
                  onChange={(e) => {
                    setStartupForm((f) => ({ ...f, description: e.target.value }));
                    if (highlightedMissing.description) setHighlightedMissing((prev) => ({ ...prev, description: false }));
                  }}
                  className={`min-h-28 text-base bg-white/[0.05] rounded-xl p-4 focus-visible:ring-white/30 ${
                    highlightedMissing.description
                      ? "border-red-500/80 ring-2 ring-red-500/30 text-white placeholder:text-red-300/50"
                      : "border-white/15 text-white placeholder:text-white/30 focus-visible:border-white/40"
                  }`}
                  rows={3}
                />
                {highlightedMissing.description && <p className="text-xs text-red-400 font-medium">Executive summary is required (min 10 characters)</p>}
              </div>

              <div className="space-y-2" id="productDescription">
                <Label htmlFor="productDescriptionInput" className={`text-sm font-semibold font-[family-name:var(--font-aldrich)] ${highlightedMissing.productDescription ? "text-red-400" : "text-white/90"}`}>
                  Proprietary Technology &amp; Innovation *
                </Label>
                <Textarea
                  id="productDescriptionInput"
                  placeholder="Describe your proprietary technology, algorithms, novel designs, or secret know-how..."
                  value={startupForm.productDescription}
                  onChange={(e) => {
                    setStartupForm((f) => ({ ...f, productDescription: e.target.value }));
                    if (highlightedMissing.productDescription) setHighlightedMissing((prev) => ({ ...prev, productDescription: false }));
                  }}
                  className={`min-h-28 text-base bg-white/[0.05] rounded-xl p-4 focus-visible:ring-white/30 ${
                    highlightedMissing.productDescription
                      ? "border-red-500/80 ring-2 ring-red-500/30 text-white placeholder:text-red-300/50"
                      : "border-white/15 text-white placeholder:text-white/30 focus-visible:border-white/40"
                  }`}
                  rows={3}
                />
                {highlightedMissing.productDescription && <p className="text-xs text-red-400 font-medium">Proprietary technology description is required (min 10 characters)</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* QUESTION STEPS (General IP or specific Categories) */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/60 rounded-3xl p-2 sm:p-4">
            <CardHeader className="pb-6 border-b border-white/10">
              <CardTitle className="text-xl sm:text-2xl font-normal text-white tracking-wide font-[family-name:var(--font-aldrich)]">{currentStepObj.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-white/60 mt-1">
                Answer each question accurately. You can mark Not Applicable if outside your business model.
              </CardDescription>

              {/* Category Applicability Toggle */}
              {currentStepObj.categoryId && (
                <div className="mt-4 p-4 bg-white/[0.05] border border-white/15 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-sm font-semibold text-white block font-[family-name:var(--font-aldrich)]">Category Applicability</span>
                    <span className="text-xs text-white/50">
                      Does your startup produce or utilize {currentStepObj.title}?
                    </span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Button
                      size="sm"
                      variant={applicability[currentStepObj.categoryId]?.applicable !== false ? "default" : "outline"}
                      className={
                        applicability[currentStepObj.categoryId]?.applicable !== false
                          ? "bg-white text-slate-950 font-semibold h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)]"
                          : "border-white/20 text-white/70 hover:text-white h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)]"
                      }
                      onClick={() => handleApplicabilityToggle(currentStepObj.categoryId as string, true)}
                    >
                      Applicable
                    </Button>
                    <Button
                      size="sm"
                      variant={applicability[currentStepObj.categoryId]?.applicable === false ? "default" : "outline"}
                      className={
                        applicability[currentStepObj.categoryId]?.applicable === false
                          ? "bg-white/25 text-white h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)]"
                          : "border-white/20 text-white/70 hover:text-white h-9 px-4 text-xs rounded-xl font-[family-name:var(--font-aldrich)]"
                      }
                      onClick={() => handleApplicabilityToggle(currentStepObj.categoryId as string, false)}
                    >
                      Not Applicable
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {questions
                .filter((q) =>
                  currentStepObj.categoryId === null
                    ? q.categoryId === null
                    : q.categoryId === currentStepObj.categoryId
                )
                .map((q, idx) => {
                  const currentResp = responses[q.id]?.response;
                  const currentText = responses[q.id]?.textValue || "";

                  return (
                    <div
                      key={q.id}
                      id={`question-${q.id}`}
                      className={`p-5 sm:p-6 rounded-2xl border bg-white/[0.03] space-y-4 transition-all scroll-mt-24 ${
                        highlightedMissing[q.id]
                          ? "border-red-500/80 ring-2 ring-red-500/30 bg-red-950/10"
                          : "border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-xs font-mono text-white/40 block mb-1">Question {idx + 1}</span>
                          <h4 className="text-base font-semibold text-white tracking-wide">{q.questionText}</h4>
                          {q.description && <p className="text-xs text-white/60 mt-1.5 leading-relaxed">{q.description}</p>}
                        </div>
                        {q.isRequired && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-[family-name:var(--font-aldrich)] uppercase tracking-wider shrink-0 transition-colors ${
                              highlightedMissing[q.id]
                                ? "border-red-500/50 bg-red-500/20 text-red-300"
                                : "border-white/20 bg-white/10 text-white/80"
                            }`}
                          >
                            Required
                          </Badge>
                        )}
                      </div>

                      {highlightedMissing[q.id] && (
                        <p className="text-xs text-red-400 font-medium font-[family-name:var(--font-aldrich)]">
                          * Please select an option for this required question before continuing
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {[
                          { label: "Yes", val: ResponseValue.YES },
                          { label: "Applied", val: ResponseValue.APPLIED },
                          { label: "No", val: ResponseValue.NO },
                          { label: "Not Sure", val: ResponseValue.NOT_SURE },
                          { label: "N/A", val: ResponseValue.NOT_APPLICABLE },
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleResponseChange(q.id, opt.val)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer font-[family-name:var(--font-aldrich)] ${
                              currentResp === opt.val
                                ? "bg-white text-slate-950 shadow-md shadow-white/10"
                                : "bg-white/[0.06] text-white/70 border border-white/10 hover:border-white/30 hover:text-white"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {(currentResp === ResponseValue.YES || currentResp === ResponseValue.APPLIED) && (
                        <div className="pt-2">
                          <Label className="text-xs text-white/70 font-[family-name:var(--font-aldrich)]">Application Number / Filing Details (Optional)</Label>
                          <Input
                            placeholder="Filing date, registration number, or jurisdiction..."
                            value={currentText}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            className="h-10 text-xs mt-1.5 bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}

        {/* REVIEW & SUBMIT STEP */}
        {currentStep === steps.length - 1 && (
          <Card className="border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/60 rounded-3xl p-2 sm:p-4">
            <CardHeader className="pb-6 border-b border-white/10">
              <CardTitle className="text-xl sm:text-2xl font-normal text-white tracking-wide font-[family-name:var(--font-aldrich)]">Review &amp; Final Submission</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-white/60 mt-1">
                Please verify your startup information and questionnaire completion before final submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="p-5 bg-white/[0.04] rounded-2xl border border-white/10 space-y-3">
                <span className="font-semibold text-white text-base block font-[family-name:var(--font-aldrich)]">Venture Details Summary</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/70">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5"><b className="text-white">Startup:</b> {startupForm.name || "—"}</div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5"><b className="text-white">Founder:</b> {startupForm.founderName || "—"}</div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5"><b className="text-white">Email:</b> {startupForm.email || "—"}</div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5"><b className="text-white">Phone:</b> {startupForm.contactNumber || "—"}</div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5"><b className="text-white">Sector:</b> {startupForm.industry || "—"}</div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5"><b className="text-white">Stage:</b> {startupForm.startupStage || "—"}</div>
                </div>
              </div>

              <div className="p-5 bg-white/[0.04] border border-white/10 rounded-2xl flex items-start space-x-3.5 text-sm text-white/80">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5 text-emerald-400" />
                <div>
                  <p className="font-semibold text-white text-base font-[family-name:var(--font-aldrich)]">Institutional Review Notification</p>
                  <p className="mt-1 text-white/60 leading-relaxed text-sm">
                    Upon clicking submit, a unique startup tracking code will be generated for you. Your IP maturity score will be preliminarily computed and queued for CIE Reviewer sign-off.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center text-sm font-[family-name:var(--font-aldrich)]">
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10">
                  <span className="text-white/40 block mb-1">Total Questions</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">{questions.length}</span>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10">
                  <span className="text-white/40 block mb-1">Answered</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">{Object.keys(responses).length}</span>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/10">
                  <span className="text-white/40 block mb-1">Unanswered</span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-400">
                    {Math.max(0, questions.length - Object.keys(responses).length)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 0}
            onClick={handlePrevious}
            className="border-white/20 text-white/80 hover:text-white hover:bg-white/10 h-11 px-5 rounded-xl font-[family-name:var(--font-aldrich)]"
          >
            <ChevronLeft className="h-4 w-4 mr-1.5" /> Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              className="bg-white text-slate-950 hover:bg-white/90 font-semibold h-11 px-7 rounded-xl font-[family-name:var(--font-aldrich)] tracking-[0.05em] shadow-lg shadow-white/10"
              onClick={handleNext}
            >
              Next Step <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-white text-slate-950 hover:bg-white/90 font-semibold h-11 px-8 rounded-xl font-[family-name:var(--font-aldrich)] tracking-[0.05em] shadow-lg shadow-white/10"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Submit Application &amp; Evaluation
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
