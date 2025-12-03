"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, Eye, Thermometer } from "lucide-react";

interface WeatherData {
  temperature: number;
  cloudCover: number;
  visibility: number;
  isDay: boolean;
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <div className="bg-background/80 backdrop-blur-sm border rounded-lg p-4 shadow-lg min-w-[280px]">
          <h3 className="text-sm font-semibold mb-3 text-center">Intelligence Panel</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Temperature</span>
              </div>
              <span className="text-sm font-medium">
                {loading ? "Loading..." : weather ? `${weather.temperature}°C` : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Cloud Cover</span>
              </div>
              <span className="text-sm font-medium">
                {loading ? "Loading..." : weather ? `${weather.cloudCover}%` : "--"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Visibility</span>
              </div>
              <span className="text-sm font-medium">
                {loading ? "Loading..." : weather ? `${(weather.visibility / 1000).toFixed(1)} km` : "--"}
              </span>
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
