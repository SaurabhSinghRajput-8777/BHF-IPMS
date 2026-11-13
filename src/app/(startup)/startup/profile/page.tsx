"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { ApiResponse } from "@/types";

interface StartupProfile {
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
}

export default function StartupProfilePage() {
  const [profile, setProfile] = useState<StartupProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/v1/startups/me");
        const json: ApiResponse<StartupProfile> = await res.json();
        if (json.success && json.data) {
          setProfile(json.data);
        } else {
          setStatusMessage({ type: "error", text: json.error?.message || "Failed to load startup profile" });
        }
      } catch {
        setStatusMessage({ type: "error", text: "Network error loading startup profile" });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/v1/startups/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          founderName: profile.founderName,
          contactNumber: profile.contactNumber,
          website: profile.website,
          industry: profile.industry,
          startupStage: profile.startupStage,
          registrationNumber: profile.registrationNumber,
          description: profile.description,
          productDescription: profile.productDescription,
        }),
      });

      const json: ApiResponse<StartupProfile> = await res.json();
      if (json.success && json.data) {
        setProfile(json.data);
        setStatusMessage({ type: "success", text: "Startup profile successfully updated!" });
      } else {
        setStatusMessage({ type: "error", text: json.error?.message || "Failed to update profile" });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Network error saving profile" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/startup/dashboard" className="text-slate-500 hover:text-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="h-8 w-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
              BH
            </div>
            <span className="font-bold text-slate-900 text-base">Startup Profile Management</span>
          </div>
          {profile?.startupCode && (
            <Badge variant="outline" className="font-mono text-xs font-semibold bg-blue-50 text-blue-900 border-blue-200">
              {profile.startupCode}
            </Badge>
          )}
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSave} className="space-y-6">
          {statusMessage && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 text-sm border ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-red-50 text-red-800 border-red-200"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">General Venture Information</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">
                    Official incubation registration details for Bennett Hatchery records.
                  </CardDescription>
                </div>
                <Building2 className="h-6 w-6 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startupCode">Institutional Startup Code</Label>
                  <Input
                    id="startupCode"
                    value={profile?.startupCode || ""}
                    disabled
                    className="bg-slate-50 font-mono font-medium text-slate-600 border-slate-200"
                  />
                  <p className="text-[11px] text-slate-400">System generated, immutable identifier.</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="name">Startup Name *</Label>
                  <Input
                    id="name"
                    value={profile?.name || ""}
                    onChange={(e) => setProfile((p) => p && { ...p, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="founderName">Primary Founder Name *</Label>
                  <Input
                    id="founderName"
                    value={profile?.founderName || ""}
                    onChange={(e) => setProfile((p) => p && { ...p, founderName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Official Email</Label>
                  <Input id="email" value={profile?.email || ""} disabled className="bg-slate-50 text-slate-600" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="contactNumber">Contact Phone Number *</Label>
                  <Input
                    id="contactNumber"
                    value={profile?.contactNumber || ""}
                    onChange={(e) => setProfile((p) => p && { ...p, contactNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="website">Website / Domain URL</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profile?.website || ""}
                    onChange={(e) => setProfile((p) => p && { ...p, website: e.target.value })}
                    placeholder="https://yourstartup.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="industry">Industry / Sector *</Label>
                  <Select
                    value={profile?.industry || ""}
                    onValueChange={(val) => setProfile((p) => p && { ...p, industry: val ?? p.industry })}
                  >
                    <SelectTrigger id="industry">
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
                  <Label htmlFor="startupStage">Incubation Stage *</Label>
                  <Select
                    value={profile?.startupStage || ""}
                    onValueChange={(val) => setProfile((p) => p && { ...p, startupStage: val ?? p.startupStage })}
                  >
                    <SelectTrigger id="startupStage">
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
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="description">Startup Executive Summary *</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={profile?.description || ""}
                  onChange={(e) => setProfile((p) => p && { ...p, description: e.target.value })}
                  placeholder="Summarize your company's core mission and business model..."
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="productDescription">Technical Product / Innovation Description *</Label>
                <Textarea
                  id="productDescription"
                  rows={3}
                  value={profile?.productDescription || ""}
                  onChange={(e) => setProfile((p) => p && { ...p, productDescription: e.target.value })}
                  placeholder="Detail your proprietary technology, software, hardware, or algorithmic innovation..."
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t border-slate-100 pt-4">
              <Button type="submit" disabled={saving} className="bg-blue-900 hover:bg-blue-800 text-white">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
}

