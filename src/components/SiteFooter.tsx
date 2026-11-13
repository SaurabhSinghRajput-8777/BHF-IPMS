"use client";

import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <footer
      className={`z-20 w-full px-6 sm:px-10 py-5 transition-colors overflow-hidden ${
        isHomePage
          ? "fixed bottom-0 left-0 right-0 border-t-0 bg-transparent text-white/50"
          : "relative border-t border-white/10 bg-slate-900/60 backdrop-blur-xl mt-auto"
      }`}
    >
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-[family-name:var(--font-aldrich)]">
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
