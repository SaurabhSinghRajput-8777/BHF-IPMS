import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Container to match exact outer padding */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-12 pt-6 pb-20">
        
        {/* Navigation Bar */}
        <header className="h-16 flex items-center justify-between mb-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <Image
              src="/logo.png"
              alt="IPMS Logo"
              width={48}
              height={48}
              className="h-11 w-11 object-contain rounded-xl"
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
            {/* Subtle Gradient Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

            {/* Content inside Hero Card - Centered Layout */}
            <div className="relative z-10 h-full flex flex-col justify-between items-center text-center p-8 sm:p-12 lg:p-16">
              
              {/* Top Subtitle */}
              <div className="text-xs sm:text-sm font-medium tracking-widest text-emerald-300 uppercase">
                Centre for Innovation &amp; Entrepreneurship • Bennett University
              </div>

              {/* Main Headline & Centered Single CTA */}
              <div className="max-w-4xl my-auto flex flex-col items-center">
                <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-normal tracking-tight text-white leading-[1.08]">
                  Intellectual Property <br />
                  <span className="font-light text-white/90">Management System</span>
                </h1>
                
                <p className="mt-6 text-sm sm:text-base text-slate-200/90 max-w-2xl font-light leading-relaxed">
                  Evaluate, protect, and scale your venture&apos;s patents, trademarks, and copyrights through Bennett Hatchery&apos;s institutional evaluation framework.
                </p>

                {/* Single Center CTA Button for Startup */}
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/apply"
                    className="group bg-[#10b981] hover:bg-[#059669] text-white text-sm sm:text-base font-semibold px-8 py-3.5 rounded-full shadow-lg shadow-emerald-950/30 transition-all duration-200 flex items-center space-x-2"
                  >
                    <span>Start Startup IP Assessment</span>
                    <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Bottom Spacer / Sub-label */}
              <div className="text-[11px] text-white/60 tracking-wide">
                Direct Startup Onboarding • No Account Required
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
