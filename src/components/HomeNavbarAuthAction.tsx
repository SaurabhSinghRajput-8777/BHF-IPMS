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
      <div className="h-11 w-36 rounded-2xl bg-white/10 animate-pulse border border-white/20 p-1" />
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
        className="group inline-flex items-center p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:bg-white/15 hover:border-white/30 cursor-pointer"
      >
        <span className="text-[13px] sm:text-sm font-semibold text-white px-4 py-1.5 tracking-[0.05em] font-[family-name:var(--font-aldrich)]">
          Go to Dashboard
        </span>
        <span className="self-stretch flex items-center justify-center px-2.5 rounded-xl bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-white/25">
          <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="group inline-flex items-center p-1 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-lg shadow-indigo-950/30 transition-all duration-300 hover:bg-white/15 hover:border-white/30 cursor-pointer"
    >
      <span className="text-[13px] sm:text-sm font-semibold text-white px-4 py-1.5 tracking-[0.05em] font-[family-name:var(--font-aldrich)]">
        CIE Team Login
      </span>
      <span className="self-stretch flex items-center justify-center px-2.5 rounded-xl bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-white/25">
        <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}

