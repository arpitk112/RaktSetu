import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getTranslation } from "@/lib/translations";

export default function HomePage() {
  const t = getTranslation("en");

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      {/* Slim Header */}
      <Header />

      {/* Main Content: Max 1120px, fluid padding */}
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16 flex flex-col justify-start">
        {/* Hero Section */}
        <div className="max-w-[760px] mb-8 sm:mb-12">
          {/* Eyebrow */}
          <p className="text-[12px] sm:text-[13px] font-bold tracking-wider text-[#C62828] uppercase mb-2">
            {t.home.eyebrow}
          </p>

          {/* Headline: 40px mobile, 60px desktop */}
          <h1 className="text-[40px] sm:text-[50px] md:text-[60px] font-extrabold text-[#1F1F1F] tracking-tight leading-[1.08] mb-4">
            {t.tagline}
          </h1>

          {/* Supporting sentence */}
          <p className="text-[16px] sm:text-[18px] text-[#4A4A4A] leading-relaxed">
            {t.subTagline}
          </p>
        </div>

        {/* Two Large Cards: Stacked on mobile (<640px), Side by Side on desktop (>=640px) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12 sm:mb-16">
          {/* 🔴 Card 1: I need blood (Solid Red, Most Prominent) */}
          <div className="bg-[#C62828] text-white rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 flex flex-col justify-between shadow-sm min-h-[290px] sm:min-h-[320px]">
            <div>
              {/* Icon / Circular Badge */}
              <div
                className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-5"
                aria-hidden="true"
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>

              {/* Title: 26px mobile, 32px desktop */}
              <h2 className="text-[26px] sm:text-[32px] font-extrabold text-white leading-tight mb-2">
                {t.home.needBloodTitle}
              </h2>

              {/* Description */}
              <p className="text-[15px] sm:text-[16px] text-white/90 leading-normal">
                {t.home.needBloodDesc}
              </p>
            </div>

            {/* CTA Button: 52px high, 12px radius, white background, bold red text */}
            <div className="pt-6">
              <Link
                href="/need-blood?reset=1"
                className="w-full h-[52px] bg-white text-[#C62828] font-bold text-[16px] rounded-[12px] flex items-center justify-center hover:bg-[#FFF5F5] active:bg-[#FDECEC] transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#C62828]"
              >
                {t.home.needBloodCta}
              </Link>
            </div>
          </div>

          {/* ⚪ Card 2: I want to donate (White with Red 2px border) */}
          <div className="bg-white border-2 border-[#C62828] text-[#1F1F1F] rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 flex flex-col justify-between min-h-[290px] sm:min-h-[320px]">
            <div>
              {/* Icon / Circular Badge */}
              <div
                className="w-12 h-12 rounded-full bg-[#FFF5F5] border border-[#FDECEC] flex items-center justify-center mb-5"
                aria-hidden="true"
              >
                <svg
                  className="w-6 h-6 text-[#C62828]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>

              {/* Title: 26px mobile, 32px desktop */}
              <h2 className="text-[26px] sm:text-[32px] font-extrabold text-[#C62828] leading-tight mb-2">
                {t.home.donateTitle}
              </h2>

              {/* Description */}
              <p className="text-[15px] sm:text-[16px] text-[#4A4A4A] leading-normal">
                {t.home.donateDesc}
              </p>
            </div>

            {/* CTA Button: 52px high, 12px radius, white background, 2px red border, red text */}
            <div className="pt-6">
              <Link
                href="/donate"
                className="w-full h-[52px] bg-white text-[#C62828] border-2 border-[#C62828] font-bold text-[16px] rounded-[12px] flex items-center justify-center hover:bg-[#FFF5F5] active:bg-[#FDECEC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:ring-offset-2"
              >
                {t.home.donateCta}
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works Section: 3 Numbered Steps */}
        <section
          id="how-it-works"
          className="border-t border-[#E0E0E0] pt-10 pb-4"
          aria-labelledby="how-it-works-heading"
        >
          <h2
            id="how-it-works-heading"
            className="text-[20px] sm:text-[24px] font-bold text-[#1F1F1F] mb-6 sm:mb-8"
          >
            How it works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-full bg-[#C62828] text-white font-bold text-[15px] flex items-center justify-center shrink-0 mt-0.5"
                aria-hidden="true"
              >
                1
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-[#1F1F1F] mb-1">
                  {t.home.steps.step1Title}
                </h3>
                <p className="text-[14px] text-[#5F5F5F] leading-normal">
                  {t.home.steps.step1Desc}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-full bg-[#C62828] text-white font-bold text-[15px] flex items-center justify-center shrink-0 mt-0.5"
                aria-hidden="true"
              >
                2
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-[#1F1F1F] mb-1">
                  {t.home.steps.step2Title}
                </h3>
                <p className="text-[14px] text-[#5F5F5F] leading-normal">
                  {t.home.steps.step2Desc}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div
                className="w-8 h-8 rounded-full bg-[#C62828] text-white font-bold text-[15px] flex items-center justify-center shrink-0 mt-0.5"
                aria-hidden="true"
              >
                3
              </div>
              <div>
                <h3 className="font-bold text-[16px] text-[#1F1F1F] mb-1">
                  {t.home.steps.step3Title}
                </h3>
                <p className="text-[14px] text-[#5F5F5F] leading-normal">
                  {t.home.steps.step3Desc}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
