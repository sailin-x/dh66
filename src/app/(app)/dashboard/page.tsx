"use client";

import { useState } from "react";
import { Map, CommandPalette } from "./_components";

export default function DashboardPage() {
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);

  return (
    <div className="h-screen w-full">
      <Map flyToLocation={flyToLocation} />
      <CommandPalette onLocationSelect={setFlyToLocation} />
    </div>
  );
}
