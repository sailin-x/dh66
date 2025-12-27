"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapProps {
  flyToLocation?: [number, number] | null;
  onMoveEnd?: (center: [number, number]) => void;
}

export function Map({ flyToLocation, onMoveEnd }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [0, 20],
      zoom: 2,
      maxZoom: 10.5, // Capped to 10.5 to prevent pixelation
      attributionControl: false,
      renderWorldCopies: false,
    });

    map.current.on("load", async () => {
      if (!map.current) return;

      // XYZ tiles with zoom 0-11 for crisp detail
      map.current.addSource("light-pollution", {
        type: 'raster',
        tiles: ['https://pub-5ec788c7cc324df48e09c31eb119bae4.r2.dev/{z}/{x}/{y}.png'],
        tileSize: 256,
        scheme: 'xyz',
        attribution: "Light pollution data from VIIRS",
        minzoom: 0,
        maxzoom: 8 // Force soft upscaling at higher zooms (Blurs pixels)
      });

      // Add layer
      // Note: 'watername_ocean' attempts to place this below labels if that layer exists
      map.current.addLayer({
        id: "light-pollution-layer",
        type: "raster",
        source: "light-pollution",
        paint: {
          "raster-opacity": 0.5,
          "raster-resampling": "linear",
          "raster-fade-duration": 300,
          "raster-contrast": 0,    // Less contrast for smoother look
          "raster-saturation": -0.1 // Slight desaturation
        }
      }, 'watername_ocean');

      // Attribution
      map.current.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      // Moveend listener
      map.current.on("moveend", () => {
        if (onMoveEnd && map.current) {
          const center = map.current.getCenter();
          onMoveEnd([center.lng, center.lat]);
        }
      });

      // Auto-fly to user location
      try {
        const response = await fetch("/api/geo");
        const geoData = await response.json();

        if (geoData.latitude && geoData.longitude) {
          const latitude = parseFloat(geoData.latitude);
          const longitude = parseFloat(geoData.longitude);

          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 8,
            duration: 3000,
            essential: true
          });

          setTimeout(() => {
            if (onMoveEnd && map.current) {
              const center = map.current.getCenter();
              onMoveEnd([center.lng, center.lat]);
            }
          }, 3000);
        }
      } catch (error) {
        console.error("Failed to fetch user location:", error);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (flyToLocation && map.current) {
      map.current.flyTo({
        center: flyToLocation,
        zoom: 10.5, // Matches the new maxZoom cap
        duration: 2000,
        essential: true
      });
    }
  }, [flyToLocation]);

  return (
    <div className="h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}
