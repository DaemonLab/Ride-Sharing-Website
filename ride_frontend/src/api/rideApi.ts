import axiosInstance from "./axiosInstance";
import { PaginatedRides, Ride, RideSearchParams, NewRidePayload } from "../types";

interface RawRide {
  id?: string | number;
  rideID?: number;
  userId?: string | number;
  createdBy?: number;
  userName?: string;
  name?: string;
  creatorName?: string;
  pickup?: string;
  source?: string;
  dropoff?: string;
  destination?: string;
  dateTime?: string;
  date?: string;
  time?: string;
  seatsAvailable?: number;
  seats?: number;
  estimatedCost?: number;
  totalCost?: number | null;
  from?: string;
  to?: string;
  price?: number | null;
  vehicle?: string;
  vehicleType?: string;
  isBooked?: boolean;
}

// Keep the UI model stable while the backend uses database-oriented names.
// All ride responses pass through this boundary instead of being remapped in pages.
const normalizeRide = (ride: RawRide): Ride => ({
  ...ride,
  id: String(ride.id ?? ride.rideID),
  userId: String(ride.userId ?? ride.createdBy),
  userName: ride.userName ?? ride.name ?? ride.creatorName ?? "",
  pickup: ride.pickup ?? ride.source ?? "",
  dropoff: ride.dropoff ?? ride.destination ?? "",
  dateTime: ride.dateTime ?? `${ride.date ?? ""}T${ride.time ?? "00:00"}`,
  seatsAvailable: ride.seatsAvailable ?? ride.seats ?? 0,
  estimatedCost: ride.estimatedCost ?? ride.totalCost ?? undefined,
  from: ride.from ?? ride.source ?? "",
  to: ride.to ?? ride.destination ?? "",
  seats: ride.seats ?? ride.seatsAvailable,
  price: (ride.price != null && Number(ride.price) > 0)
    ? Number(ride.price)
    : (ride.totalCost != null && Number(ride.totalCost) > 0 ? Number(ride.totalCost) : undefined),
  vehicle: ride.vehicle ?? ride.vehicleType,
  rideType: ride.vehicle === "rickshaw" || ride.vehicle === "cab" || ride.vehicle === "other"
    ? ride.vehicle
    : ride.vehicleType === "rickshaw" || ride.vehicleType === "cab" || ride.vehicleType === "other"
      ? ride.vehicleType
      : "other",
});

/**
 * API Layer — Rides
 * Raw HTTP calls to /rides/* endpoints.
 *
 * The backend wraps all responses in { success: boolean, data: T }.
 * We unwrap .data here so the service layer always receives the plain array/object.
 */

/** Fetch all rides that are currently pending/available */
/** Fetch one server-filtered page of available rides. */
export const searchAvailableRides = async (params: RideSearchParams): Promise<PaginatedRides> => {
  const response = await axiosInstance.get<{ success: boolean; data: PaginatedRides }>("/rides", { params });
  return {
    items: (response.data.data.items ?? []).map(normalizeRide),
    meta: response.data.data.meta,
  };
};

/** Post a new ride offering — backend returns no data, just a success message */
export const addRide = async (rideData: NewRidePayload): Promise<void> => {
  await axiosInstance.post("/rides/addRide", rideData);
};

/** Fetch the logged-in user's upcoming (pending) rides */
export const fetchUpcomingRides = async (): Promise<Ride[]> => {
  const response = await axiosInstance.get<{ success: boolean; data: Ride[] }>("/rides/upcomingRides");
  return (response.data.data ?? []).map(normalizeRide);
};

/** Fetch the logged-in user's completed rides */
export const fetchCompletedRides = async (): Promise<Ride[]> => {
  const response = await axiosInstance.get<{ success: boolean; data: Ride[] }>("/rides/completedRides");
  return (response.data.data ?? []).map(normalizeRide);
};

export const cancelRide = async (rideID: number): Promise<void> => {
  await axiosInstance.post(`/rides/${rideID}/cancel`);
};

export const leaveRide = async (rideID: number): Promise<void> => {
  await axiosInstance.post(`/rides/${rideID}/leave`);
};

export interface RideGroup {
  rideID: number;
  source: string;
  destination: string;
  date: string;
  time: string;
  vehicleType: string;
  totalSeats: number | null;
  seatsAvailable: number;
  members: Array<{ id: number; name: string | null; email: string; picture?: string | null }>;
}

export const fetchRideGroup = async (rideID: number): Promise<RideGroup> => {
  const response = await axiosInstance.get<{ success: boolean; data: RideGroup }>(`/rides/${rideID}/group`);
  return response.data.data;
};
