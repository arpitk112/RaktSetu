import { NextRequest, NextResponse } from "next/server";
import { findNearbyBloodBanks } from "@/lib/blood-banks";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const radiusParam = searchParams.get("radius");
    const query = searchParams.get("query");

    const lat = latParam ? parseFloat(latParam) : null;
    const lng = lngParam ? parseFloat(lngParam) : null;
    const radiusKm = radiusParam ? parseFloat(radiusParam) : 25;

    const result = await findNearbyBloodBanks({
      lat: !isNaN(Number(lat)) ? lat : null,
      lng: !isNaN(Number(lng)) ? lng : null,
      radiusKm: !isNaN(radiusKm) ? radiusKm : 25,
      query,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error querying blood banks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search blood banks." },
      { status: 500 }
    );
  }
}
