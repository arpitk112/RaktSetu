import { NextRequest, NextResponse } from "next/server";
import {
  getDonorByPhone,
  updateDonorActiveStatus,
  deleteDonorByPhone,
} from "@/lib/donors";
import { isValidIndianPhone } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const phone = searchParams.get("phone");

  if (!phone || !isValidIndianPhone(phone)) {
    return NextResponse.json(
      { success: false, error: "Please provide a valid 10-digit Indian mobile number." },
      { status: 400 }
    );
  }

  const donor = await getDonorByPhone(phone);
  if (!donor) {
    return NextResponse.json(
      { success: false, error: "No donor profile found for this mobile number." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    donor: {
      name: donor.name,
      blood_group: donor.blood_group,
      phone: donor.phone,
      phone_verified: donor.phone_verified,
      is_active: donor.is_active,
      address: donor.address,
      last_donated_at: donor.last_donated_at,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, action } = body;

    if (!phone || !isValidIndianPhone(phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number." },
        { status: 400 }
      );
    }

    if (action === "pause") {
      await updateDonorActiveStatus(phone, false);
      return NextResponse.json({
        success: true,
        message: "Your donor profile is now paused. You won't receive requests.",
      });
    }

    if (action === "resume") {
      await updateDonorActiveStatus(phone, true);
      return NextResponse.json({
        success: true,
        message: "Your donor profile is now active.",
      });
    }

    if (action === "delete") {
      await deleteDonorByPhone(phone);
      return NextResponse.json({
        success: true,
        message: "Your profile and data have been permanently deleted.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Unknown action. Use pause, resume, or delete." },
      { status: 400 }
    );
  } catch (err) {
    console.error("Error managing donor profile:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
