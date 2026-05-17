/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { ParkingLot, ParkingSpot } from '@/types';
import { ParkingLotCard } from '@/components/ParkingLotCard';
import { SpotGrid } from '@/components/SpotGrid';
import { SimulationPanel } from '@/components/SimulationPanel';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { ChevronLeft, Info, Settings, Map as MapIcon, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<ParkingLot | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to parking lots
  useEffect(() => {
    const q = query(collection(db, 'parkingLots'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lots: ParkingLot[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ParkingLot));
      setParkingLots(lots);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'parkingLots');
    });
    return () => unsubscribe();
  }, []);

  // Listen to spots if a lot is selected
  useEffect(() => {
    if (!selectedLot) {
      setSpots([]);
      return;
    }

    const q = query(collection(db, `parkingLots/${selectedLot.id}/spots`), orderBy('spotNumber', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const s: ParkingSpot[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ParkingSpot));
      setSpots(s);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `parkingLots/${selectedLot.id}/spots`);
    });
    return () => unsubscribe();
  }, [selectedLot]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* App Bar */}
      <header className="sticky top-0 z-50 w-full bg-slate-900 text-white border-b border-slate-800 shadow-lg">
        <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedLot ? (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-lg bg-slate-800 hover:bg-slate-700 text-white" 
                onClick={() => setSelectedLot(null)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-xl italic text-white shadow-lg shadow-blue-500/20">P</div>
            )}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight uppercase leading-none">
                ParkSmart <span className="text-blue-400 font-mono text-[10px]">IoT</span>
              </h1>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest font-semibold">Enterprise Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex flex-col text-right mr-2">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">System Status</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Active
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold">JD</div>
          </div>
        </div>
      </header>

      {/* Level / Status Bar */}
      <div className="w-full bg-white border-b border-slate-200 sticky top-16 z-40 shadow-sm transition-all">
        <div className="max-w-md mx-auto px-6 h-12 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="flex gap-4">
             <span className={cn("cursor-pointer border-b-2 py-3 transition-colors", !selectedLot ? "border-blue-600 text-blue-600" : "border-transparent")}>Facilities</span>
             {selectedLot && <span className="border-b-2 border-blue-600 py-3 text-blue-600 animate-in slide-in-from-left-2">{selectedLot.name}</span>}
          </div>
          {selectedLot && (
            <div className="flex gap-2 items-center text-slate-400 lowercase font-mono font-medium">
               <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {selectedLot.availableSpots} open
            </div>
          )}
        </div>
      </div>

      <main className="max-w-md mx-auto px-6 pt-6 pb-24 space-y-6">
        <AnimatePresence mode="wait">
          {!selectedLot ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Available Lots</h2>
                <p className="text-slate-500 text-sm italic">Showing live availability across all locations.</p>
              </div>

              <div className="grid gap-4">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))
                ) : parkingLots.length > 0 ? (
                  parkingLots.map(lot => (
                    <ParkingLotCard 
                      key={lot.id} 
                      lot={lot} 
                      onClick={setSelectedLot} 
                    />
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-400 text-sm">No parking lots found.</p>
                    <p className="text-slate-400 text-[10px]">Use the simulator below to seed data.</p>
                  </div>
                )}
              </div>

              <SimulationPanel />
            </motion.div>
          ) : (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{selectedLot.name}</h2>
                  <p className="text-slate-500 text-sm">{selectedLot.location}</p>
                </div>

                <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col gap-2 shadow-xl border border-slate-800">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Facility Insight</span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This location is current operating at <span className="text-white font-bold">{Math.round(((selectedLot.totalSpots - selectedLot.availableSpots) / selectedLot.totalSpots) * 100)}%</span> capacity. 
                    Closest sensor reading suggests clear driveway conditions.
                  </p>
                  <Button variant="outline" className="mt-2 w-full bg-blue-600 border-none text-white hover:bg-blue-500 font-bold text-xs h-10">
                    Direct Navigation
                  </Button>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Live Grid View</h3>
                     <span className="text-[10px] font-mono text-slate-400 italic">FW: 4.8.2-STABLE</span>
                   </div>
                   <SpotGrid spots={spots} />
                </div>
                
                <SimulationPanel currentLotId={selectedLot.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Nav Simulation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-8 h-18 py-2 flex items-center justify-between max-w-md mx-auto shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-50 rounded-t-2xl">
        <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto text-blue-400">
          <MapIcon className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Discover</span>
        </Button>
        <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto text-slate-500 hover:text-slate-300">
          <Settings className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Manage</span>
        </Button>
        <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto text-slate-500 hover:text-slate-300">
          <User className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-tighter">Identity</span>
        </Button>
      </nav>

      <footer className="fixed bottom-0 left-0 right-0 h-4 bg-slate-950 text-[8px] text-slate-600 px-4 flex items-center justify-center max-w-md mx-auto font-mono z-[60]">
        CONNECTED TO CLOUD ENDPOINT // LATENCY: 24ms
      </footer>

      <Toaster position="top-center" />
    </div>
  );
}

