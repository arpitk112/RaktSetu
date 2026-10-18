import { NextRequest, NextResponse } from "next/server";
import { getBloodRequest } from "@/lib/db";
import { matchAndAskDonors, getDonorRequestsForSearch } from "@/lib/notifications";

// In-memory store for active searches
export const inMemorySearches = new Map<
  string,
  {
    id: string;
    request_id: string;
    radius_km: number;
    round: number;
    status: "active" | "closed";
    created_at: string;
  }
>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { request_id, radius_km = 15 } = body;

    if (!request_id) {
      return NextResponse.json(
        { success: false, error: "Missing request_id" },
        { status: 400 }
      );
    }

    const bloodReq = await getBloodRequest(request_id);
    if (!bloodReq) {
      return NextResponse.json(
        { success: false, error: "Blood request not found" },
        { status: 404 }
      );
    }

    const searchId = crypto.randomUUID();
    const searchRecord = {
      id: searchId,
      request_id,
      radius_km: Number(radius_km),
      round: 1,
      status: "active" as const,
      created_at: new Date().toISOString(),
    };

    inMemorySearches.set(searchId, searchRecord);

    // Run matching and send outreach messages to compatible donors
    const { askedCount } = await matchAndAskDonors(bloodReq, searchId, Number(radius_km));

    return NextResponse.json({
      success: true,
      search: searchRecord,
      askedCount,
    });
  } catch (err) {
    console.error("Error creating donor search:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  const search = inMemorySearches.get(id);
  if (!search) {
    return NextResponse.json({ success: false, error: "Search not found" }, { status: 404 });
  }

  const requests = getDonorRequestsForSearch(id);
  return NextResponse.json({ success: true, search, totalRequests: requests.length });
}

// Close search when requester clicks "Mark as found" or "Ask more donors"
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { search_id, action, radius_km } = body;

    const search = inMemorySearches.get(search_id);
    if (!search) {
      return NextResponse.json({ success: false, error: "Search not found" }, { status: 404 });
    }

    if (action === "close") {
      search.status = "closed";
      return NextResponse.json({ success: true, message: "Search marked as found and closed." });
    }

    if (action === "expand") {
      search.round += 1;
      search.radius_km = Number(radius_km || search.radius_km + 15);
      const bloodReq = await getBloodRequest(search.request_id);
      if (bloodReq) {
        await matchAndAskDonors(bloodReq, search_id, search.radius_km);
      }
      return NextResponse.json({
        success: true,
        message: `Expanded radius to ${search.radius_km} km`,
        round: search.round,
        radius_km: search.radius_km,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
