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
    <div className="relative min-h-screen flex flex-col justify-center items-center bg-slate-950 p-4 sm:p-6 overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-950/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 mb-6 text-center">
        <Link href="/" className="inline-block group mb-3">
          <Image
            src="/logo.png"
            alt="IPMS Logo"
            width={120}
            height={120}
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain mx-auto transition-transform group-hover:scale-105"
            priority
          />
        </Link>
        <p className="text-[11px] font-semibold tracking-[0.25em] text-white/50 uppercase font-[family-name:var(--font-aldrich)]">
          Centre for Innovation &amp; Entrepreneurship
        </p>
        <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight mt-1 font-[family-name:var(--font-bruno)]">
          Institutional Sign In
        </h1>
      </div>

      <Card className="relative z-10 max-w-md w-full border-white/15 bg-white/[0.04] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-2xl">
        <CardHeader className="space-y-1.5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-white tracking-wide font-[family-name:var(--font-aldrich)]">
              Secure Terminal
            </CardTitle>
            <Badge variant="outline" className="border-white/20 bg-white/10 text-white/90 text-[11px] font-[family-name:var(--font-aldrich)]">
              RBAC PROTECTED
            </Badge>
          </div>
          <CardDescription className="text-white/60 text-xs">
            Authenticate using your authorized institutional credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-white/80 font-medium">Official Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com or admin@bennett.edu.in"
                required
                className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/40 h-10 rounded-xl"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs text-white/80 font-medium">Password</Label>
                <span className="text-[11px] text-white/40 font-[family-name:var(--font-aldrich)]">Argon2id Encrypted</span>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="bg-white/[0.06] border-white/15 text-white placeholder:text-white/30 focus-visible:ring-white/30 focus-visible:border-white/40 h-10 rounded-xl"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-950 hover:bg-white/90 active:bg-white/80 font-semibold tracking-[0.05em] h-10 rounded-xl shadow-lg shadow-black/50 mt-2 font-[family-name:var(--font-aldrich)]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Sign In
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 border-t border-white/10 pt-4 text-xs text-white/50 text-center">
          <p className="text-[11px] leading-relaxed">
            No public self-registration. Credentials are provisioned exclusively by Bennett Hatchery administration.
          </p>
          <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Return to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
