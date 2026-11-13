import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">

      {/* ── 1. Navbar ───────────────────────────────────────────────────── */}
      <header className="w-full flex items-center justify-between px-6 sm:px-10 h-16 sm:h-[68px]">
        {/* Logo + wordmark */}
        <Link href="/" className="flex items-center space-x-2.5 group">
          <Image
            src="/logo.png"
            alt="IPMS Logo"
            width={40}
            height={40}
            className="h-9 w-9 sm:h-10 sm:w-10 object-contain rounded-xl"
            priority
          />
          <span className="font-bold text-[22px] text-[#0f172a] tracking-tight">
            IPMS
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center space-x-9 text-[13.5px] font-medium text-slate-500">
          <Link href="/" className="text-slate-900 font-semibold">
            Home
          </Link>
          <Link href="/about" className="hover:text-slate-900 transition-colors">
            About Us
          </Link>
          <Link href="/features" className="hover:text-slate-900 transition-colors">
            Features
          </Link>
          <Link href="/apply" className="hover:text-slate-900 transition-colors">
            Services
          </Link>
          <Link href="/contact" className="hover:text-slate-900 transition-colors">
            Contact
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-5">
          <Link
            href="/login"
            className="text-[13.5px] font-medium text-slate-600 hover:text-slate-950 transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/apply"
            className="bg-[#10b981] hover:bg-[#059669] active:bg-[#047857] text-white text-[13.5px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm shadow-emerald-200"
          >
            Get in touch
          </Link>
        </div>
      </header>

      {/* ── 2. Hero Card ─────────────────────────────────────────────────── */}
      {/*
        Exact Xurya structure:
        - mx-4 / mx-6 horizontal margin so card doesn't touch edges
        - Large rounded corners (rounded-[28px] sm:rounded-[36px])
        - Video fills the card entirely
        - Dark gradient overlay bottom-left for text contrast
        - Headline bottom-left inside card
        - "Discover" float card top-right inside card
        - Two CTA text links bottom-left inside card
      */}
      <section className="px-4 sm:px-6 pb-0">
        <div
          className="relative w-full overflow-hidden rounded-[28px] sm:rounded-[36px] bg-slate-900"
          style={{ aspectRatio: "16/7", minHeight: 340, maxHeight: 580 }}
        >
          {/* Background video */}
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

          {/* Gradient overlay — strong on bottom-left for text, light on top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

          {/* ── Inside card content ── */}
          <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 lg:p-12">

            {/* Top row: subtle badge top-left + floating "Discover" card top-right */}
            <div className="flex items-start justify-between">
              {/* Badge */}
              <span className="text-[11px] font-semibold tracking-widest text-emerald-300 uppercase opacity-90">
                #1 IP Assessment Platform · Bennett University
              </span>

              {/* Floating "Discover Our Recent Project" card */}
              <div className="hidden lg:flex flex-col overflow-hidden rounded-[20px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl w-[200px] xl:w-[220px] flex-shrink-0 ml-6">
                {/* Thumbnail */}
                <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
                  <Image
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"
                    alt="Discover Our Recent Projects"
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                </div>
                {/* Card footer */}
                <div className="flex items-center justify-between px-4 py-3 bg-black/30 backdrop-blur-sm">
                  <span className="text-[12px] font-medium text-white leading-tight">
                    Discover Our<br />Recent Projects
                  </span>
                  <Link
                    href="/apply"
                    className="flex-shrink-0 h-8 w-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Explore projects"
                  >
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom: Headline + CTA links */}
            <div className="flex flex-col">
              <h1 className="text-3xl sm:text-5xl lg:text-[64px] xl:text-[72px] font-normal tracking-tight text-white leading-[1.07] mb-5 sm:mb-7">
                Intellectual Property<br />
                <span className="font-light text-white/85">Management System</span>
              </h1>

              {/* Two text CTAs à la Xurya */}
              <div className="flex items-center space-x-6">
                <Link
                  href="/apply"
                  className="group flex items-center space-x-1.5 text-[13px] sm:text-sm font-medium text-white hover:text-emerald-300 transition-colors border-b border-white/40 hover:border-emerald-300 pb-0.5"
                >
                  <span>Start Assessment</span>
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
                <Link
                  href="/login"
                  className="group flex items-center space-x-1.5 text-[13px] sm:text-sm font-medium text-white/70 hover:text-white transition-colors border-b border-white/20 hover:border-white/60 pb-0.5"
                >
                  <span>CIE Dashboard</span>
                  <ArrowUpRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Stats Bar (below hero card, right-aligned as in Xurya) ─────── */}
      <section className="px-4 sm:px-6 mt-6 sm:mt-8 flex justify-end">
        <div className="flex items-start space-x-10 sm:space-x-14">
          <div>
            <div className="text-[28px] sm:text-[32px] font-normal text-slate-900 tracking-tight leading-none">
              50+
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 leading-snug max-w-[120px]">
              Startups assessed<br />at Bennett Hatchery
            </p>
          </div>
          <div>
            <div className="text-[28px] sm:text-[32px] font-normal text-slate-900 tracking-tight leading-none">
              120+
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 leading-snug max-w-[120px]">
              IP filings tracked<br />across categories
            </p>
          </div>
          <div>
            <div className="text-[28px] sm:text-[32px] font-normal text-slate-900 tracking-tight leading-none">
              3 CIE
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1.5 leading-snug max-w-[120px]">
              Expert reviewers on<br />every application
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
