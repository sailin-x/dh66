import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
    }

    // Request Weather Data (Seeing + Transparency)
    // Note: Moon Phase removed due to API 400 errors. We calculate locally.
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,cloud_cover,visibility,relative_humidity_2m&daily=sunrise,sunset&hourly=wind_speed_250hPa,wind_speed_10m&timezone=auto&forecast_days=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // --- Data Processing ---

    // 1. Day/Night
    const now = new Date();
    const sunriseStr = data?.daily?.sunrise?.[0];
    const sunsetStr = data?.daily?.sunset?.[0];
    let isDay = true;
    if (sunriseStr && sunsetStr) {
      isDay = (now >= new Date(sunriseStr) && now <= new Date(sunsetStr));
    }

    // 2. Astronomy: Seeing (Jet Stream)
    const currentHourIndex = now.getHours();

    // Prefer 250hPa (Jet Stream), fallback to 10m (Ground Wind)
    const windHigh = data?.hourly?.wind_speed_250hPa?.[currentHourIndex];
    const windLow = data?.hourly?.wind_speed_10m?.[currentHourIndex];
    const jetStreamSpeed = windHigh ?? windLow ?? 0;

    let seeing: "Excellent" | "Average" | "Poor" = "Average";

    // Logic: 
    // If we rely on 10m wind: <20 'Excellent' (Calm), >40 'Poor' (Windy)
    // If we have Jet Stream: <72 'Excellent' (Steady), >144 'Poor' (Turbulent)
    if (windHigh !== undefined) {
      if (jetStreamSpeed < 72) seeing = "Excellent";
      else if (jetStreamSpeed > 144) seeing = "Poor";
    } else {
      if (jetStreamSpeed < 20) seeing = "Excellent";
      else if (jetStreamSpeed > 40) seeing = "Poor";
    }

    // 3. Astronomy: Transparency (Humidity + Visibility)
    const humidity = data?.current?.relative_humidity_2m ?? 50;
    const visibility = data?.current?.visibility ?? 10000;

    let transparency: "Excellent" | "Average" | "Poor" = "Average";
    if (humidity < 50 && visibility > 15000) transparency = "Excellent";
    else if (humidity > 80 || visibility < 5000) transparency = "Poor";

    // 4. Astronomy: Moon Phase (Local Calculation)
    // Reference: New Moon on Jan 6, 2000 at 18:14 UTC
    const synodicMonth = 29.53058867;
    const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const nowTime = now.getTime();
    const daysSince = (nowTime - knownNewMoon) / 86400000;
    const currentPhase = (daysSince % synodicMonth) / synodicMonth;
    // Result is 0.0 to 1.0 (0=New, 0.5=Full, 1.0=New)

    const weatherData = {
      temperature: data?.current?.temperature_2m ?? 0,
      cloudCover: data?.current?.cloud_cover ?? 0,
      visibility: visibility,
      humidity: humidity,
      dewPoint: Math.round(data?.current?.temperature_2m - ((100 - humidity) / 5)), // Simple approximation
      isDay: isDay,
      astronomy: {
        moonPhase: currentPhase,
        moonRise: null, // Removed due to API limitation
        moonSet: null,  // Removed due to API limitation
        seeing,
        transparency,
        jetStreamSpeed
      }
    };

    return NextResponse.json(weatherData);

  } catch (error) {
    console.error("Weather API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
