"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { LocationInput, LocationValue } from "@/components/LocationInput";
import { BLOOD_GROUPS } from "@/lib/constants";

function NeedBloodFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form states
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [locationValue, setLocationValue] = useState<LocationValue>({
    address: "",
    lat: null,
    lng: null,
  });
  const [phoneNumber, setPhoneNumber] = useState("");

  // UI & Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear form helper
  const handleClearForm = () => {
    setPatientName("");
    setPatientAge("");
    setBloodGroup("");
    setLocationValue({ address: "", lat: null, lng: null });
    setPhoneNumber("");
    setErrors({});
    setIsSubmitting(false);
  };

  // Reset form or state on navigation / back button
  useEffect(() => {
    // Crucial: ensure submitting state is always reset to false when this page is displayed
    setIsSubmitting(false);

    // If query has reset=1, clear all fields
    if (searchParams.get("reset") === "1") {
      handleClearForm();
    }

    // Handle bfcache / browser back navigation
    const handlePageShow = () => {
      setIsSubmitting(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [searchParams]);

  // Helper to validate Indian phone numbers
  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    const normalized =
      cleaned.length === 12 && cleaned.startsWith("91")
        ? cleaned.substring(2)
        : cleaned.length === 11 && cleaned.startsWith("0")
        ? cleaned.substring(1)
        : cleaned;
    return /^[6-9]\d{9}$/.test(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!patientName.trim()) {
      newErrors.patientName = "Patient name is required.";
    }

    const ageNum = Number(patientAge);
    if (!patientAge || isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      newErrors.patientAge = "Enter age between 0 and 120.";
    }

    if (!bloodGroup) {
      newErrors.bloodGroup = "Select blood group.";
    }

    if (!locationValue.address.trim()) {
      newErrors.location = "Please enter area, city or hospital.";
    }

    if (!phoneNumber || !validatePhone(phoneNumber)) {
      newErrors.phoneNumber =
        "Enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/blood-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_name: patientName.trim(),
          age: ageNum,
          blood_group: bloodGroup,
          address: locationValue.address.trim(),
          lat: locationValue.lat,
          lng: locationValue.lng,
          requester_phone: phoneNumber.replace(/\D/g, ""),
        }),
      });

      const result = await response.json();

      if (result.success && result.request?.id) {
        setIsSubmitting(false);
        router.push(`/results/${result.request.id}`);
      } else {
        setErrors({
          form: result.error || "Unable to save request. Please try again.",
        });
        setIsSubmitting(false);
      }
    } catch {
      setErrors({ form: "Network error. Please try again." });
      setIsSubmitting(false);
    }
  };

  const hasAnyData = Boolean(
    patientName ||
      patientAge ||
      bloodGroup ||
      locationValue.address ||
      phoneNumber
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Left Column: Intro */}
      <div className="lg:col-span-5">
        <h1 className="text-[34px] sm:text-[42px] font-extrabold text-[#1F1F1F] tracking-tight leading-tight mb-3">
          I need blood
        </h1>
        <p className="text-[16px] sm:text-[18px] text-[#4A4A4A] leading-relaxed mb-6">
          Only what we need to search for you.
        </p>

        <div className="p-4 rounded-[12px] bg-[#FFF5F5] border border-[#FDECEC] text-[13px] text-[#C62828] leading-relaxed mb-6">
          In a life-threatening emergency, call <strong>112</strong> or go to the nearest hospital.
        </div>

        <p className="text-[13px] text-[#5F5F5F] leading-normal hidden lg:block">
          Your phone number is only shared with confirmed donors who reply YES on Telegram to help this patient.
        </p>
      </div>

      {/* Right Column: Request Form Card */}
      <div className="lg:col-span-7">
        <div className="bg-white border border-[#E0E0E0] rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 shadow-xs">
          {/* Card Header with Clear Form option */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F7F7F7]">
            <h2 className="text-[16px] font-bold text-[#1F1F1F]">Patient Details</h2>
            {hasAnyData && (
              <button
                type="button"
                onClick={handleClearForm}
                className="text-[13px] font-semibold text-[#C62828] hover:text-[#B71C1C] hover:underline cursor-pointer"
              >
                Clear form
              </button>
            )}
          </div>

          {errors.form && (
            <div
              className="mb-6 p-4 rounded-[10px] bg-[#FFF5F5] border border-[#C62828] text-[14px] text-[#C62828] font-medium"
              role="alert"
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Row 1: Patient Name & Age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Patient name"
                  placeholder="Full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  error={errors.patientName}
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  label="Patient age"
                  type="number"
                  min={0}
                  max={120}
                  placeholder="Age"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  error={errors.patientAge}
                  required
                />
              </div>
            </div>

            {/* Row 2: Blood Group */}
            <Select
              label="Blood group"
              placeholder="Select blood group"
              options={BLOOD_GROUPS}
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              error={errors.bloodGroup}
              required
            />

            {/* Row 3: Location Search with Autocomplete & GPS */}
            <LocationInput
              label="Location"
              placeholder="Search area, city or hospital"
              value={locationValue.address}
              coords={
                locationValue.lat !== null && locationValue.lng !== null
                  ? { lat: locationValue.lat, lng: locationValue.lng }
                  : null
              }
              onChange={setLocationValue}
              error={errors.location}
              required
            />

            {/* Row 4: Requester Phone Number */}
            <Input
              label="Your phone number"
              type="tel"
              placeholder="10-digit mobile number"
              helperText="So donors and blood banks can reach you directly."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={errors.phoneNumber}
              required
            />

            {/* Submit Button */}
            <div className="pt-3">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? "Searching blood banks..." : "Search blood banks"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NeedBloodPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Header />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#4A4A4A] hover:text-[#C62828] transition-colors"
          >
            ← Back
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="py-16 text-center text-[#5F5F5F]">
              <div className="w-8 h-8 border-3 border-[#C62828] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[15px] font-medium">Loading form...</p>
            </div>
          }
        >
          <NeedBloodFormContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
