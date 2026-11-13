"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Lock, Loader2, AlertCircle } from "lucide-react";
import { ApiResponse, AuthUserContext } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: ApiResponse<AuthUserContext> = await res.json();

      if (!res.ok || !data.success || !data.data) {
        setError(data.error?.message || "Invalid login credentials. Please try again.");
        setLoading(false);
        return;
      }

      // Role-based routing upon successful authentication
      const user = data.data;
      if (user.role === "STARTUP") {
        router.push("/startup/dashboard");
      } else if (user.role === "REVIEWER") {
        router.push("/cie/reviewer/dashboard");
      } else if (user.role === "CIE_ADMIN") {
        router.push("/cie/dashboard");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-950 p-4 sm:p-8 overflow-hidden selection:bg-slate-800 selection:text-white">
      {/* Background Video / Atmosphere */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-40"
        poster="https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2070&auto=format&fit=crop"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Deep gradient overlays */}
      <div className="absolute inset-0 bg-slate-950/85 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950/80 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-950/30 blur-[130px] rounded-full pointer-events-none" />

      {/* Top Header Bar */}
      <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 h-24 sm:h-28 flex items-center justify-between z-20">
        <Link
          href="/"
          className="text-white/70 hover:text-white transition-colors p-2.5 hover:bg-white/10 rounded-xl border border-white/10 flex items-center gap-2 text-sm font-[family-name:var(--font-aldrich)] cursor-pointer backdrop-blur-md bg-white/[0.03]"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to Portal</span>
        </Link>

        {/* Logo in top right corner */}
        <Link href="/" className="inline-block group">
          <Image
            src="/logo.png"
            alt="IPMS Logo"
            width={160}
            height={160}
            className="h-14 w-14 sm:h-20 sm:w-20 object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
            priority
          />
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="mb-6 text-center max-w-md">
          <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/60 uppercase font-[family-name:var(--font-aldrich)]">
            Bennett Hatchery · CIE
          </p>
          <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-wide mt-2 font-[family-name:var(--font-bruno)]">
            Institutional Sign In
          </h1>
          <p className="text-sm text-white/50 mt-1">
            Authorized portal for CIE reviewers, mentors &amp; administrators
          </p>
        </div>

        <Card className="w-full border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-3xl p-6 sm:p-7 gap-6">
        <CardHeader className="p-0 space-y-1.5 pb-5 border-b border-white/10">
          <CardTitle className="text-lg font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
            Secure Terminal
          </CardTitle>
          <CardDescription className="text-white/60 text-sm">
            Authenticate using your authorized institutional credentials.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-2xl text-sm text-red-300 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-white/90 font-[family-name:var(--font-aldrich)]">
                Official Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com or admin@bennett.edu.in"
                required
                className="bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/40 h-12 text-base rounded-xl px-4"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-white/90 font-[family-name:var(--font-aldrich)]">
                  Password
                </Label>
                <span className="text-xs text-white/40 font-[family-name:var(--font-aldrich)]">Argon2id Encrypted</span>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-white/[0.05] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/40 h-12 text-base rounded-xl px-4"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-950 hover:bg-white/90 active:bg-white/80 font-semibold tracking-[0.05em] h-12 text-base rounded-xl shadow-lg shadow-black/50 font-[family-name:var(--font-aldrich)] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" /> Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <div className="border-t border-white/10 pt-5 text-center">
          <p className="text-xs leading-relaxed text-white/50">
            No public self-registration. Credentials are provisioned exclusively by Bennett Hatchery administration.
          </p>
        </div>
      </Card>
      </div>
    </div>
  );
}
