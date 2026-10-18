"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

interface DonorInfo {
  name: string;
  blood_group: string;
  phone: string;
  phone_verified: boolean;
  is_active: boolean;
  address: string;
  last_donated_at: string | null;
}

export default function ManageDonorPage() {
  const [phone, setPhone] = useState("");
  const [donor, setDonor] = useState<DonorInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(`/api/donors/manage?phone=${phone.replace(/\D/g, "")}`);
      const data = await res.json();
      if (data.success && data.donor) {
        setDonor(data.donor);
      } else {
        setError(data.error || "Profile not found.");
      }
    } catch {
      setError("Failed to fetch donor details.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "pause" | "resume" | "delete") => {
    if (!donor) return;

    if (action === "delete") {
      if (!confirm("Are you sure you want to permanently delete your donor profile?")) {
        return;
      }
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/donors/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: donor.phone, action }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        if (action === "delete") {
          setDonor(null);
        } else {
          setDonor((prev) => (prev ? { ...prev, is_active: action === "resume" } : null));
        }
      } else {
        setError(data.error || "Action failed.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Header />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="mb-6">
          <Link
            href="/donate"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#4A4A4A] hover:text-[#C62828] transition-colors"
          >
            ← Back to Donor Registration
          </Link>
        </div>

        <div className="max-w-[560px] mx-auto bg-white border border-[#E0E0E0] rounded-[20px] p-6 sm:p-8 shadow-xs">
          <h1 className="text-[26px] sm:text-[30px] font-extrabold text-[#1F1F1F] mb-2">
            Manage Donor Profile
          </h1>
          <p className="text-[14px] text-[#5F5F5F] mb-6">
            Pause requests when unavailable, update your status, or permanently delete your details anytime.
          </p>

          {message && (
            <div className="mb-6 p-4 rounded-[10px] bg-green-50 border border-green-200 text-green-800 text-[14px] font-medium">
              ✓ {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-[10px] bg-[#FFF5F5] border border-[#C62828] text-[#C62828] text-[14px] font-medium">
              {error}
            </div>
          )}

          {!donor ? (
            <form onSubmit={handleLookup} className="space-y-4">
              <Input
                label="Your registered mobile number"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" fullWidth disabled={loading}>
                {loading ? "Looking up..." : "Find My Profile"}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-5 rounded-[14px] bg-[#F7F7F7] border border-[#E0E0E0] space-y-2.5 text-[14px]">
                <div className="flex justify-between items-center">
                  <span className="text-[#5F5F5F]">Name:</span>
                  <span className="font-bold text-[#1F1F1F]">{donor.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5F5F5F]">Blood Group:</span>
                  <span className="font-bold text-[#C62828]">{donor.blood_group}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5F5F5F]">Mobile Number:</span>
                  <span className="font-mono text-[#1F1F1F]">+91 {donor.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5F5F5F]">Area:</span>
                  <span className="text-[#1F1F1F]">{donor.address}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5F5F5F]">Status:</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[12px] font-bold ${
                      donor.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {donor.is_active ? "Active" : "Paused"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {donor.is_active ? (
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => handleAction("pause")}
                    disabled={loading}
                  >
                    Pause Notifications
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={() => handleAction("resume")}
                    disabled={loading}
                  >
                    Resume Notifications
                  </Button>
                )}

                <button
                  type="button"
                  onClick={() => handleAction("delete")}
                  disabled={loading}
                  className="w-full h-[48px] text-[14px] font-bold text-red-600 hover:bg-red-50 rounded-[10px] transition-colors border border-red-200"
                >
                  Permanently Delete Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
