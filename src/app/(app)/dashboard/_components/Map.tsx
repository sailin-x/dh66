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
      attributionControl: false,
    });

    map.current.on("load", async () => {
      if (!map.current) return;

      // Add light pollution layer (New Transparent Tiles)
      map.current.addSource("light-pollution", {
        type: "raster",
        tiles: [
          "https://pub-5ec788c7cc324df48e09c31eb119bae4.r2.dev/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        minzoom: 0,
        maxzoom: 9, // Limit to zoom levels we have tiles for
        bounds: [-180, -85.0511, 180, 85.0511], // World bounds to prevent tiling artifacts
        scheme: 'xyz', // Standard XYZ tile scheme
        attribution: "Light pollution data from VIIRS"
      });

      map.current.addLayer({
        id: "light-pollution-layer",
        type: "raster",
        source: "light-pollution",
        paint: {
          "raster-opacity": 0.8 // Balanced opacity for transparent tiles
        }
      });

      // Add attribution control
      map.current.addControl(
        new maplibregl.AttributionControl({
          compact: true,
        }),
        "bottom-right"
      );

      // Add moveend listener
      map.current.on("moveend", () => {
        if (onMoveEnd) {
          const center = map.current!.getCenter();
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

          // Call onMoveEnd after flyTo animation completes
          setTimeout(() => {
            if (onMoveEnd && map.current) {
              onMoveEnd(map.current.getCenter().toArray() as [number, number]);
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

  // Effect to fly to location when flyToLocation changes
  useEffect(() => {
    if (flyToLocation && map.current) {
      map.current.flyTo({
        center: flyToLocation,
        zoom: 12,
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
