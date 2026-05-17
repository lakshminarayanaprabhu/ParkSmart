export interface ParkingLot {
  id: string;
  name: string;
  location: string;
  totalSpots: number;
  availableSpots: number;
  updatedAt: string;
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  isOccupied: boolean;
  type: 'regular' | 'electric' | 'handicap';
  updatedAt: string;
}
