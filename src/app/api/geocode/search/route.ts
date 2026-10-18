import { NextRequest, NextResponse } from "next/server";

export interface GeocodeSuggestion {
  id: string;
  name: string;
  city?: string;
  state?: string;
  displayName: string;
  lat: number;
  lng: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: true, suggestions: [] });
  }

  try {
    // Photon is an open-source OSM geocoder designed for search-as-you-type autocomplete
    // We restrict search bias towards India (bounding box roughly 68.1, 6.7 to 97.4, 35.5)
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
      query.trim()
    )}&limit=6&bbox=68.1,6.7,97.4,35.5`;

    const res = await fetch(photonUrl, {
      headers: {
        "User-Agent": "RaktSetu-BloodFinder/1.0",
      },
    });

    if (!res.ok) {
      throw new Error(`Photon error: ${res.statusText}`);
    }

    const data = await res.json();
    const suggestions: GeocodeSuggestion[] = (data.features || [])
      // Filter for features inside India if countrycode is available
      .filter((feat: { properties: { countrycode?: string } }) => {
        const cc = feat.properties?.countrycode;
        return !cc || cc.toLowerCase() === "in";
      })
      .map(
        (feat: {
          properties: {
            osm_id?: number;
            name?: string;
            city?: string;
            district?: string;
            state?: string;
            country?: string;
          };
          geometry: { coordinates: [number, number] };
        }) => {
          const p = feat.properties;
          const [lng, lat] = feat.geometry.coordinates;

          const parts = [
            p.name,
            p.district !== p.name ? p.district : null,
            p.city !== p.name && p.city !== p.district ? p.city : null,
            p.state,
          ].filter(Boolean);

          const displayName = parts.join(", ") || p.name || "Unknown Location";

          return {
            id: String(p.osm_id || `${lat}-${lng}`),
            name: p.name || displayName,
            city: p.city || p.district,
            state: p.state,
            displayName,
            lat,
            lng,
          };
        }
      );

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("Geocoding search failed:", error);
    // Return empty suggestions gracefully without failing
    return NextResponse.json({ success: true, suggestions: [] });
  }
}
