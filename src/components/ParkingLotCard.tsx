import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { ParkingLot } from "../types";

interface ParkingLotCardProps {
  lot: ParkingLot;
  onClick: (lot: ParkingLot) => void;
  key?: string | number; // Added to satisfy some strict tsc checks in maps
}

export function ParkingLotCard({ lot, onClick }: ParkingLotCardProps) {
  const occupancyPercentage = ((lot.totalSpots - lot.availableSpots) / lot.totalSpots) * 100;
  
  return (
    <Card 
      id={`lot-${lot.id}`}
      className="cursor-pointer hover:shadow-lg transition-all active:scale-[0.98] border-2 border-slate-200 hover:border-blue-600/30 overflow-hidden group shadow-sm bg-white"
      onClick={() => onClick(lot)}
    >
      <div className="h-1 bg-slate-100 w-full">
         <div 
          className={cn(
            "h-full transition-all duration-1000",
            occupancyPercentage > 90 ? 'bg-rose-500' : occupancyPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
          )}
          style={{ width: `${occupancyPercentage}%` }}
        />
      </div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-black uppercase tracking-tight text-slate-800">{lot.name}</CardTitle>
          <Badge className={cn(
            "font-mono text-[10px] px-1.5 py-0 rounded-sm border-none shadow-none",
            lot.availableSpots > 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          )}>
            {lot.availableSpots} / {lot.totalSpots}
          </Badge>
        </div>
        <CardDescription className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <MapPin className="w-2 h-2 mr-1" />
          {lot.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-black uppercase tracking-tighter">
          <span className="flex items-center">
            <Car className="w-3 h-3 mr-1 text-slate-200 group-hover:text-blue-500 transition-colors" />
            {lot.totalSpots - lot.availableSpots} Active Units
          </span>
          <span className={cn(
            occupancyPercentage > 90 ? 'text-rose-600' : occupancyPercentage > 70 ? 'text-amber-600' : 'text-emerald-600'
          )}>
            {Math.round(occupancyPercentage)}% Utilization
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
