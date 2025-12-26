"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Eye, Thermometer, Moon, Wind, Droplets } from "lucide-react";

interface WeatherData {
  temperature: number;
  cloudCover: number;
  visibility: number;
  humidity: number;
  isDay: boolean;
  astronomy: {
    moonPhase: number;
    moonRise: string | null;
    moonSet: string | null;
    seeing: "Excellent" | "Average" | "Poor";
    transparency: "Excellent" | "Average" | "Poor";
    jetStreamSpeed: number;
  };
}

interface IntelligencePanelProps {
  center: [number, number] | null;
}

export function IntelligencePanel({ center }: IntelligencePanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchWeather = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchWeather = useCallback(
    debounce((lat: number, lng: number) => fetchWeather(lat, lng), 1000),
    [fetchWeather]
  );

  useEffect(() => {
    if (center) {
      const [lng, lat] = center;
      debouncedFetchWeather(lat, lng);
    }
  }, [center, debouncedFetchWeather]);

  if (!center) return null;

  // Helper to format Moon Phase
  const getMoonPhaseLabel = (phase: number) => {
    if (phase === 0 || phase === 1) return "New Moon";
    if (phase === 0.5) return "Full Moon";
    if (phase < 0.5) return "Waxing";
    return "Waning";
  };

  const moonPhaseLabel = weather ? getMoonPhaseLabel(weather.astronomy.moonPhase) : "--";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-background/90 backdrop-blur-md border rounded-xl p-5 shadow-2xl min-w-[320px] text-foreground">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-4 text-center text-muted-foreground">Dark Sky Intelligence</h3>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3">

            {/* Column 1: Standard Weather */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium">Temp</span>
                </div>
                <span className="text-xs font-bold">
                  {loading ? "..." : weather ? `${weather.temperature}°C` : "--"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium">Clouds</span>
                </div>
                <span className={`text-xs font-bold ${weather && weather.cloudCover < 10 ? "text-green-400" : "text-white"}`}>
                  {loading ? "..." : weather ? `${weather.cloudCover}%` : "--"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-medium">Humidity</span>
                </div>
                <span className="text-xs font-bold">
                  {loading ? "..." : weather ? `${weather.humidity}%` : "--"}
                </span>
              </div>
            </div>

            {/* Column 2: Advanced Astronomy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-yellow-200" />
                  <span className="text-xs font-medium">Moon</span>
                </div>
                <span className="text-xs font-bold truncate max-w-[80px] text-right">
                  {loading ? "..." : moonPhaseLabel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium">Seeing</span>
                </div>
                <span className={`text-xs font-bold ${weather?.astronomy.seeing === "Excellent" ? "text-green-400" :
                  weather?.astronomy.seeing === "Poor" ? "text-red-400" : "text-yellow-400"
                  }`}>
                  {loading ? "..." : weather ? weather.astronomy.seeing : "--"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-medium">Transp.</span>
                </div>
                <span className={`text-xs font-bold ${weather?.astronomy.transparency === "Excellent" ? "text-green-400" :
                  weather?.astronomy.transparency === "Poor" ? "text-red-400" : "text-yellow-400"
                  }`}>
                  {loading ? "..." : weather ? weather.astronomy.transparency : "--"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
