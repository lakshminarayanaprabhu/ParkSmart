import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, WriteBatch, writeBatch, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ParkingLot, ParkingSpot } from '@/types';
import { toast } from 'sonner';
import { RefreshCw, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SimulationPanel({ currentLotId }: { currentLotId?: string }) {
  const [loading, setLoading] = useState(false);

  const seedData = async () => {
    setLoading(true);
    try {
      // 1. Create a lot
      const lotRef = await addDoc(collection(db, 'parkingLots'), {
        name: "Main Street Plaza",
        location: "123 Business Ave, Downtown",
        totalSpots: 12,
        availableSpots: 12,
        updatedAt: new Date().toISOString()
      });

      // 2. Add spots
      const batch = writeBatch(db);
      for (let i = 1; i <= 12; i++) {
        const spotRef = doc(collection(db, `parkingLots/${lotRef.id}/spots`));
        batch.set(spotRef, {
          spotNumber: `A-${i}`,
          isOccupied: false,
          type: i === 1 ? 'handicap' : i === 12 ? 'electric' : 'regular',
          updatedAt: new Date().toISOString()
        });
      }
      await batch.commit();
      toast.success("Initial data seeded!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'parkingLots');
    } finally {
      setLoading(false);
    }
  };

  const toggleRandomSpot = async () => {
    if (!currentLotId) return;
    setLoading(true);
    try {
      const spotsSnap = await getDocs(collection(db, `parkingLots/${currentLotId}/spots`));
      const spots = spotsSnap.docs;
      if (spots.length === 0) return;

      const randomIdx = Math.floor(Math.random() * spots.length);
      const spotDoc = spots[randomIdx];
      const currentStatus = spotDoc.data().isOccupied;

      const batch = writeBatch(db);
      
      // Update the spot
      batch.update(doc(db, `parkingLots/${currentLotId}/spots`, spotDoc.id), {
        isOccupied: !currentStatus,
        updatedAt: new Date().toISOString()
      });

      // Update the lot count
      const lotRef = doc(db, 'parkingLots', currentLotId);
      const diff = !currentStatus ? -1 : 1;
      // Note: In real app, we'd use increment() helper or atomic server-side logic
      // But for simple demo, we'll fetch then update or just assume we have the current lot state
      const lotSnap = await getDocs(query(collection(db, 'parkingLots'))); // This is crude but works for demo
      const lotData = lotSnap.docs.find(d => d.id === currentLotId)?.data();
      if (lotData) {
        batch.update(lotRef, {
          availableSpots: Math.max(0, Math.min(lotData.totalSpots, lotData.availableSpots + diff)),
          updatedAt: new Date().toISOString()
        });
      }

      await batch.commit();
      toast.info(`Spot ${spotDoc.data().spotNumber} is now ${!currentStatus ? 'Occupied' : 'Free'}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'spots');
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    try {
      const lotsSnap = await getDocs(collection(db, 'parkingLots'));
      for (const lotDoc of lotsSnap.docs) {
        const spotsSnap = await getDocs(collection(db, `parkingLots/${lotDoc.id}/spots`));
        for (const spotDoc of spotsSnap.docs) {
          await deleteDoc(doc(db, `parkingLots/${lotDoc.id}/spots`, spotDoc.id));
        }
        await deleteDoc(doc(db, 'parkingLots', lotDoc.id));
      }
      toast.error("All data cleared");
    } catch (error) {
       handleFirestoreError(error, OperationType.DELETE, 'parkingLots');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card id="sim-panel" className="bg-white border-2 border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="py-4 bg-slate-50 border-b border-slate-100">
        <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">IoT Controller Panel</CardTitle>
        <CardDescription className="text-[10px] font-bold text-slate-400">Simulation Node: FW-992-AX</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Gateway</span>
            <span className="text-[11px] font-mono font-black text-emerald-600">ONLINE</span>
          </div>
          <div className="flex justify-between items-end border-b border-slate-100 pb-2">
            <span className="text-[11px] font-bold text-slate-600 uppercase">Sensor Mesh</span>
            <span className="text-[11px] font-mono font-black text-blue-600">ACTIVE</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={seedData} 
            disabled={loading}
            className="w-full justify-start font-bold text-[10px] uppercase tracking-wider h-10 border-slate-200"
          >
            <PlusCircle className="w-3 h-3 mr-2 text-blue-600" /> Initialize Device Data
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={toggleRandomSpot} 
            disabled={loading || !currentLotId}
            className="w-full justify-start font-bold text-[10px] uppercase tracking-wider h-10 border-slate-200"
          >
            <RefreshCw className={cn("w-3 h-3 mr-2 text-emerald-600", loading && "animate-spin")} /> Trigger Random Pulse
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={clearAllData} 
            disabled={loading}
            className="w-full justify-start font-bold text-[10px] uppercase tracking-wider h-10 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
          >
            <Trash2 className="w-3 h-3 mr-2" /> Decommission Network
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
