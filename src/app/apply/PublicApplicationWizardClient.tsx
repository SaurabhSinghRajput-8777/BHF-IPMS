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

  const validateStartupDetails = (): boolean => {
    if (!startupForm.name.trim()) {
      setErrorMessage("Startup Name is required.");
      return false;
    }
    if (!startupForm.founderName.trim()) {
      setErrorMessage("Founder Name is required.");
      return false;
    }
    if (!startupForm.email.trim() || !startupForm.email.includes("@")) {
      setErrorMessage("Valid founder email address is required.");
      return false;
    }
    if (!startupForm.contactNumber.trim() || startupForm.contactNumber.length < 8) {
      setErrorMessage("Valid contact number is required.");
      return false;
    }
    if (!startupForm.industry) {
      setErrorMessage("Please select an industry sector.");
      return false;
    }
    if (!startupForm.startupStage) {
      setErrorMessage("Please select your startup incubation stage.");
      return false;
    }
    if (startupForm.description.trim().length < 10) {
      setErrorMessage("Please provide an executive summary (at least 10 characters).");
      return false;
    }
    if (startupForm.productDescription.trim().length < 10) {
      setErrorMessage("Please describe your proprietary innovation (at least 10 characters).");
      return false;
    }
    setErrorMessage("");
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  // Success view
  if (successData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <Card className="max-w-xl w-full border-slate-200 shadow-md bg-white">
          <CardHeader className="text-center pb-4">
            <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Application Submitted!</CardTitle>
            <CardDescription className="text-sm text-slate-600">
              Your startup details and IP readiness evaluation have been successfully registered with Bennett Hatchery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Official Startup Code:</span>
                <span className="font-mono font-bold text-blue-900">{successData.startupCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Startup Name:</span>
                <span className="font-semibold text-slate-800">{successData.startupName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Founder:</span>
                <span className="text-slate-800">{successData.founderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Evaluation Version:</span>
                <Badge variant="outline">Version {successData.version}</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500">Provisional IP Score:</span>
                <div className="text-right">
                  <span className="text-base font-bold text-blue-900">{successData.overallScore.toFixed(1)}%</span>
                  <Badge className="ml-2 text-xs bg-emerald-100 text-emerald-800">
                    {successData.classification}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-950 space-y-1">
              <p className="font-semibold flex items-center">
                <FileCheck2 className="h-4 w-4 mr-1.5" /> What happens next?
              </p>
              <p className="text-slate-600">
                A CIE Intellectual Property Reviewer will evaluate your submission, verify category applicability, and schedule your institutional review. Keep your startup code <b>{successData.startupCode}</b> for future correspondence.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link href="/">
                <Button variant="outline" className="text-sm">
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
  const steps = [
    { title: "Startup Profile", id: "PROFILE" },
    { title: "General IP Strategy", categoryId: null },
    ...categories.map((c) => ({ title: c.name, categoryId: c.id })),
    { title: "Review & Submit", id: "REVIEW" },
  ];

  const currentStepObj = steps[currentStep];

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateStartupDetails()) return;
    }
    setErrorMessage("");
    setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
  };

  const handlePrevious = () => {
    setErrorMessage("");
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-9 w-9 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-base shadow-sm">
              BH
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base">Startup IP Assessment &amp; Onboarding</h1>
              <p className="text-xs text-slate-500">Bennett Hatchery • Direct Application Portal</p>
            </div>
          </div>
          <Link href="/login">
            <Button size="sm" variant="ghost" className="text-xs text-slate-600">
              CIE Staff Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Stepper Navigation */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center space-x-2 overflow-x-auto text-xs">
          {steps.map((st, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (currentStep === 0 && !validateStartupDetails() && idx > 0) return;
                setCurrentStep(idx);
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all shrink-0 ${
                currentStep === idx
                  ? "bg-blue-900 text-white font-semibold"
                  : idx < currentStep
                  ? "text-blue-900 hover:bg-blue-50 font-medium"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px]">
                {idx + 1}
              </span>
              <span>{st.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-3 text-rose-800 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 0: STARTUP DETAILS */}
        {currentStep === 0 && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-900" />
                <CardTitle className="text-lg font-bold text-slate-900">Startup Venture Information</CardTitle>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Please enter your corporate registration and founder details. No prior account or login is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Startup Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. NovaTrace AI Solutions"
                    value={startupForm.name}
                    onChange={(e) => setStartupForm((f) => ({ ...f, name: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="founderName" className="text-xs font-semibold">
                    Primary Founder Name *
                  </Label>
                  <Input
                    id="founderName"
                    placeholder="Full legal name"
                    value={startupForm.founderName}
                    onChange={(e) => setStartupForm((f) => ({ ...f, founderName: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Founder / Contact Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="founder@yourstartup.com"
                    value={startupForm.email}
                    onChange={(e) => setStartupForm((f) => ({ ...f, email: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber" className="text-xs font-semibold">
                    Contact Phone Number *
                  </Label>
                  <Input
                    id="contactNumber"
                    placeholder="+91 98765 43210"
                    value={startupForm.contactNumber}
                    onChange={(e) => setStartupForm((f) => ({ ...f, contactNumber: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-xs font-semibold">
                    Website URL (Optional)
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourstartup.com"
                    value={startupForm.website}
                    onChange={(e) => setStartupForm((f) => ({ ...f, website: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="industry" className="text-xs font-semibold">
                    Industry / Sector *
                  </Label>
                  <Select
                    value={startupForm.industry}
                    onValueChange={(val) => setStartupForm((f) => ({ ...f, industry: val ?? "" }))}
                  >
                    <SelectTrigger id="industry" className="h-9 text-xs">
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
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="startupStage" className="text-xs font-semibold">
                    Incubation Stage *
                  </Label>
                  <Select
                    value={startupForm.startupStage}
                    onValueChange={(val) => setStartupForm((f) => ({ ...f, startupStage: val ?? "" }))}
                  >
                    <SelectTrigger id="startupStage" className="h-9 text-xs">
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
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="registrationNumber" className="text-xs font-semibold">
                    CIN / Registration (Optional)
                  </Label>
                  <Input
                    id="registrationNumber"
                    placeholder="e.g. U72900UP2024PTC199876"
                    value={startupForm.registrationNumber}
                    onChange={(e) => setStartupForm((f) => ({ ...f, registrationNumber: e.target.value }))}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="description" className="text-xs font-semibold">
                  Executive Summary *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Summarize your product, target market, and value proposition..."
                  value={startupForm.description}
                  onChange={(e) => setStartupForm((f) => ({ ...f, description: e.target.value }))}
                  className="text-xs"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productDescription" className="text-xs font-semibold">
                  Proprietary Technology &amp; Innovation *
                </Label>
                <Textarea
                  id="productDescription"
                  placeholder="Describe your proprietary technology, algorithms, novel designs, or secret know-how..."
                  value={startupForm.productDescription}
                  onChange={(e) => setStartupForm((f) => ({ ...f, productDescription: e.target.value }))}
                  className="text-xs"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* QUESTION STEPS (General IP or specific Categories) */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">{currentStepObj.title}</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Answer each question accurately. You can mark Not Applicable if outside your business model.
              </CardDescription>

              {/* Category Applicability Toggle */}
              {currentStepObj.categoryId && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Category Applicability</span>
                    <span className="text-[11px] text-slate-500">
                      Does your startup produce or utilize {currentStepObj.title}?
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={applicability[currentStepObj.categoryId]?.applicable !== false ? "default" : "outline"}
                      className={
                        applicability[currentStepObj.categoryId]?.applicable !== false
                          ? "bg-blue-900 text-white h-7 text-xs"
                          : "h-7 text-xs"
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
                          ? "bg-slate-700 text-white h-7 text-xs"
                          : "h-7 text-xs"
                      }
                      onClick={() => handleApplicabilityToggle(currentStepObj.categoryId as string, false)}
                    >
                      Not Applicable
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
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
                    <div key={q.id} className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono text-slate-400 block mb-0.5">Q{idx + 1}</span>
                          <h4 className="text-sm font-semibold text-slate-900">{q.questionText}</h4>
                          {q.description && <p className="text-xs text-slate-500 mt-1">{q.description}</p>}
                        </div>
                        {q.isRequired && <Badge variant="secondary" className="text-[10px]">Required</Badge>}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
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
                            className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                              currentResp === opt.val
                                ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {(currentResp === ResponseValue.YES || currentResp === ResponseValue.APPLIED) && (
                        <div className="pt-1">
                          <Label className="text-xs text-slate-600">Application Number / Filing Details (Optional)</Label>
                          <Input
                            placeholder="Filing date, registration number, or jurisdiction..."
                            value={currentText}
                            onChange={(e) => handleTextChange(q.id, e.target.value)}
                            className="h-8 text-xs mt-1 bg-white"
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
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Review &amp; Final Submission</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Please verify your startup information and questionnaire completion before final submission.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 text-sm block">Venture Details Summary</span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div><b>Startup:</b> {startupForm.name}</div>
                  <div><b>Founder:</b> {startupForm.founderName}</div>
                  <div><b>Email:</b> {startupForm.email}</div>
                  <div><b>Phone:</b> {startupForm.contactNumber}</div>
                  <div><b>Sector:</b> {startupForm.industry}</div>
                  <div><b>Stage:</b> {startupForm.startupStage}</div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3 text-xs text-blue-900">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Institutional Review Notification</p>
                  <p className="mt-0.5">
                    Upon clicking submit, a unique startup tracking code will be generated for you. Your IP maturity score will be preliminarily computed and queued for CIE Reviewer sign-off.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block">Total Questions</span>
                  <span className="text-base font-bold text-slate-900">{questions.length}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block">Answered</span>
                  <span className="text-base font-bold text-blue-900">{Object.keys(responses).length}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <span className="text-slate-400 block">Unanswered</span>
                  <span className="text-base font-bold text-amber-600">
                    {Math.max(0, questions.length - Object.keys(responses).length)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 0}
            onClick={handlePrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              className="bg-blue-900 hover:bg-blue-800 text-white"
              onClick={handleNext}
            >
              Next Step <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6"
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
