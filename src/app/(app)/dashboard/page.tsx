"use client";

import { useState } from "react";
import { Map, CommandPalette, IntelligencePanel } from "./_components";

export default function DashboardPage() {
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  return (
    <div className="h-screen w-full">
      <Map flyToLocation={flyToLocation} onMoveEnd={setMapCenter} />
      <CommandPalette onLocationSelect={setFlyToLocation} />
      <IntelligencePanel center={mapCenter} />
    </div>
  );
}
