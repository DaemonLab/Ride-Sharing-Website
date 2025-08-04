import axios from "axios";

// Request interfaces
export interface RideRequest {
  _id: string;
  rideID: string;
  requestBy: number;
  createdBy: string;
  requestStatus: 'Pending' | 'Accepted' | 'Rejected';
  source?: string;
  destination?: string;
  date?: string;
  time?: string;
}

// Frontend Ride interface matching backend fields
export interface Ride {
  _id: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  totalCost: number;
  seatsAvailable: number;
  vehicleType: string;
  rideStatus: string;
  createdBy: {
    id: string;
    name: string;
  };
}

// Backend data structure (for internal reference)
interface BackendRide {
  rideID: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  seatsAvailable: number;
  totalCost: number;
  vehicleType: string;
  rideStatus: string;
  creatorId: string;
  creatorName: string;
}

export interface RideFilters {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  email?: string;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // This is correct for session-based auth
});

export interface CreateRideData {
  email: string;
  source: string;
  destination: string;
  date: string;
  time: string;
  seatsAvailable: number;
  totalCost: number;
  vehicleType: string;
  vehicleModel?: string;
}

const apiClient = {
  transformBackendRide: (ride: BackendRide): Ride => ({
    _id: ride.rideID,
    source: ride.source,
    destination: ride.destination,
    date: ride.date,
    time: ride.time,
    totalCost: ride.totalCost,
    seatsAvailable: ride.seatsAvailable,
    vehicleType: ride.vehicleType,
    rideStatus: ride.rideStatus || "available",
    createdBy: {
      id: ride.creatorId,
      name: ride.creatorName,
    },
  }),

  getAllRides: async (): Promise<Ride[]> => {
    try {
      const response = await axiosInstance.get("/rides/availableRides");
      const backendData = response.data.data || [];
      return backendData.map(apiClient.transformBackendRide);
    } catch (error) {
      console.error("Error in getAllRides:", error);
      throw error;
    }
  },

  getFilteredRides: async (filters: RideFilters): Promise<Ride[]> => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );
      const response = await axiosInstance.post(
        "/rides/filteredAvailableRides",
        cleanFilters
      );
      const backendData = response.data.data || [];
      return backendData.map(apiClient.transformBackendRide);
    } catch (error) {
      console.error("Error fetching filtered rides:", error);
      throw error;
    }
  },

  getRideById: async (id: string): Promise<Ride> => {
    try {
      const response = await axiosInstance.get(`/rides/${id}`);
      const ride: BackendRide = response.data.data;

      const transformedRide: Ride = {
        _id: ride.rideID,
        source: ride.source,
        destination: ride.destination,
        date: ride.date,
        time: ride.time,
        totalCost: ride.totalCost,
        seatsAvailable: ride.seatsAvailable,
        vehicleType: ride.vehicleType,
        rideStatus: ride.rideStatus,
        createdBy: {
          id: ride.creatorId,
          name: ride.creatorName,
        },
      };

      return transformedRide;
    } catch (error) {
      console.error(`Error fetching ride with id ${id}:`, error);
      throw error;
    }
  },

  createRide: async (rideData: CreateRideData): Promise<Ride> => {
    try {
      console.log("Creating ride with data:", rideData);
      const response = await axiosInstance.post("/rides/addRide", rideData);
      console.log("Ride created successfully:", response.data);

      // Transform the backend response to match our frontend Ride interface
      const createdRide = response.data.data;
      return {
        _id: createdRide.id,
        source: createdRide.source,
        destination: createdRide.destination,
        date: createdRide.date,
        time: createdRide.time,
        totalCost: createdRide.totalCost,
        seatsAvailable: createdRide.seatsAvailable,
        vehicleType: createdRide.vehicleType,
        rideStatus: "available", // Newly created ride is available by default
        createdBy: {
          id: createdRide.createdBy,
          name: "You", // Or fetch name if available
        },
      };
    } catch (error) {
      console.error("Error creating ride:", error);
      throw error;
    }
  },

  sendRideRequest: async (rideId: string, userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post('/request/sendRequest', {
        rideID: rideId,
        requestBy: userId
      });
      // This handles successful 2xx responses from the server.
      return response.data;
    } catch (error: any) {
      console.error('Error in sendRideRequest API call:', error);
      // This catches 4xx/5xx errors and returns the server's JSON response,
      // ensuring the component doesn't need a try/catch block.
      return error.response?.data || { success: false, message: 'A network or server error occurred.' };
    }
  },


  handleRideRequest: async (
    rideID: string,
    requestBy: number,
    action: "Accepted" | "Rejected"
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axiosInstance.post("/request/handleRequest", {
        rideID,
        requestBy,
        flag: action
      });
      return response.data;
    } catch (error: any) {
      console.error("Error handling ride request:", error);
      throw (
        error.response?.data || {
          success: false,
          message: error.message || "Failed to handle request",
        }
      );
    }
  },

  getSentRequests: async (userId: string): Promise<RideRequest[]> => {
    try {
      const response = await axiosInstance.post("/request/requestsSent", {
        requestBy: userId,
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error("Error fetching sent requests:", error);
      throw error.response?.data || {
        success: false,
        message: "Failed to fetch sent requests",
      };
    }
  },

  getReceivedRequests: async (userId: string): Promise<RideRequest[]> => {
    try {
      const response = await axiosInstance.post("/request/requestReceived", {
        createdBy: userId,
      });
      return response.data.data || [];
    } catch (error: any) {
      console.error("Error fetching received requests:", error);
      throw error.response?.data || {
        success: false,
        message: "Failed to fetch received requests",
      };
    }
  },
};
export default apiClient;
