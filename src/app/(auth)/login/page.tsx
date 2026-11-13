"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-4 sm:p-6">
      <div className="mb-6 text-center">
        <div className="h-12 w-12 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-3 shadow-md">
          BH
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Bennett Hatchery IPMS
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Centre for Innovation & Entrepreneurship • Bennett University
        </p>
      </div>

      <Card className="max-w-md w-full border-slate-200 shadow-md bg-white">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-slate-900">Institutional Sign In</CardTitle>
            <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-900 text-xs">
              Secure RBAC
            </Badge>
          </div>
          <CardDescription className="text-slate-500 text-xs">
            Enter your authorized institutional email and password to access your role workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Official Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com or admin@bennett.edu.in"
                required
                className="border-slate-200"
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-xs text-slate-400">Argon2id Encrypted</span>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="border-slate-200"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 hover:bg-blue-800 text-white shadow-sm mt-2"
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
        <CardFooter className="flex flex-col space-y-3 border-t border-slate-100 pt-4 text-xs text-slate-500 text-center">
          <p>
            No public self-registration. New accounts are provisioned exclusively by Bennett Hatchery administration.
          </p>
          <Link href="/" className="inline-flex items-center text-blue-900 hover:underline">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Return to Homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
