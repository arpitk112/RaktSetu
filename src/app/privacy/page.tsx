import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Header />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#C62828] hover:underline"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="max-w-[720px]">
          <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[#1F1F1F] mb-4">
            Privacy Policy
          </h1>
          <p className="text-[16px] text-[#4A4A4A] mb-8 leading-relaxed">
            RaktSetu is a free public-benefit platform built to connect people in critical need of blood with blood banks and willing donors across India.
          </p>

          <div className="space-y-6 text-[15px] text-[#4A4A4A] leading-relaxed">
            <section className="p-5 rounded-[16px] border border-[#E0E0E0] bg-[#F7F7F7]">
              <h2 className="text-[18px] font-bold text-[#1F1F1F] mb-2">
                1. Donor Privacy Comes First
              </h2>
              <p>
                A donor&apos;s phone number is <strong>never displayed publicly</strong> on any open directory or search listing. We only contact registered donors through automated messages to ask: <em>&quot;Are you available to donate?&quot;</em>
              </p>
            </section>

            <section className="p-5 rounded-[16px] border border-[#E0E0E0] bg-[#F7F7F7]">
              <h2 className="text-[18px] font-bold text-[#1F1F1F] mb-2">
                2. Contact Sharing Only After &quot;YES&quot;
              </h2>
              <p>
                Only if a donor replies with <strong>YES</strong> to an urgent request will their contact details be shared directly with the patient&apos;s family for a limited 24-hour window.
              </p>
            </section>

            <section className="p-5 rounded-[16px] border border-[#E0E0E0] bg-[#F7F7F7]">
              <h2 className="text-[18px] font-bold text-[#1F1F1F] mb-2">
                3. Total Control &amp; Data Deletion
              </h2>
              <p>
                Donors can pause or delete their profile at any time simply by texting <strong>STOP</strong> to the bot or managing their profile.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
