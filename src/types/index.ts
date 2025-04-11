export type RideType = 'rickshaw' | 'cab' | 'bike';

export interface Ride {
  id: string;
  userId: string;
  userName: string;
  pickup: string;
  dropoff: string;
  dateTime: string;
  rideType: RideType;
  seatsAvailable: number;
  estimatedCost?: number;
  notes?: string;
}