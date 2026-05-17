import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ParkingSpot } from "../types";
import { cn } from "@/lib/utils";
import { Zap, Accessibility, Car } from "lucide-react";

interface SpotGridProps {
  spots: ParkingSpot[];
  onSpotClick?: (spot: ParkingSpot) => void;
}

export function SpotGrid({ spots, onSpotClick }: SpotGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {spots.map((spot) => (
        <Card
          id={`spot-${spot.id}`}
          key={spot.id}
          className={cn(
            "h-32 flex flex-col items-center justify-center cursor-pointer transition-all border-2 relative overflow-hidden active:scale-95 group shadow-lg",
            spot.isOccupied 
              ? "bg-rose-500 border-rose-600 text-white" 
              : "bg-emerald-500/90 border-emerald-600 text-white"
          )}
          onClick={() => onSpotClick?.(spot)}
        >
          {/* Grid lines or industrial decor */}
          <div className="absolute inset-x-0 top-0 h-[10%] bg-black/10 flex items-center px-2 justify-between">
             <span className="text-[10px] font-black">{spot.spotNumber}</span>
             {spot.type === 'electric' && <Zap className="w-3 h-3 fill-current" />}
             {spot.type === 'handicap' && <Accessibility className="w-3 h-3 fill-current" />}
          </div>

          <div className="flex flex-col items-center gap-1 group-hover:scale-110 transition-transform">
            {spot.isOccupied ? (
              <>
                <Car className="w-12 h-12 animate-in fade-in zoom-in duration-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">B1-9922</span>
              </>
            ) : (
              <>
                <div className="w-10 h-10 border-2 border-white/40 border-dashed rounded flex items-center justify-center">
                   <div className="w-4 h-4 bg-white/20 rounded-full animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Vacant</span>
              </>
            )}
          </div>

          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/20">
             <div className="h-full bg-white/30" style={{ width: spot.isOccupied ? '100%' : '5%' }} />
          </div>
        </Card>
      ))}
    </div>
  );
}
