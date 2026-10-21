import {
  searchAvailableRides,
  addRide,
  fetchUpcomingRides,
  fetchCompletedRides,
  cancelRide,
  leaveRide,
  fetchRideGroup,
  RideGroup,
} from "../api/rideApi";
import { PaginatedRides, Ride, RideSearchParams, NewRidePayload } from "../types";

/**
 * Service Layer — Rides
 * Wraps API calls with business logic, data normalization, and error handling.
 * Hooks call service functions — never the API layer directly.
 */

// Search failures intentionally propagate so the page can show an error rather
// than presenting a failed request as an empty result set.
export const searchRides = (params: RideSearchParams): Promise<PaginatedRides> =>
  searchAvailableRides(params);

/**
 * Creates a new ride offering.
 * Throws on failure — the hook will catch and set an error state.
 */
export const postRide = async (rideData: NewRidePayload): Promise<void> => {
  await addRide(rideData);
};

/**
 * Returns the current user's upcoming (pending) rides for the Profile page.
 */
export const getUserUpcomingRides = async (): Promise<Ride[]> => {
  try {
    return await fetchUpcomingRides();
  } catch (error) {
    console.error("[rideService] Failed to fetch upcoming rides:", error);
    throw error; // re-throw so useRides hook can surface the error state
  }
};

/**
 * Returns the current user's completed rides for the Profile page.
 */
export const getUserCompletedRides = async (): Promise<Ride[]> => {
  try {
    return await fetchCompletedRides();
  } catch (error) {
    console.error("[rideService] Failed to fetch completed rides:", error);
    throw error; // re-throw so useRides hook can surface the error state
  }
};

export const cancelUserRide = (rideID: number) => cancelRide(rideID);
export const leaveUserRide = (rideID: number) => leaveRide(rideID);
export const getRideGroup = (rideID: number): Promise<RideGroup> => fetchRideGroup(rideID);
