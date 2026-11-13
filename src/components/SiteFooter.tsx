"use client";

import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="relative z-20 w-full border-t border-white/10 bg-slate-900/60 backdrop-blur-xl py-6 px-6 sm:px-10 mt-auto">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-[family-name:var(--font-aldrich)]">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="Bennett Hatchery"
            width={24}
            height={24}
            className="h-6 w-6 object-contain opacity-70"
          />
          <span>
            © 2026 Bennett University Hatchery · Centre for Innovation &amp; Entrepreneurship
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span>Made by</span>
          <a
            href="https://www.linkedin.com/in/saurabh-singh-bu"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-400 hover:text-sky-300 font-semibold underline underline-offset-4 transition-colors"
          >
            Saurabh Singh
          </a>
        </div>
      </div>
    </footer>
  );
}
