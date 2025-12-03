import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get geo information from Vercel headers (available in production)
    const country = request.headers.get("x-vercel-ip-country") || "Unknown";
    const region = request.headers.get("x-vercel-ip-country-region") || "Unknown";
    const city = request.headers.get("x-vercel-ip-city") || "Unknown";
    const latitude = request.headers.get("x-vercel-ip-latitude");
    const longitude = request.headers.get("x-vercel-ip-longitude");

    // In development, provide fallback data
    const isDevelopment = process.env.NODE_ENV === "development";

    const geoData = {
      country: isDevelopment ? "United States" : country,
      region: isDevelopment ? "CA" : region,
      city: isDevelopment ? "San Francisco" : city,
      latitude: isDevelopment ? "37.7749" : latitude,
      longitude: isDevelopment ? "-122.4194" : longitude,
      timezone: isDevelopment ? "America/Los_Angeles" : request.headers.get("x-vercel-ip-timezone"),
      flag: isDevelopment ? "🇺🇸" : request.headers.get("x-vercel-ip-country-flag"),
    };

    return NextResponse.json(geoData);
  } catch (error) {
    console.error("Geo API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch geo data" },
      { status: 500 }
    );
  }
}
