import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-[#111827] font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900 flex flex-col p-3 sm:p-5">
      
      {/* 1. Header Bar */}
      <header className="h-14 sm:h-16 w-full flex items-center justify-between px-2 sm:px-4 shrink-0 mb-2">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <Image
            src="/logo.png"
            alt="IPMS Logo"
            width={48}
            height={48}
            className="h-10 w-10 sm:h-11 sm:w-11 object-contain rounded-xl"
            priority
          />
          <span className="font-bold text-2xl text-[#0f172a] tracking-tight">
            IPMS
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
        <div className="flex items-center space-x-5">
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

      {/* 2. Hero Section: Full Remaining Screen Height (100vh flex-1) */}
      <main className="relative flex-1 w-full min-h-0">
        <div className="relative w-full h-full rounded-[32px] sm:rounded-[36px] overflow-hidden bg-slate-900 shadow-sm">
          {/* Background Video */}
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
          {/* Subtle Gradient Overlays for Readability */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          {/* Centered Content */}
          <div className="relative z-10 h-full flex flex-col justify-between items-center text-center p-6 sm:p-10 lg:p-12">
            
            {/* Top Subtitle */}
            <div className="text-[11px] sm:text-xs font-semibold tracking-widest text-emerald-300 uppercase mt-2">
              Centre for Innovation &amp; Entrepreneurship • Bennett University
            </div>

            {/* Main Headline & Centered Single CTA */}
            <div className="max-w-4xl my-auto flex flex-col items-center">
              <h1 className="text-3xl sm:text-6xl lg:text-[76px] font-normal tracking-tight text-white leading-[1.08]">
                Intellectual Property <br />
                <span className="font-light text-white/90">Management System</span>
              </h1>
              
              <p className="mt-4 sm:mt-6 text-xs sm:text-base text-slate-200/90 max-w-2xl font-light leading-relaxed px-4">
                Evaluate, protect, and scale your venture&apos;s patents, trademarks, and copyrights through Bennett Hatchery&apos;s institutional evaluation framework.
              </p>

              {/* Single Center CTA Button for Startup */}
              <div className="mt-6 sm:mt-8 flex justify-center">
                <Link
                  href="/apply"
                  className="group bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-base font-semibold px-7 sm:px-9 py-3 sm:py-3.5 rounded-full shadow-lg shadow-emerald-950/40 transition-all duration-200 flex items-center space-x-2"
                >
                  <span>Start Startup IP Assessment</span>
                  <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Bottom Sub-label */}
            <div className="text-[11px] text-white/60 tracking-wide mb-1">
              Direct Startup Onboarding • No Account Required
            </div>
          </div>

          {/* Bottom Right Inset Cutout for Statistics */}
          <div className="absolute bottom-0 right-0 hidden lg:block bg-white rounded-tl-[36px] pl-10 pt-7 pb-0 pr-0 z-20">
            {/* Inverse rounded corner masks */}
            <div className="absolute -top-[36px] right-0 w-[36px] h-[36px] bg-transparent pointer-events-none shadow-[16px_16px_0_0_#ffffff]" />
            <div className="absolute bottom-0 -left-[36px] w-[36px] h-[36px] bg-transparent pointer-events-none shadow-[16px_16px_0_0_#ffffff]" />

            {/* 3 Metrics Grid */}
            <div className="flex items-start space-x-12 pr-10 pb-2">
              <div>
                <div className="text-3xl font-normal text-slate-900 tracking-tight">
                  6 mil
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug max-w-[120px]">
                  The company&apos;s annual net income
                </p>
              </div>

              <div>
                <div className="text-3xl font-normal text-slate-900 tracking-tight">
                  315
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug max-w-[120px]">
                  Projects completed worldwide
                </p>
              </div>

              <div>
                <div className="text-3xl font-normal text-slate-900 tracking-tight">
                  120K
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug max-w-[120px]">
                  Employees work in all parts of the world
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
