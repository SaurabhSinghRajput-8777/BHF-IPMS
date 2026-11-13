import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { HomeNavbarAuthAction } from "@/components/HomeNavbarAuthAction";

export default function HomePage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-900">

      {/* ── Background Video ───────────────────────────────────────────── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2070&auto=format&fit=crop"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient overlays for readability */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

      {/* ── Navbar (floats over video) ─────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 sm:px-10 h-28 sm:h-36">
        {/* Logo */}
        <Link href="/" className="flex items-center group">
          <Image
            src="/logo.png"
            alt="IPMS Logo"
            width={180}
            height={180}
            className="h-[140px] w-[140px] sm:h-[180px] sm:w-[180px] object-contain"
            priority
          />
        </Link>

        {/* Actions */}
        <div className="flex items-center">
          <HomeNavbarAuthAction />
        </div>
      </header>

      {/* ── Main Content (centered in viewport) ───────────────────────── */}
      <main className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
        {/* Eyebrow label */}
        <p className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-white/80 uppercase mb-5 sm:mb-6 font-[family-name:var(--font-aldrich)]">
          Centre for Innovation &amp; Entrepreneurship · Bennett University
        </p>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight text-white leading-[1.12] font-[family-name:var(--font-bruno)]">
          Intellectual Property
          <br />
          <span className="font-light text-white/80">Management System</span>
        </h1>

        {/* Single CTA */}
        <div className="mt-8 sm:mt-10">
          <Link
            href="/apply"
            className="group inline-flex items-center p-1.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl shadow-indigo-950/30 transition-all duration-300 hover:bg-white/15 hover:border-white/30"
          >
            <span className="text-base sm:text-lg font-semibold text-white px-6 sm:px-8 py-2.5 sm:py-3 tracking-[0.05em] font-[family-name:var(--font-aldrich)]">
              Begin Startup IP Assessment
            </span>
            <span className="self-stretch flex items-center justify-center px-4 sm:px-5 rounded-xl bg-white/15 backdrop-blur-sm transition-colors group-hover:bg-white/25">
              <ArrowRight className="h-5 w-5 text-white group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

      </main>

      {/* ── Stats (bottom-right, floating) ────────────────────────────── */}
      <div className="absolute bottom-8 right-8 sm:bottom-10 sm:right-10 z-10 hidden sm:flex items-end space-x-10 font-[family-name:var(--font-aldrich)]">
        <div className="text-right">
          <div className="text-3xl sm:text-[36px] font-normal text-white tracking-tight leading-none">
            50+
          </div>
          <p className="text-[11px] text-white/50 mt-1.5 leading-snug">
            Startups assessed
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl sm:text-[36px] font-normal text-white tracking-tight leading-none">
            120+
          </div>
          <p className="text-[11px] text-white/50 mt-1.5 leading-snug">
            IP filings tracked
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl sm:text-[36px] font-normal text-white tracking-tight leading-none">
            3
          </div>
          <p className="text-[11px] text-white/50 mt-1.5 leading-snug">
            Expert reviewers
          </p>
        </div>
      </div>

    </div>
  );
}
