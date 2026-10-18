import { NextRequest, NextResponse } from "next/server";
import { getDonorRequestsForSearch } from "@/lib/notifications";
import { inMemorySearches } from "@/app/api/donor-searches/route";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const searchId = searchParams.get("searchId");

  if (!searchId) {
    return NextResponse.json(
      { success: false, error: "Missing searchId" },
      { status: 400 }
    );
  }

  const search = inMemorySearches.get(searchId);
  const requests = getDonorRequestsForSearch(searchId);

  const askedCount = requests.length;
  const yesRequests = requests.filter((r) => r.status === "yes");
  const noRequests = requests.filter((r) => r.status === "no");
  const waitingCount = requests.filter((r) => r.status === "sent").length;

  // Strict Privacy Check: Only return name, phone, and distance for YES donors
  const confirmedDonors = yesRequests.map((r) => ({
    id: r.id,
    name: r.donor_name,
    phone: r.donor_phone,
    blood_group: r.donor_blood_group,
    distance_km: r.distance_km,
    responded_at: r.responded_at,
  }));

  return NextResponse.json({
    success: true,
    status: search?.status || "active",
    radiusKm: search?.radius_km || 15,
    round: search?.round || 1,
    counts: {
      asked: askedCount,
      available: yesRequests.length,
      waiting: waitingCount,
      declined: noRequests.length,
    },
    // Only donors who tapped YES are revealed
    confirmedDonors,
    // Return pending request IDs so UI can offer simulation buttons during development
    pendingRequestIds: requests.filter((r) => r.status === "sent").map((r) => ({
      id: r.id,
      donor_name: r.donor_name,
      distance_km: r.distance_km,
    })),
  });
}
