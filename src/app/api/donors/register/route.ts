import { NextRequest, NextResponse } from "next/server";
import { createDonor } from "@/lib/donors";
import { isValidIndianPhone } from "@/lib/db";
import { VALID_BLOOD_GROUPS } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const { allowed } = checkRateLimit(`donor_reg_${ip}`, 10, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registrations. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      name,
      age,
      blood_group,
      address,
      lat,
      lng,
      phone,
      consent_whatsapp,
      consent_share,
      last_donated_at,
    } = body;

    const errors: Record<string, string> = {};

    if (!name || typeof name !== "string" || !name.trim()) {
      errors.name = "Full name is required.";
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 18 || parsedAge > 65) {
      errors.age = "Donors must be between 18 and 65 years old.";
    }

    if (!blood_group || !VALID_BLOOD_GROUPS.includes(blood_group)) {
      errors.blood_group = "Please select a valid blood group.";
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      errors.address = "Location or area is required.";
    }

    if (!phone || !isValidIndianPhone(String(phone))) {
      errors.phone = "Enter a valid 10-digit Indian mobile number.";
    }

    if (!consent_whatsapp) {
      errors.consent_whatsapp =
        "You must agree to receive availability messages on Telegram/WhatsApp.";
    }

    if (!consent_share) {
      errors.consent_share =
        "You must agree to share contact details only after you confirm.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, errors }, { status: 400 });
    }

    const { donor, verificationCode, alreadyExisted } = await createDonor({
      name: name.trim(),
      age: parsedAge,
      blood_group,
      address: address.trim(),
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      phone: String(phone),
      consent_whatsapp: Boolean(consent_whatsapp),
      consent_share: Boolean(consent_share),
      last_donated_at: last_donated_at || null,
    });

    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "RaktSetuBot";
    const telegramUrl = `https://t.me/${botUsername}?start=${verificationCode}`;

    return NextResponse.json({
      success: true,
      donor: {
        id: donor.id,
        name: donor.name,
        blood_group: donor.blood_group,
        phone_verified: donor.phone_verified,
      },
      verificationCode,
      telegramUrl,
      alreadyExisted,
    });
  } catch (error) {
    console.error("Donor registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
