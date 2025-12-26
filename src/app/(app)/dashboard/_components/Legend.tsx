"use client";

export function Legend() {
  return (
    <div className="fixed bottom-4 right-4 z-40 bg-background/80 backdrop-blur-sm border rounded-lg p-3 shadow-lg w-64 max-w-[calc(100vw-32px)]">
      <h4 className="text-xs font-semibold mb-2 text-center text-muted-foreground uppercase tracking-wider">
        Light Pollution (Radiance)
      </h4>
      
      {/* Gradient Bar */}
      <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-black via-[#1a237e] to-[#ffffff] mb-1 overflow-hidden">
        <div 
          className="absolute inset-0" 
          style={{
            background: `linear-gradient(to right, 
              #000000 0%, 
              #001f3f 20%, 
              #0074D9 40%, 
              #2ECC40 60%, 
              #FFDC00 80%, 
              #FF4136 90%, 
              #FFFFFF 100%)`
          }} 
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between text-[10px] uppercase font-medium text-muted-foreground px-1">
        <span>Dark Sky</span>
        <span>Urban</span>
      </div>

      <div className="mt-2 text-[10px] text-center text-muted-foreground/70">
        VIIRS / World Atlas 2015
      </div>
    </div>
  );
}
