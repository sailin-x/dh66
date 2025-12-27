import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }

    // Use Nominatim (OpenStreetMap) - No API Key required
    // Must provide a valid User-Agent as per Usage Policy
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        q
      )}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; DarkestHour/1.0; +https://example.com)",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch geocoding results" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform Nominatim format to match our frontend expectation (Mapbox Feature-like)
    const features = data.map((item: any) => ({
      id: item.place_id,
      place_name: item.display_name,
      center: [parseFloat(item.lon), parseFloat(item.lat)], // [lng, lat]
      properties: {
        address: item.display_name,
        category: item.type,
      },
    }));

    return NextResponse.json(features);
  } catch (error) {
    console.error("Geocoding API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}




