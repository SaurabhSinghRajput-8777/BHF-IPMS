"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer
      className={`relative z-20 w-full px-6 sm:px-10 py-5 mt-auto transition-colors ${
        isHomePage
          ? "border-t border-white/5 bg-transparent"
          : "border-t border-white/10 bg-slate-900/60 backdrop-blur-xl"
      }`}
    >
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-[family-name:var(--font-aldrich)]">
        <div>
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
