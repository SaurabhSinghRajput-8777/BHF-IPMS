import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Container to match exact outer padding */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-20">
        
        {/* Navigation Bar */}
        <header className="h-16 flex items-center justify-between mb-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="h-6 w-6 rounded-md bg-[#10b981] flex items-center justify-center text-white">
              <span className="font-bold text-xs tracking-tighter">✦</span>
            </div>
            <span className="font-bold text-xl text-[#0f172a] tracking-tight">
              Xurya
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-10 text-[13px] font-medium text-slate-600">
            <Link href="/" className="text-slate-950 font-semibold">
              Home
            </Link>
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              About Us
            </Link>
            <Link href="/features" className="hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="/services" className="hover:text-slate-900 transition-colors">
              Services
            </Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-6">
            <Link
              href="/login"
              className="text-[13px] font-medium text-slate-700 hover:text-slate-950 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/apply"
              className="bg-[#10b981] hover:bg-[#059669] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 shadow-sm"
            >
              Get in touch
            </Link>
          </div>
        </header>

        {/* Hero Section Container */}
        <main className="relative">
          {/* The Hero Banner Card */}
          <div className="relative w-full h-[620px] rounded-[36px] overflow-hidden bg-slate-900 shadow-sm">
            {/* Background Landscape Photo (Wind turbines in grassy landscape at dusk/golden hour) */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=2070&auto=format&fit=crop')",
              }}
            />
            {/* Subtle Gradient Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Content inside Hero Card */}
            <div className="relative z-10 h-full flex flex-col justify-between p-10 sm:p-14 lg:p-16">
              
              {/* Top Subtitle */}
              <div className="text-[13px] sm:text-sm font-normal text-white/90 tracking-wide">
                #1 Energy provider in the world
              </div>

              {/* Main Headline */}
              <div className="max-w-2xl my-auto">
                <h1 className="text-5xl sm:text-7xl lg:text-[82px] font-normal tracking-tight text-white leading-[1.04]">
                  New Energy <br />
                  <span className="font-light text-white/95">for the Future</span>
                </h1>

                {/* Sub-links */}
                <div className="mt-10 flex items-center space-x-8 text-sm font-medium text-white">
                  <Link
                    href="/apply"
                    className="inline-flex items-center space-x-1.5 hover:text-emerald-400 transition-colors border-b border-white/50 pb-0.5"
                  >
                    <span>Get in touch</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/services"
                    className="inline-flex items-center space-x-1.5 hover:text-emerald-400 transition-colors border-b border-white/50 pb-0.5"
                  >
                    <span>Our services</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Floating Frosted Glass Project Widget (Top Right) */}
              <div className="absolute top-10 right-10 sm:top-14 sm:right-14 hidden md:flex flex-col w-[260px] rounded-3xl p-4 bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xl">
                {/* Wind turbine thumbnail */}
                <div
                  className="w-full h-36 rounded-2xl bg-cover bg-center mb-4 shadow-inner"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=800&auto=format&fit=crop')",
                  }}
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[13px] font-medium leading-snug max-w-[170px] text-white/95">
                    Discover Our Recent Project
                  </span>
                  <Link
                    href="/services"
                    className="h-8 w-8 rounded-full bg-white/25 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Right Inset Cutout for Statistics (Matches the geometric negative space shape) */}
            <div className="absolute bottom-0 right-0 hidden lg:block bg-white rounded-tl-[36px] pl-10 pt-8 pb-0 pr-0 z-20">
              {/* Inverse rounded corner masks */}
              <div className="absolute -top-[36px] right-0 w-[36px] h-[36px] bg-transparent pointer-events-none shadow-[16px_16px_0_0_#ffffff]" />
              <div className="absolute bottom-0 -left-[36px] w-[36px] h-[36px] bg-transparent pointer-events-none shadow-[16px_16px_0_0_#ffffff]" />

              {/* 3 Metrics Grid */}
              <div className="flex items-start space-x-14 pr-12 pb-2">
                <div>
                  <div className="text-4xl font-normal text-slate-900 tracking-tight">
                    6 mil
                  </div>
                  <p className="text-[12px] text-slate-500 mt-2 leading-snug max-w-[130px]">
                    The company&apos;s annual net income
                  </p>
                </div>

                <div>
                  <div className="text-4xl font-normal text-slate-900 tracking-tight">
                    315
                  </div>
                  <p className="text-[12px] text-slate-500 mt-2 leading-snug max-w-[130px]">
                    Projects completed worldwide
                  </p>
                </div>

                <div>
                  <div className="text-4xl font-normal text-slate-900 tracking-tight">
                    120K
                  </div>
                  <p className="text-[12px] text-slate-500 mt-2 leading-snug max-w-[130px]">
                    Employees work in all parts of the world
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Stats Bar (Shows cleanly below hero on smaller screens) */}
          <div className="lg:hidden mt-6 grid grid-cols-3 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div>
              <div className="text-2xl sm:text-3xl font-normal text-slate-900">6 mil</div>
              <p className="text-[11px] text-slate-500 mt-1">The company&apos;s annual net income</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-normal text-slate-900">315</div>
              <p className="text-[11px] text-slate-500 mt-1">Projects completed worldwide</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-normal text-slate-900">120K</div>
              <p className="text-[11px] text-slate-500 mt-1">Employees work in all parts of the world</p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
