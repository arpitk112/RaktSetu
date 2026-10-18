"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";

interface ConfirmedDonor {
  id: string;
  name: string;
  phone: string;
  blood_group: string;
  distance_km: number;
  responded_at: string;
}

interface PendingDonorRequest {
  id: string;
  donor_name: string;
  distance_km: number;
}

interface SearchCounts {
  asked: number;
  available: number;
  waiting: number;
  declined: number;
}

function AvailableDonorsContent() {
  const params = useParams();
  const searchId = params?.searchId as string;

  const [counts, setCounts] = useState<SearchCounts>({
    asked: 0,
    available: 0,
    waiting: 0,
    declined: 0,
  });
  const [confirmedDonors, setConfirmedDonors] = useState<ConfirmedDonor[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingDonorRequest[]>([]);
  const [searchStatus, setSearchStatus] = useState<"active" | "closed">("active");
  const [radiusKm, setRadiusKm] = useState(15);
  const [loading, setLoading] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Poll for updates every 4 seconds
  useEffect(() => {
    if (!searchId) return;

    let isMounted = true;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/donor-requests?searchId=${searchId}`);
        const data = await res.json();

        if (isMounted && data.success) {
          setCounts(data.counts);
          setConfirmedDonors(data.confirmedDonors || []);
          setPendingRequests(data.pendingRequestIds || []);
          setSearchStatus(data.status);
          setRadiusKm(data.radiusKm);
          setLoading(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [searchId]);

  // Expand search radius
  const handleAskMoreDonors = async () => {
    setIsExpanding(true);
    try {
      const res = await fetch("/api/donor-searches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search_id: searchId,
          action: "expand",
          radius_km: radiusKm + 15,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRadiusKm(data.radius_km);
      }
    } catch {
      alert("Failed to expand search.");
    } finally {
      setIsExpanding(false);
    }
  };

  // Close search session
  const handleMarkAsFound = async () => {
    if (!confirm("Are you sure you want to mark this request as resolved? This will close the search.")) {
      return;
    }
    setIsClosing(true);
    try {
      await fetch("/api/donor-searches", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          search_id: searchId,
          action: "close",
        }),
      });
      setSearchStatus("closed");
    } finally {
      setIsClosing(false);
    }
  };

  // Quick simulator for testing live popup
  const handleSimulateYes = async (requestId: string) => {
    try {
      await fetch("/api/telegram/simulate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: "yes" }),
      });
      // Immediately trigger refresh
      const res = await fetch(`/api/donor-requests?searchId=${searchId}`);
      const data = await res.json();
      if (data.success) {
        setCounts(data.counts);
        setConfirmedDonors(data.confirmedDonors || []);
        setPendingRequests(data.pendingRequestIds || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      {/* Top Header & Status */}
      <div className="mb-8">
        <h1 className="text-[30px] sm:text-[40px] font-extrabold text-[#1F1F1F] tracking-tight leading-tight">
          Available donors
        </h1>

        {/* Live Status Line */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[14px] sm:text-[15px] font-semibold">
          <span className="text-[#5F5F5F]">{counts.asked} asked</span>
          <span className="text-[#E0E0E0]">•</span>
          <span className="text-[#C62828] font-bold">
            {counts.available} available
          </span>
          <span className="text-[#E0E0E0]">•</span>
          <span className="text-[#5F5F5F]">{counts.waiting} waiting</span>
          {searchStatus === "closed" && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[12px] font-bold">
              Closed
            </span>
          )}
        </div>

        <p className="text-[13px] text-[#5F5F5F] mt-2">
          Waiting for donors to reply. Only donors who explicitly confirmed YES on Telegram are shown.
        </p>
      </div>

      {/* Confirmed Donors Cards Grid (Responsive Wrapping Grid) */}
      <div className="mb-10">
        {confirmedDonors.length === 0 ? (
          /* Waiting Screen State */
          <div className="p-8 sm:p-12 rounded-[20px] border border-[#E0E0E0] bg-[#F7F7F7] text-center max-w-[640px] mx-auto my-6">
            <div className="w-12 h-12 border-3 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-[20px] font-bold text-[#1F1F1F] mb-1">
              Contacting Nearby Donors...
            </h2>
            <p className="text-[14px] text-[#5F5F5F] leading-relaxed max-w-[460px] mx-auto mb-6">
              We have sent urgent messages to registered donors within {radiusKm} km. As soon as a donor confirms they are ready, their contact card will appear right here with instant Call and WhatsApp buttons.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {confirmedDonors.map((donor) => (
              <div
                key={donor.id}
                className="bg-white border-2 border-green-600 rounded-[18px] p-5 sm:p-6 shadow-sm animate-fade-in flex flex-col justify-between"
              >
                <div>
                  {/* Verified Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                      ✓ Confirmed Available
                    </span>
                    <span className="text-[13px] font-semibold text-[#5F5F5F]">
                      ~{donor.distance_km} km away
                    </span>
                  </div>

                  {/* Donor Name & Blood Group */}
                  <h2 className="text-[20px] font-extrabold text-[#1F1F1F] leading-tight">
                    {donor.name}
                  </h2>
                  <p className="text-[14px] font-bold text-[#C62828] mt-0.5 mb-2">
                    Blood Group: {donor.blood_group}
                  </p>

                  {/* Phone Number */}
                  <p className="text-[16px] font-mono font-bold text-[#1F1F1F] mb-5">
                    +91 {donor.phone}
                  </p>
                </div>

                {/* Call & WhatsApp Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Call Button: 44px Solid Red */}
                  <a
                    href={`tel:${donor.phone}`}
                    className="h-[44px] bg-[#C62828] text-white font-bold text-[14px] rounded-[10px] flex items-center justify-center gap-1.5 hover:bg-[#B71C1C] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                    Call
                  </a>

                  {/* WhatsApp Button: 44px Clean Outline */}
                  <a
                    href={`https://wa.me/91${donor.phone}?text=${encodeURIComponent(
                      `Hello ${donor.name}, I found your contact on RaktSetu after your YES response. I need ${donor.blood_group} blood urgently. Are you available to connect?`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[44px] bg-white text-[#25D366] border-2 border-[#25D366] font-bold text-[14px] rounded-[10px] flex items-center justify-center gap-1.5 hover:bg-green-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Controls: Ask More Donors & Mark As Found */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-[460px] mx-auto mb-12">
        <Button
          variant="secondary"
          fullWidth
          onClick={handleAskMoreDonors}
          disabled={isExpanding || searchStatus === "closed"}
        >
          {isExpanding ? "Expanding..." : `Ask more donors (+15 km)`}
        </Button>

        {searchStatus === "active" && (
          <button
            type="button"
            onClick={handleMarkAsFound}
            disabled={isClosing}
            className="w-full h-[52px] bg-white border border-[#BDBDBD] text-[#1F1F1F] font-bold text-[15px] rounded-[12px] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
          >
            {isClosing ? "Closing..." : "Mark as found"}
          </button>
        )}
      </div>

      {/* Developer / Testing Simulator Controls (Demonstrates Feature 8 & 9 locally) */}
      {pendingRequests.length > 0 && searchStatus === "active" && (
        <div className="p-5 rounded-[16px] bg-[#FFF5F5] border border-[#FDECEC] max-w-[640px] mx-auto text-left">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-bold text-[#C62828] uppercase tracking-wider">
              ⚡ Test Mode: Simulate Donor Telegram Reply
            </span>
            <span className="text-[12px] text-[#5F5F5F]">
              {pendingRequests.length} pending
            </span>
          </div>
          <p className="text-[13px] text-[#4A4A4A] mb-3">
            Click to simulate a nearby donor tapping <strong>YES</strong> on Telegram to see their card pop in live:
          </p>
          <div className="flex flex-wrap gap-2">
            {pendingRequests.slice(0, 3).map((req) => (
              <button
                key={req.id}
                onClick={() => handleSimulateYes(req.id)}
                className="px-3.5 py-1.5 rounded-[8px] bg-white border border-[#C62828] text-[12px] font-bold text-[#C62828] hover:bg-[#C62828] hover:text-white transition-colors cursor-pointer"
              >
                Simulate YES for {req.donor_name} (~{req.distance_km} km)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DonorsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Header />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#4A4A4A] hover:text-[#C62828] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="py-20 text-center text-[#5F5F5F]">
              <div className="w-10 h-10 border-3 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-[15px]">Connecting to donor outreach network...</p>
            </div>
          }
        >
          <AvailableDonorsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
