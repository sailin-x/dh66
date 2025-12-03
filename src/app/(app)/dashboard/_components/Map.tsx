"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export function Map() {
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

    map.current.on("load", () => {
      if (!map.current) return;

      // Add light pollution layer
      map.current.addSource("light-pollution", {
        type: "raster",
        tiles: [
          "https://pub-5ec788c7cc324df48e09c31eb119bae4.r2.dev/tiles/viirs/{z}/{x}/{y}.png"
        ],
        tileSize: 256,
        attribution: "Light pollution data from VIIRS"
      });

      map.current.addLayer({
        id: "light-pollution-layer",
        type: "raster",
        source: "light-pollution",
        paint: {
          "raster-opacity": 0.7
        }
      });

      // Add attribution control
      map.current.addControl(
        new maplibregl.AttributionControl({
          compact: true,
        }),
        "bottom-right"
      );
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
}
