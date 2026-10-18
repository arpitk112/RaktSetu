"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { LocationInput, LocationValue } from "@/components/LocationInput";
import { BLOOD_GROUPS } from "@/lib/constants";

export default function DonatePage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [locationValue, setLocationValue] = useState<LocationValue>({
    address: "",
    lat: null,
    lng: null,
  });
  const [phone, setPhone] = useState("");
  const [lastDonatedAt, setLastDonatedAt] = useState("");
  const [consentWhatsapp, setConsentWhatsapp] = useState(false);
  const [consentShare, setConsentShare] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification step state
  const [registeredDonor, setRegisteredDonor] = useState<{
    code: string;
    telegramUrl: string;
    phone: string;
    verified: boolean;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-poll verification status while on verification step
  useEffect(() => {
    if (!registeredDonor || registeredDonor.verified) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/donors/status?phone=${registeredDonor.phone}`);
        const data = await res.json();
        if (data.success && data.verified) {
          setRegisteredDonor((prev) => (prev ? { ...prev, verified: true } : null));
        }
      } catch {
        // silent fail on network polling
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [registeredDonor]);

  const validatePhone = (p: string): boolean => {
    const cleaned = p.replace(/\D/g, "");
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

    if (!name.trim()) newErrors.name = "Full name is required.";
    const ageNum = Number(age);
    if (!age || isNaN(ageNum) || ageNum < 18 || ageNum > 65) {
      newErrors.age = "Donors must be between 18 and 65 years old.";
    }
    if (!bloodGroup) newErrors.bloodGroup = "Select your blood group.";
    if (!locationValue.address.trim()) {
      newErrors.location = "Area, city or locality is required.";
    }
    if (!phone || !validatePhone(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (!consentWhatsapp) {
      newErrors.consentWhatsapp =
        "You must agree to receive availability check messages on Telegram.";
    }
    if (!consentShare) {
      newErrors.consentShare =
        "You must agree to share contact info only after you say YES.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/donors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          age: ageNum,
          blood_group: bloodGroup,
          address: locationValue.address.trim(),
          lat: locationValue.lat,
          lng: locationValue.lng,
          phone: phone.replace(/\D/g, ""),
          consent_whatsapp: consentWhatsapp,
          consent_share: consentShare,
          last_donated_at: lastDonatedAt || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRegisteredDonor({
          code: data.verificationCode,
          telegramUrl: data.telegramUrl,
          phone: phone.replace(/\D/g, ""),
          verified: data.donor?.phone_verified || false,
        });
      } else {
        setErrors({ form: data.error || "Failed to register donor." });
      }
    } catch {
      setErrors({ form: "Network error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateVerification = async () => {
    if (!registeredDonor) return;
    setIsVerifying(true);

    try {
      const res = await fetch("/api/donors/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: registeredDonor.code,
          phone: registeredDonor.phone,
          simulate: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setRegisteredDonor((prev) => (prev ? { ...prev, verified: true } : null));
      } else {
        alert(data.error || "Verification failed");
      }
    } catch {
      alert("Error verifying.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#1F1F1F]">
      <Header />

      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#4A4A4A] hover:text-[#C62828] transition-colors"
          >
            ← Back to Home
          </Link>

          <Link
            href="/donate/manage"
            className="text-[13px] font-medium text-[#5F5F5F] hover:text-[#C62828] underline"
          >
            Already registered? Manage profile
          </Link>
        </div>

        {/* Success / Telegram Verification Step */}
        {registeredDonor ? (
          <div className="max-w-[620px] mx-auto bg-white border border-[#E0E0E0] rounded-[20px] p-6 sm:p-8 shadow-xs">
            {registeredDonor.verified ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  ✓
                </div>
                <h1 className="text-[26px] sm:text-[30px] font-extrabold text-[#1F1F1F] mb-2">
                  You are now an Active Donor!
                </h1>
                <p className="text-[15px] text-[#4A4A4A] leading-relaxed mb-6">
                  Thank you for stepping up to save lives. Whenever a patient near <strong>{locationValue.address}</strong> urgently needs <strong>{bloodGroup}</strong> blood, you will receive a direct message with Yes / No buttons.
                </p>
                <div className="p-4 rounded-[12px] bg-[#F7F7F7] border border-[#E0E0E0] text-[13px] text-[#5F5F5F] text-left space-y-1 mb-6">
                  <p className="font-semibold text-[#1F1F1F]">Donor Eligibility Note:</p>
                  <p>• Must be 18–65 years old and weigh at least 45 kg.</p>
                  <p>• Avoid donating if you have symptoms of cold, flu, or recent surgery.</p>
                  <p>• At least 3 months must pass between whole blood donations.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/"
                    className="h-[48px] px-6 bg-[#C62828] text-white font-bold rounded-[10px] flex items-center justify-center hover:bg-[#B71C1C]"
                  >
                    Return Home
                  </Link>
                  <Link
                    href="/donate/manage"
                    className="h-[48px] px-6 bg-white border-2 border-[#E0E0E0] text-[#1F1F1F] font-bold rounded-[10px] flex items-center justify-center hover:bg-[#F7F7F7]"
                  >
                    Manage Profile
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 bg-[#FFF5F5] text-[#C62828] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v-2h-2v2zm0-4h2V7h-2v6z" />
                  </svg>
                </div>
                <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#1F1F1F] mb-2">
                  One Step Left: Tap &quot;Start&quot; in Telegram
                </h1>
                <p className="text-[14px] sm:text-[15px] text-[#4A4A4A] leading-relaxed mb-5">
                  Telegram protects your privacy — bots cannot message you first. To activate donor alerts, tap below to open our bot and press <strong>START</strong>.
                </p>

                <div className="p-4 rounded-[12px] bg-[#FFF5F5] border border-[#FDECEC] mb-6">
                  <p className="text-[12px] font-semibold text-[#5F5F5F] uppercase tracking-wider mb-1">
                    Your One-Time Code:
                  </p>
                  <p className="text-[22px] font-mono font-extrabold text-[#C62828]">
                    {registeredDonor.code}
                  </p>
                  <p className="text-[12px] text-[#5F5F5F] mt-1">
                    (Automatically attached when you tap the button below)
                  </p>
                </div>

                <div className="space-y-3">
                  <a
                    href={registeredDonor.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full h-[52px] bg-[#229ED9] hover:bg-[#1E88E5] text-white font-bold text-[16px] rounded-[12px] flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                    </svg>
                    Open Telegram &amp; Press START
                  </a>

                  <div className="flex items-center gap-2 justify-center py-1 text-[13px] text-[#5F5F5F]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Listening... this page updates automatically once you tap Start</span>
                  </div>

                  {/* Simulator for immediate testing without live bot */}
                  <button
                    type="button"
                    onClick={handleSimulateVerification}
                    disabled={isVerifying}
                    className="w-full h-[46px] bg-white border border-[#BDBDBD] hover:bg-[#F7F7F7] text-[#1F1F1F] font-semibold text-[13px] rounded-[10px] transition-colors"
                  >
                    {isVerifying ? "Verifying..." : "⚡ Or Click Here to Instant Verify (Demo Mode)"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* 2-Column Desktop Layout (Reasons Left, Form Right) / 1-Column Mobile */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Reasons & Privacy */}
            <div className="lg:col-span-5">
              <h1 className="text-[34px] sm:text-[42px] font-extrabold text-[#C62828] tracking-tight leading-tight mb-3">
                Become a donor
              </h1>
              <p className="text-[16px] sm:text-[18px] text-[#4A4A4A] leading-relaxed mb-8">
                We ask you only when someone near you needs your blood group.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFF5F5] border border-[#FDECEC] text-[#C62828] flex items-center justify-center shrink-0 mt-0.5">
                    💬
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1F1F1F] mb-0.5">
                      Asked first
                    </h2>
                    <p className="text-[14px] text-[#5F5F5F] leading-normal">
                      You get a Telegram message with simple Yes and No buttons before anyone can see your contact.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFF5F5] border border-[#FDECEC] text-[#C62828] flex items-center justify-center shrink-0 mt-0.5">
                    🔒
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1F1F1F] mb-0.5">
                      Private by default
                    </h2>
                    <p className="text-[14px] text-[#5F5F5F] leading-normal">
                      Your name and number are never listed in public directories. They appear only after you reply YES.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#FFF5F5] border border-[#FDECEC] text-[#C62828] flex items-center justify-center shrink-0 mt-0.5">
                    ⚙️
                  </div>
                  <div>
                    <h2 className="text-[16px] font-bold text-[#1F1F1F] mb-0.5">
                      Your choice always
                    </h2>
                    <p className="text-[14px] text-[#5F5F5F] leading-normal">
                      Pause or delete your profile anytime with a single text or from the profile page.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Donor Registration Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-white border border-[#E0E0E0] rounded-[16px] sm:rounded-[20px] p-6 sm:p-8 shadow-xs">
                {errors.form && (
                  <div
                    className="mb-6 p-4 rounded-[10px] bg-[#FFF5F5] border border-[#C62828] text-[14px] text-[#C62828] font-medium"
                    role="alert"
                  >
                    {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Row 1: Name and Age */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <Input
                        label="Full name"
                        placeholder="e.g. Vikram Malhotra"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        required
                      />
                    </div>
                    <div className="sm:col-span-1">
                      <Input
                        label="Age"
                        type="number"
                        min={18}
                        max={65}
                        placeholder="18-65"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        error={errors.age}
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

                  {/* Row 3: Location Search */}
                  <LocationInput
                    label="Location"
                    placeholder="Search your area or city"
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

                  {/* Row 4: Phone Number */}
                  <Input
                    label="WhatsApp / Mobile number"
                    type="tel"
                    placeholder="10-digit mobile number"
                    helperText="After submitting, you will connect your Telegram with 1 tap to receive donor alerts."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                    required
                  />

                  {/* Row 5: Last donation date (optional) */}
                  <Input
                    label="Last donation date (optional)"
                    type="date"
                    helperText="Leave empty if you are a first-time donor or donated over 3 months ago."
                    value={lastDonatedAt}
                    onChange={(e) => setLastDonatedAt(e.target.value)}
                  />

                  {/* Consent Checkboxes */}
                  <div className="space-y-3 pt-2">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consentWhatsapp}
                        onChange={(e) => setConsentWhatsapp(e.target.checked)}
                        className="w-5 h-5 rounded mt-0.5 accent-[#C62828] cursor-pointer"
                      />
                      <span className="text-[13px] sm:text-[14px] text-[#1F1F1F] leading-snug">
                        I agree to be asked on Telegram whether I can donate.{" "}
                        <span className="text-[#C62828]">*</span>
                      </span>
                    </label>
                    {errors.consentWhatsapp && (
                      <p className="text-[12px] text-[#C62828] pl-8">
                        {errors.consentWhatsapp}
                      </p>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={consentShare}
                        onChange={(e) => setConsentShare(e.target.checked)}
                        className="w-5 h-5 rounded mt-0.5 accent-[#C62828] cursor-pointer"
                      />
                      <span className="text-[13px] sm:text-[14px] text-[#1F1F1F] leading-snug">
                        I agree my name and phone number are shared with the person in need <strong>only after I say yes</strong>.{" "}
                        <span className="text-[#C62828]">*</span>
                      </span>
                    </label>
                    {errors.consentShare && (
                      <p className="text-[12px] text-[#C62828] pl-8">
                        {errors.consentShare}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Registering..." : "Register and connect Telegram"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
