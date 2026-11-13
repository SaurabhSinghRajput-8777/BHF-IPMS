"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, LayoutDashboard, LogIn } from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  role: string;
}

export function HomeNavbarAuthAction() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/v1/auth/me");
        const json = await res.json();
        if (json.success && json.data) {
          setUser(json.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse border border-white/20" />
    );
  }

  if (user) {
    const dashboardHref =
      user.role === "STARTUP"
        ? "/startup/dashboard"
        : user.role === "REVIEWER"
        ? "/cie/reviewer/queue"
        : "/cie/dashboard";

    return (
      <Link
        href={dashboardHref}
        className="inline-flex items-center space-x-2 bg-white text-slate-950 hover:bg-white/90 active:bg-white/80 border border-white shadow-lg shadow-white/10 text-[13.5px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 tracking-[0.05em] font-[family-name:var(--font-aldrich)] cursor-pointer"
      >
        <LayoutDashboard className="h-4 w-4" />
        <span>Go to Dashboard</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/30 backdrop-blur-md text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 tracking-[0.05em] font-[family-name:var(--font-aldrich)] cursor-pointer"
    >
      <LogIn className="h-3.5 w-3.5" />
      <span>CIE Team Login</span>
    </Link>
  );
}
