import { NextRequest, NextResponse } from "next/server";
import { updateDonorRequestStatus } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing requestId or status" },
        { status: 400 }
      );
    }

    const updated = updateDonorRequestStatus(
      requestId,
      status === "yes" ? "yes" : "no"
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Simulated donor reply: ${status.toUpperCase()}`,
      record: {
        id: updated.id,
        status: updated.status,
        donor_name: updated.donor_name,
        donor_phone: updated.donor_phone,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
