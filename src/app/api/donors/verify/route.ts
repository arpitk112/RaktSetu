import { NextRequest, NextResponse } from "next/server";
import { verifyDonorByCode, getDonorByPhone } from "@/lib/donors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, phone, simulate } = body;

    if (!code && !phone) {
      return NextResponse.json(
        { success: false, error: "Verification code or phone is required." },
        { status: 400 }
      );
    }

    if (code) {
      const verified = await verifyDonorByCode(code, "telegram_user_" + code);
      if (verified) {
        return NextResponse.json({
          success: true,
          message: "Phone number verified successfully via Telegram!",
          donor: {
            name: verified.name,
            phone: verified.phone,
            blood_group: verified.blood_group,
            phone_verified: verified.phone_verified,
          },
        });
      }
    }

    // Support instant verification simulation for local development / testing
    if (simulate && phone) {
      const donor = await getDonorByPhone(phone);
      if (donor) {
        donor.phone_verified = true;
        donor.telegram_chat_id = "test_chat_" + donor.phone;
        return NextResponse.json({
          success: true,
          message: "Simulation: Phone number verified successfully!",
          donor: {
            name: donor.name,
            phone: donor.phone,
            blood_group: donor.blood_group,
            phone_verified: true,
          },
        });
      }
    }

    return NextResponse.json(
      { success: false, error: "Invalid verification code or profile not found." },
      { status: 404 }
    );
  } catch (error) {
    console.error("Donor verification error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
