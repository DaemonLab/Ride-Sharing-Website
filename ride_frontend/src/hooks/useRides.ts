import { useState, useEffect, useCallback } from "react";
import {
  postRide,
  getUserUpcomingRides,
  getUserCompletedRides,
} from "../services/rideService";
import { Ride, NewRidePayload } from "../types";

/**
 * Hook Layer — useRides
 *
 * Manages ride data state for pages that need to display or create rides.
 * Calls the rideService (never the API layer directly).
 *
 * Usage in Find.tsx:
 *   const { rides, loading, error, fetchRides } = useRides();
 *
 * Usage in Profile.tsx (upcoming rides):
 *   const { upcomingRides, completedRides, loading } = useRides({ mode: 'profile' });
 *
 * Usage in Offer.tsx:
 *   const { submitRide, loading, error } = useRides();
 */
export function useRides(mode: "profile" | "none" = "none") {
  // Rides for the Profile page
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [completedRides, setCompletedRides] = useState<Ride[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Tracks whether a ride post (Offer.tsx) succeeded
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  /**
   * Fetch the current user's upcoming + completed rides.
   * Called from Profile.tsx on mount.
   */
  const fetchProfileRides = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [upcoming, completed] = await Promise.all([
        getUserUpcomingRides(),
        getUserCompletedRides(),
      ]);
      setUpcomingRides(upcoming);
      setCompletedRides(completed);
    } catch {
      setError("Failed to load your rides.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Submit a new ride (Offer.tsx form submit handler).
   * Returns true on success, false on failure.
   */
  const submitRide = async (rideData: NewRidePayload): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSubmitSuccess(false);
    try {
      await postRide(rideData);
      setSubmitSuccess(true);
      return true;
    } catch (err: unknown) {
      // Surface the actual backend error message (e.g. Zod validation details)
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Failed to post ride. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch on mount based on which page is using the hook
  useEffect(() => {
    if (mode === "profile") fetchProfileRides();
  }, [mode, fetchProfileRides]);

  return {
    // Profile page
    upcomingRides,
    completedRides,
    fetchProfileRides,
    // Offer page
    submitRide,
    submitSuccess,
    // Shared
    loading,
    error,
  };
}
