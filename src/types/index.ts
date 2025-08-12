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

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  isAdmin?: boolean;
}

export interface UserProfile {
  userID: string;
  name: string;
  email: string;
  photoUrl?: string; 
}