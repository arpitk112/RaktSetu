import React from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/translations";

export interface HeaderProps {
  showNavLinks?: boolean;
}

export function Header({ showNavLinks = true }: HeaderProps) {
  const t = getTranslation("en");

  return (
    <header className="w-full bg-white border-b border-[#E0E0E0] sticky top-0 z-40">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 h-[64px] flex items-center justify-between">
        {/* Site Name as plain red text (no logo image, per spec) */}
        <Link
          href="/"
          className="text-[22px] sm:text-[24px] font-extrabold text-[#C62828] tracking-tight hover:opacity-90 transition-opacity"
          aria-label="RaktSetu Home"
        >
          {t.siteName}
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {showNavLinks && (
            <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#4A4A4A]">
              <a
                href="#how-it-works"
                className="hover:text-[#C62828] transition-colors"
              >
                {t.nav.howItWorks}
              </a>
              <Link
                href="/privacy"
                className="hover:text-[#C62828] transition-colors"
              >
                {t.nav.privacy}
              </Link>
            </nav>
          )}

          {/* Call 112 Emergency Button */}
          <a
            href={t.emergencyCallTel}
            className="inline-flex items-center justify-center h-[38px] px-3.5 sm:px-4 text-[13px] sm:text-[14px] font-bold text-[#C62828] bg-white border-2 border-[#C62828] rounded-full hover:bg-[#FFF5F5] active:bg-[#FDECEC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:ring-offset-1"
            aria-label="Emergency call 112"
          >
            {t.emergencyCall}
          </a>
        </div>
      </div>
    </header>
  );
}
