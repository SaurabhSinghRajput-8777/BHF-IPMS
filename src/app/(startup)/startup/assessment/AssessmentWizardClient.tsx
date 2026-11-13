"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckCircle2, ChevronRight, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
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

export function AssessmentWizardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const assessmentIdParam = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [assessmentId, setAssessmentId] = useState<string | null>(assessmentIdParam);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [responses, setResponses] = useState<Record<string, { response: ResponseValue; textValue?: string }>>({});
  const [applicability, setApplicability] = useState<Record<string, { applicable: boolean; remarks?: string }>>({});

  // Active step: 0 = General IP, 1..N = Categories, Last = Review & Submit
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        // 1. Fetch active questionnaire
        const qRes = await fetch("/api/v1/questionnaires/active");
        const qJson = await qRes.json();
        if (!qJson.success) {
          setErrorMessage(qJson.error?.message || "Failed to load questionnaire");
          return;
        }

        const loadedQuestions: Question[] = qJson.data.questions;
        setQuestions(loadedQuestions);

        // Extract distinct categories
        const catMap = new Map<string, Category>();
        for (const q of loadedQuestions) {
          if (q.category) {
            catMap.set(q.category.id, q.category);
          }
        }
        setCategories(Array.from(catMap.values()));

        // 2. Load or create assessment
        let targetId = assessmentIdParam;
        if (!targetId) {
          // Create draft
          const createRes = await fetch("/api/v1/assessments", { method: "POST" });
          const createJson = await createRes.json();
          if (createJson.success) {
            targetId = createJson.data.id;
            setAssessmentId(targetId);
          } else {
            setErrorMessage(createJson.error?.message || "Failed to initialize draft assessment.");
            return;
          }
        }

        // Fetch draft details
        if (targetId) {
          const draftRes = await fetch(`/api/v1/assessments/${targetId}`);
          const draftJson = await draftRes.json();
          if (draftJson.success && draftJson.data) {
            const draft = draftJson.data;
            const respMap: Record<string, { response: ResponseValue; textValue?: string }> = {};
            for (const r of draft.responses) {
              respMap[r.questionId] = { response: r.response, textValue: r.textValue || "" };
            }
            setResponses(respMap);

            const appMap: Record<string, { applicable: boolean; remarks?: string }> = {};
            for (const a of draft.applicability) {
              appMap[a.categoryId] = { applicable: a.startupApplicable, remarks: a.startupRemarks || "" };
            }
            setApplicability(appMap);
          }
        }
      } catch {
        setErrorMessage("An unexpected network error occurred.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [assessmentIdParam]);

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

  const handleSaveDraft = async () => {
    if (!assessmentId) return;
    setSaving(true);
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

      await fetch(`/api/v1/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: payloadResponses,
          applicability: payloadApplicability,
        }),
      });
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!assessmentId) return;
    setSubmitting(true);
    setErrorMessage("");

    try {
      // Save draft first
      await handleSaveDraft();

      const res = await fetch(`/api/v1/assessments/${assessmentId}/submit`, {
        method: "POST",
      });
      const json = await res.json();

      if (json.success) {
        router.push("/startup/dashboard");
      } else {
        setErrorMessage(json.error?.message || "Submission failed. Ensure all required questions are answered.");
      }
    } catch {
      setErrorMessage("Network error during submission.");
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

  // Steps structure
  // Step 0: General IP questions (categoryId === null)
  // Step 1..categories.length: Specific Category
  // Step categories.length + 1: Review & Submit
  const steps = [
    { title: "General IP Strategy", categoryId: null },
    ...categories.map((c) => ({ title: c.name, categoryId: c.id })),
    { title: "Review & Submit", categoryId: "REVIEW" },
  ];

  const currentStepObj = steps[currentStep];
  const stepQuestions =
    currentStepObj.categoryId === "REVIEW"
      ? []
      : questions.filter((q) =>
          currentStepObj.categoryId === null ? q.categoryId === null : q.categoryId === currentStepObj.categoryId
        );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 w-full">
        <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/startup/dashboard" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="font-bold text-slate-900 text-base">IP Readiness Assessment Wizard</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={handleSaveDraft} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
              Save Draft
            </Button>
          </div>
        </div>
      </header>

      {/* Stepper Header */}
      <div className="bg-white border-b border-slate-100 py-3">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between overflow-x-auto text-xs">
          {steps.map((st, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all shrink-0 ${
                currentStep === idx
                  ? "bg-blue-900 text-white font-semibold"
                  : idx < currentStep
                  ? "text-blue-900 hover:bg-blue-50"
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

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-3 text-rose-800 text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step: Questions Mode */}
        {currentStepObj.categoryId !== "REVIEW" ? (
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">{currentStepObj.title}</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Answer each question accurately. You can mark Not Applicable if outside your business scope.
              </CardDescription>

              {/* Category Applicability Toggle for Category Steps */}
              {currentStepObj.categoryId !== null && (
                <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 block">Category Applicability</span>
                    <span className="text-[11px] text-slate-500">
                      Does your startup have or require {currentStepObj.title}?
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
            <CardContent className="space-y-6 pt-2">
              {stepQuestions.map((q, idx) => {
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
                        { label: "Yes", val: ResponseValue.YES, color: "hover:border-emerald-500" },
                        { label: "Applied", val: ResponseValue.APPLIED, color: "hover:border-blue-500" },
                        { label: "No", val: ResponseValue.NO, color: "hover:border-slate-500" },
                        { label: "Not Sure", val: ResponseValue.NOT_SURE, color: "hover:border-amber-500" },
                        { label: "N/A", val: ResponseValue.NOT_APPLICABLE, color: "hover:border-slate-400" },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => handleResponseChange(q.id, opt.val)}
                          className={`px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                            currentResp === opt.val
                              ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                              : "bg-white text-slate-700 border-slate-200 " + opt.color
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Details input for Yes or Applied */}
                    {(currentResp === ResponseValue.YES || currentResp === ResponseValue.APPLIED) && (
                      <div className="pt-2">
                        <Label className="text-xs text-slate-600">Application / Registration / Details (Optional)</Label>
                        <Input
                          placeholder="Registration number, filing date, or remarks..."
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
        ) : (
          /* Step: Review & Submit Mode */
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">Review &amp; Final Submission</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Verify your answers before submitting. Submitted assessments are immutable and reviewed by CIE administration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3 text-xs text-blue-900">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Institutional Assessment Protocol</p>
                  <p className="mt-0.5">
                    Upon submission, preliminary scores are calculated automatically. A CIE Intellectual Property Lead will verify category applicability, conduct institutional review, and issue official guidance.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Completion Summary</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                    <span className="text-xs text-slate-400 block">Total Questions</span>
                    <span className="text-base font-bold text-slate-900">{questions.length}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                    <span className="text-xs text-slate-400 block">Answered</span>
                    <span className="text-base font-bold text-blue-900">{Object.keys(responses).length}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                    <span className="text-xs text-slate-400 block">Unanswered</span>
                    <span className="text-base font-bold text-amber-600">
                      {Math.max(0, questions.length - Object.keys(responses).length)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-100 text-center">
                    <span className="text-xs text-slate-400 block">Categories</span>
                    <span className="text-base font-bold text-slate-900">{categories.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              className="bg-blue-900 hover:bg-blue-800"
              onClick={async () => {
                await handleSaveDraft();
                setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
              }}
            >
              Next Step <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Submit Assessment
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
