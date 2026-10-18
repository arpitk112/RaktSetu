import React from "react";
import { getTranslation } from "@/lib/translations";

export interface FooterProps {
  showEmergencyNote?: boolean;
}

export function Footer({ showEmergencyNote = true }: FooterProps) {
  const t = getTranslation("en");

  return (
    <footer className="w-full bg-[#F7F7F7] border-t border-[#E0E0E0] mt-auto py-8">
      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 flex flex-col gap-4 text-center">
        {/* Privacy Note */}
        <p className="text-[13px] sm:text-[14px] text-[#4A4A4A] font-medium max-w-[700px] mx-auto">
          {t.privacyNotice}
        </p>

        {/* Emergency Notice */}
        {showEmergencyNote && (
          <p className="text-[12px] sm:text-[13px] text-[#5F5F5F] leading-relaxed max-w-[800px] mx-auto">
            {t.emergencyNotice}
          </p>
        )}

        {/* Brand & Rights */}
        <div className="pt-2 border-t border-[#E0E0E0]/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#5F5F5F]">
          <span>{t.footerRights}</span>
          <span>Emergency hotline: 112</span>
        </div>
      </div>
    </footer>
  );
}
