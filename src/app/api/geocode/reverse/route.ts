import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { success: false, error: "Missing lat or lng coordinates." },
      { status: 400 }
    );
  }

  try {
    // Reverse geocode using Photon reverse API (free, OSM-based)
    const reverseUrl = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`;
    const res = await fetch(reverseUrl, {
      headers: {
        "User-Agent": "RaktSetu-BloodFinder/1.0",
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const p = data.features[0].properties;
        const parts = [
          p.name,
          p.district !== p.name ? p.district : null,
          p.city !== p.name && p.city !== p.district ? p.city : null,
          p.state,
        ].filter(Boolean);

        const displayName = parts.join(", ") || p.name || `Location (${lat}, ${lng})`;

        return NextResponse.json({
          success: true,
          address: displayName,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
        });
      }
    }

    // Fallback if no specific feature was returned
    return NextResponse.json({
      success: true,
      address: `Near ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  } catch (err) {
    console.error("Reverse geocode failed:", err);
    return NextResponse.json({
      success: true,
      address: `Near ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
    });
  }
}
