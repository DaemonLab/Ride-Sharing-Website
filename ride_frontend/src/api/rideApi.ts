import axiosInstance from "./axiosInstance";
import { Ride, RideFilters, NewRidePayload } from "../types";

/**
 * API Layer — Rides
 * Raw HTTP calls to /rides/* endpoints.
 *
 * The backend wraps all responses in { success: boolean, data: T }.
 * We unwrap .data here so the service layer always receives the plain array/object.
 */

/** Fetch all rides that are currently pending/available */
export const fetchAvailableRides = async (): Promise<Ride[]> => {
  const response = await axiosInstance.get<{ success: boolean; data: Ride[] }>("/rides/availableRides");
  return response.data.data ?? [];
};

/** Fetch rides filtered by from/to/date/time criteria */
export const fetchFilteredRides = async (filters: RideFilters): Promise<Ride[]> => {
  const response = await axiosInstance.post<{ success: boolean; data: Ride[] }>("/rides/filteredAvailableRides", filters);
  return response.data.data ?? [];
};

/** Post a new ride offering */
export const addRide = async (rideData: NewRidePayload): Promise<Ride> => {
  const response = await axiosInstance.post<{ success: boolean; data: Ride }>("/rides/addRide", rideData);
  return response.data.data;
};

/** Fetch the logged-in user's upcoming (pending) rides */
export const fetchPendingRides = async (): Promise<Ride[]> => {
  const response = await axiosInstance.get<{ success: boolean; data: Ride[] }>("/rides/pendingRides");
  return response.data.data ?? [];
};

/** Fetch the logged-in user's completed rides */
export const fetchCompletedRides = async (): Promise<Ride[]> => {
  const response = await axiosInstance.get<{ success: boolean; data: Ride[] }>("/rides/completedRides");
  return response.data.data ?? [];
};
