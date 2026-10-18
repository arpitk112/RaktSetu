"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { BloodRequest } from "@/lib/db";
import { BloodBank } from "@/lib/blood-banks";

function ResultsContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [request, setRequest] = useState<BloodRequest | null>(null);
  const [banks, setBanks] = useState<BloodBank[]>([]);
  const [radiusKm, setRadiusKm] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStartingDonorSearch, setIsStartingDonorSearch] = useState(false);

  // Load the Blood Request details
  useEffect(() => {
    if (!id) return;

    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch(`/api/blood-requests?id=${id}`);
        const data = await res.json();

        if (data.success && data.request) {
          const reqData: BloodRequest = data.request;
          setRequest(reqData);

          // Fetch nearby blood banks using coordinates or address
          const queryParams = new URLSearchParams();
          if (reqData.lat !== null && reqData.lng !== null) {
            queryParams.set("lat", String(reqData.lat));
            queryParams.set("lng", String(reqData.lng));
          } else {
            queryParams.set("query", reqData.address);
          }
          queryParams.set("radius", String(radiusKm));

          const banksRes = await fetch(`/api/blood-banks?${queryParams.toString()}`);
          const banksData = await banksRes.json();

          if (banksData.success && Array.isArray(banksData.banks)) {
            setBanks(banksData.banks);
          }
        } else {
          setError(data.error || "Blood request not found.");
        }
      } catch {
        setError("Failed to load blood banks. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, radiusKm]);

  // Handler for "Find donors nearby" button
  const handleStartDonorSearch = async () => {
    if (!request) return;
    setIsStartingDonorSearch(true);

    try {
      const res = await fetch("/api/donor-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: request.id,
          radius_km: 15,
        }),
      });

      const data = await res.json();
      if (data.success && data.search?.id) {
        router.push(`/donors/${data.search.id}`);
      } else {
        alert("Could not start donor search. Please try again.");
        setIsStartingDonorSearch(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setIsStartingDonorSearch(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#5F5F5F]">
        <div className="w-10 h-10 border-3 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-[18px] font-bold text-[#1F1F1F]">Finding nearby blood banks...</h2>
        <p className="text-[14px] text-[#5F5F5F] mt-1">Calculating distances to certified centers</p>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="p-8 rounded-[16px] bg-[#FFF5F5] border border-[#C62828] text-center max-w-[600px] mx-auto my-12">
        <h2 className="text-[22px] font-bold text-[#C62828] mb-2">Request Not Found</h2>
        <p className="text-[15px] text-[#4A4A4A] mb-6">
          {error || "We could not find the details for this blood request."}
        </p>
        <Link
          href="/need-blood"
          className="inline-block px-6 py-3 bg-[#C62828] text-white rounded-[12px] font-bold text-[15px] hover:bg-[#B71C1C]"
        >
          Start New Search
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Request Summary Banner */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2.5 mb-2">
          <span className="px-3 py-1 rounded-full bg-[#FFF5F5] border border-[#FDECEC] text-[#C62828] font-bold text-[14px]">
            {request.blood_group} Needed
          </span>
          <span className="text-[14px] sm:text-[15px] text-[#4A4A4A] font-medium">
            for {request.patient_name} ({request.age} yrs)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-bold text-green-800 bg-green-50 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
            Live OpenStreetMap Data
          </span>
        </div>

        <h1 className="text-[28px] sm:text-[36px] font-extrabold text-[#1F1F1F] tracking-tight">
          Blood banks near you
        </h1>
        <p className="text-[14px] sm:text-[15px] text-[#5F5F5F] mt-1">
          {request.address} {request.lat && request.lng && `(within ${radiusKm} km)`}
        </p>
      </div>

      {/* MOBILE ONLY: Prominent Top Donor Outreach Card */}
      <div className="block lg:hidden mb-6">
        <div className="bg-[#C62828] text-white rounded-[16px] p-5 shadow-sm">
          <h2 className="text-[18px] font-bold mb-1">Can&apos;t find blood?</h2>
          <p className="text-[13px] text-white/90 leading-snug mb-4">
            Banks too far or out of stock? We ask registered donors nearby if they are available.
          </p>
          <button
            onClick={handleStartDonorSearch}
            disabled={isStartingDonorSearch}
            className="w-full h-[48px] bg-white text-[#C62828] font-bold text-[15px] rounded-[10px] flex items-center justify-center hover:bg-[#FFF5F5] active:bg-[#FDECEC] transition-colors shadow-xs"
          >
            {isStartingDonorSearch ? "Starting search..." : "Find donors nearby"}
          </button>
        </div>
      </div>

      {/* Notice about rapid stock changes */}
      <div className="mb-6 p-3.5 rounded-[10px] bg-[#F7F7F7] border border-[#E0E0E0] text-[13px] text-[#4A4A4A] flex items-center gap-2">
        <span className="text-[#C62828] font-bold">Note:</span>
        <span>Stock changes quickly. Please call the blood bank to confirm availability.</span>
      </div>

      {/* Main Layout: 2 Columns on Desktop (List Left, Red Donor Panel Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Blood Banks List */}
        <div className="lg:col-span-7 space-y-4">
          {banks.length === 0 ? (
            /* Empty State */
            <div className="p-8 rounded-[16px] border border-[#E0E0E0] bg-[#F7F7F7] text-center">
              <div className="w-12 h-12 rounded-full bg-[#FFF5F5] text-[#C62828] flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-[18px] font-bold text-[#1F1F1F] mb-1">
                No blood banks found within {radiusKm} km
              </h2>
              <p className="text-[14px] text-[#5F5F5F] mb-6 max-w-[420px] mx-auto">
                No verified centers were detected in your immediate radius. You can expand your search distance or ask registered donors right now.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setRadiusKm((r) => r + 25)}
                  className="px-4 py-2.5 rounded-[10px] border border-[#BDBDBD] text-[14px] font-bold text-[#1F1F1F] hover:bg-white"
                >
                  Expand radius to {radiusKm + 25} km
                </button>
                <Button
                  variant="primary"
                  size="compact"
                  onClick={handleStartDonorSearch}
                  disabled={isStartingDonorSearch}
                >
                  {isStartingDonorSearch ? "Starting search..." : "Find donors nearby"}
                </Button>
              </div>
            </div>
          ) : (
            /* List of Blood Banks */
            banks.map((bank) => (
              <div
                key={bank.id}
                className="bg-white border border-[#E0E0E0] rounded-[16px] p-5 sm:p-6 shadow-xs hover:border-[#BDBDBD] transition-colors"
              >
                {/* Bank Header: Name & Distance */}
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h2 className="text-[17px] sm:text-[19px] font-bold text-[#1F1F1F] leading-snug">
                      {bank.name}
                    </h2>
                    <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      {bank.source || "Live OpenStreetMap"}
                    </span>
                  </div>
                  {bank.distanceKm !== undefined && (
                    <span className="shrink-0 text-[13px] sm:text-[14px] font-bold text-[#C62828] bg-[#FFF5F5] px-2.5 py-1 rounded-full border border-[#FDECEC]">
                      {bank.distanceKm} km
                    </span>
                  )}
                </div>

                {/* Address & City */}
                <p className="text-[14px] text-[#5F5F5F] leading-normal mb-5">
                  {bank.address}, {bank.city}
                </p>

                {/* Action Buttons: Call (tel:) & Directions (Google Maps) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {/* Call Button: Solid Red 44px (Compact) */}
                  <a
                    href={`tel:${bank.phone.replace(/\s+/g, "")}`}
                    className="h-[44px] px-3 bg-[#C62828] text-white font-bold text-[14px] sm:text-[15px] rounded-[10px] flex items-center justify-center gap-1.5 hover:bg-[#B71C1C] active:bg-[#991B1B] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                    Call
                  </a>

                  {/* Directions Button: White with 2px border opening Google Maps */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${bank.lat},${bank.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[44px] px-3 bg-white text-[#C62828] border-2 border-[#C62828] font-bold text-[14px] sm:text-[15px] rounded-[10px] flex items-center justify-center gap-1.5 hover:bg-[#FFF5F5] active:bg-[#FDECEC] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Directions
                  </a>
                </div>
              </div>
            ))
          )}

          {/* MOBILE ONLY: Bottom Prominent Donor Outreach Button */}
          <div className="block lg:hidden pt-4">
            <button
              onClick={handleStartDonorSearch}
              disabled={isStartingDonorSearch}
              className="w-full h-[52px] bg-[#C62828] text-white font-bold text-[16px] rounded-[12px] flex items-center justify-center hover:bg-[#B71C1C] transition-colors shadow-sm"
            >
              {isStartingDonorSearch ? "Starting search..." : "Can't find blood? Find donors nearby"}
            </button>
          </div>
        </div>

        {/* Right Column: Desktop Sticky Red Donor Panel */}
        <div className="hidden lg:block lg:col-span-5 sticky top-24">
          <div className="bg-[#C62828] text-white rounded-[20px] p-7 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h2 className="text-[24px] font-extrabold mb-2 leading-tight">
              Can&apos;t find blood?
            </h2>
            <p className="text-[14px] text-white/90 leading-relaxed mb-6">
              Banks too far or out of stock? We ask registered donors nearby who have confirmed their availability on Telegram.
            </p>
            <button
              onClick={handleStartDonorSearch}
              disabled={isStartingDonorSearch}
              className="w-full h-[52px] bg-white text-[#C62828] font-bold text-[16px] rounded-[12px] flex items-center justify-center hover:bg-[#FFF5F5] active:bg-[#FDECEC] transition-colors shadow-xs cursor-pointer"
            >
              {isStartingDonorSearch ? "Starting search..." : "Find donors nearby"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Header />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/need-blood"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#4A4A4A] hover:text-[#C62828] transition-colors"
          >
            ← Modify Search
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="py-20 text-center text-[#5F5F5F]">
              <div className="w-10 h-10 border-3 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[15px] font-medium">Loading nearby blood banks...</p>
            </div>
          }
        >
          <ResultsContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
