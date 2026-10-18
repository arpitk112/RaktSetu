import { NextRequest, NextResponse } from "next/server";
import { getDonorByPhone } from "@/lib/donors";

export async function GET(req: NextRequest) {
  try {
    const phone = req.nextUrl.searchParams.get("phone");
    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone required" }, { status: 400 });
    }

    const donor = await getDonorByPhone(phone);
    if (!donor) {
      return NextResponse.json({ success: false, error: "Donor not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      verified: Boolean(donor.phone_verified),
      isActive: Boolean(donor.is_active),
      name: donor.name,
      bloodGroup: donor.blood_group,
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED" || error?.message?.includes("bail out of prerendering")) {
      throw error;
    }
    console.error("Donor status check error:", error);
    return NextResponse.json({ success: false, error: "Failed to check status" }, { status: 500 });
  }
}
