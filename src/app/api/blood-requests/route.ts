import { NextRequest, NextResponse } from "next/server";
import {
  createBloodRequest,
  getBloodRequest,
  isValidIndianPhone,
} from "@/lib/db";
import { VALID_BLOOD_GROUPS } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local_client";
    const { allowed } = checkRateLimit(`blood_req_${ip}`, 10, 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a minute before trying again." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { patient_name, age, blood_group, address, lat, lng, requester_phone } = body;

    const errors: Record<string, string> = {};

    if (!patient_name || typeof patient_name !== "string" || !patient_name.trim()) {
      errors.patient_name = "Patient name is required.";
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120) {
      errors.age = "Please enter a valid age between 0 and 120.";
    }

    if (!blood_group || !VALID_BLOOD_GROUPS.includes(blood_group)) {
      errors.blood_group = "Please select a valid blood group.";
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      errors.address = "Location or hospital address is required.";
    }

    if (!requester_phone || !isValidIndianPhone(String(requester_phone))) {
      errors.requester_phone =
        "Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }

    const savedRequest = await createBloodRequest({
      patient_name: patient_name.trim(),
      age: parsedAge,
      blood_group,
      address: address.trim(),
      lat: typeof lat === "number" ? lat : null,
      lng: typeof lng === "number" ? lng : null,
      requester_phone: String(requester_phone),
    });

    return NextResponse.json({
      success: true,
      request: savedRequest,
    });
  } catch (error) {
    console.error("Error creating blood request:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Missing request id." },
      { status: 400 }
    );
  }

  const request = await getBloodRequest(id);
  if (!request) {
    return NextResponse.json(
      { success: false, error: "Blood request not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true, request });
}
