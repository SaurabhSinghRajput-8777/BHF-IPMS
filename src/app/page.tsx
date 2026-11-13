import Link from "next/link";
import {
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Headphones,
  Award,
  Layers,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] text-[#1c1917] antialiased selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* 1. Ultra-clean Header (Matching Xurya Brand Header) */}
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Mark: Green 4-dot / leaf cluster + Bold Name */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="h-8 w-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-sm tracking-tight">BH</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-stone-900 tracking-tight leading-none">
                Bennett IPMS
              </span>
              <span className="text-[10px] text-stone-400 font-medium tracking-wide uppercase mt-0.5">
                CIE • Bennett University
              </span>
            </div>
          </Link>

          {/* Centered Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-stone-600">
            <Link href="/" className="text-stone-950 hover:text-emerald-700 transition-colors">
              Home
            </Link>
            <a href="#about" className="hover:text-emerald-700 transition-colors">
              About CIE
            </a>
            <a href="#categories" className="hover:text-emerald-700 transition-colors">
              IP Categories
            </a>
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              Assessment Pillars
            </a>
            <a href="#contact" className="hover:text-emerald-700 transition-colors">
              Contact
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors px-2 py-1"
            >
              Log in
            </Link>
            <Link
              href="/apply"
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm hover:shadow-emerald-500/20 transition-all flex items-center group"
            >
              <span>Get in touch</span>
              <ArrowUpRight className="ml-1 h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Large Rounded Container & Landscape Placeholder Image */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-16 space-y-20">
        <section className="relative">
          {/* Main Hero Card with Curved Asymmetrical Bottom-Right Cutout */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-stone-900 min-h-[540px] sm:min-h-[580px] text-white shadow-xl flex flex-col justify-between p-8 sm:p-14 border border-stone-800">
            {/* Background Landscape Hero Image with Soft Cinematic Gradient Overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center brightness-[0.62] contrast-[1.08] transition-transform duration-1000 scale-[1.01]"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1509391365360-2e959784a276?q=80&w=2072&auto=format&fit=crop')",
              }}
            />
            {/* Subtle Gradient Veil for Perfect Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-stone-950/40" />

            {/* Top Subtitle */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium tracking-wide text-stone-200/90">
                #1 University Incubation IP Gateway in India
              </span>
            </div>

            {/* Central Giant Typography */}
            <div className="relative z-10 max-w-2xl my-auto py-8">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-[1.08] text-white">
                New IP for <br />
                <span className="font-normal">the Future</span>
              </h1>

              {/* Action Link Anchors below Title */}
              <div className="mt-8 flex items-center space-x-6 text-xs sm:text-sm font-medium">
                <Link
                  href="/apply"
                  className="inline-flex items-center space-x-1 text-white hover:text-emerald-400 transition-colors border-b border-white/40 pb-0.5"
                >
                  <span>Get in touch</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#categories"
                  className="inline-flex items-center space-x-1 text-stone-300 hover:text-white transition-colors border-b border-stone-400/40 pb-0.5"
                >
                  <span>Our evaluation services</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Floating Glassmorphic Project Card (Top Right, exactly as in reference image) */}
            <div className="absolute top-8 right-8 z-20 hidden md:flex flex-col w-60 rounded-2xl p-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white">
              <div
                className="h-32 w-full rounded-xl mb-3 bg-stone-800 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1000&auto=format&fit=crop')",
                }}
              />
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-medium text-stone-200">
                  Discover Our Recent Evaluated Ventures
                </span>
                <Link
                  href="/apply"
                  className="h-6 w-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-emerald-500 transition-colors"
                >
                  <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                </Link>
              </div>
            </div>

            {/* Bottom Floating Stats Bar (Snapping on the right corner, matching image) */}
            <div className="relative z-10 w-full flex flex-col md:flex-row justify-end items-end pt-4">
              <div className="bg-white text-stone-900 rounded-3xl p-6 sm:p-7 shadow-xl flex items-center space-x-8 sm:space-x-12 border border-stone-100">
                <div>
                  <div className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
                    6 mil <span className="text-emerald-600 font-normal">+</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 max-w-[120px] leading-tight">
                    Incubation venture valuation pipeline
                  </p>
                </div>
                <div className="border-l border-stone-100 pl-8">
                  <div className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
                    315
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 max-w-[120px] leading-tight">
                    Patents &amp; IP filings evaluated worldwide
                  </p>
                </div>
                <div className="border-l border-stone-100 pl-8">
                  <div className="text-2xl sm:text-3xl font-light text-stone-900 tracking-tight">
                    120K
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5 max-w-[120px] leading-tight">
                    Students &amp; founders in our network
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Section: "Focusing on quality, we maintain customer trust" (Dual-tone heading) */}
        <section id="about" className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-6">
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-900 leading-snug">
                Focusing on quality, <span className="text-stone-400 font-light">we</span> <br />
                <span className="text-stone-400 font-light">maintain customer trust</span>
              </h2>
            </div>
            <div className="md:col-span-6 text-sm text-stone-500 leading-relaxed font-normal">
              We ensure that every incubated venture we assess undergoes strict institutional review
              and expert auditing. Sustainable legal and intellectual property solutions for an
              environmentally friendly, high-tech, and commercially defensible future.
            </div>
          </div>

          {/* Pill Logo Showcase (Matching circular/pill partners from reference) */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center">
            {[
              { name: "Patents India", label: "Indian Patent Office" },
              { name: "WIPO Global", label: "WIPO Geneva" },
              { name: "CIE Incubator", label: "Bennett CIE" },
              { name: "Times Group", label: "Times of India" },
              { name: "Startup India", label: "DPIIT Certified" },
            ].map((partner, i) => (
              <div
                key={i}
                className="h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-stone-100/80 hover:bg-stone-100 border border-stone-200/60 flex flex-col items-center justify-center p-3 text-center transition-all hover:scale-105"
              >
                <div className="h-3 w-3 rounded-full bg-stone-900 mb-2 opacity-80" />
                <span className="text-xs font-bold text-stone-900 tracking-tight">{partner.name}</span>
                <span className="text-[9px] text-stone-400 leading-tight mt-0.5">{partner.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Section: "We offer quality, with the best materials and service" + 6 Features Grid */}
        <section id="features" className="pt-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-stone-900">
              We offer quality, <span className="text-stone-400 font-light">with the</span> <br />
              <span className="text-stone-400 font-light">best materials and service</span>
            </h2>
          </div>

          {/* Clean 6-Card Grid with Minimalist Green Micro-Icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Layered security",
                desc: "With layered institutional data security, we ensure the safety of every venture disclosure and trade secret.",
              },
              {
                icon: Award,
                title: "Quality control of each part",
                desc: "Every answer and filing date is verified carefully for every asset across Trademark, Patent, and Copyright.",
              },
              {
                icon: Headphones,
                title: "Reliable customer service",
                desc: "Our reviewer and IP cell is available to guide founding teams through institutional review cycles.",
              },
              {
                icon: Layers,
                title: "Applicability isolation",
                desc: "Non-applicable IP types are excluded from calculations, ensuring startups receive truthful readiness ratings.",
              },
              {
                icon: CheckCircle2,
                title: "Annual audit monitoring",
                desc: "Automated schedule tracking alerts teams at 30 days, 7 days, and overdue milestones for scheduled audits.",
              },
              {
                icon: Lock,
                title: "Zero-login onboarding",
                desc: "Direct streamlined intake allows founders to complete assessment forms without account friction.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-7 border border-stone-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-stone-900 tracking-tight mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed font-normal">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Direct Action CTA Card */}
        <section className="bg-stone-900 text-white rounded-[2rem] p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight">
              Ready to evaluate your startup&apos;s <br />
              <span className="font-semibold text-white">intellectual property readiness?</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 max-w-lg mx-auto">
              No account creation needed. Enter your venture details and complete the 21-question
              institutional readiness diagnostic now.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                href="/apply"
                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-emerald-500/25 transition-all inline-flex items-center justify-center"
              >
                <span>Start Direct Assessment</span>
                <ArrowUpRight className="ml-1.5 h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto text-xs font-medium text-stone-300 hover:text-white border border-stone-700 px-6 py-3 rounded-full hover:bg-stone-800 transition-colors"
              >
                CIE Reviewer Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Refined Minimalist Footer */}
      <footer className="w-full bg-white border-t border-stone-200/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              BH
            </div>
            <span>© 2026 Bennett Hatchery IPMS. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-stone-400">
            <span>Bennett University • Times of India Group</span>
            <Link href="/login" className="hover:text-stone-800">
              Staff Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
