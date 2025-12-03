"use client";

import dynamic from "next/dynamic";

export const Map = dynamic(() => import("./Map").then((mod) => ({ default: mod.Map })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-900">
      <div className="text-white">Loading map...</div>
    </div>
  ),
});
