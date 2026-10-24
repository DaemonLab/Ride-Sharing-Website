import { useState, useEffect, useCallback } from "react";
import {
  getSentRequests,
  getReceivedRequests,
  sendRideRequest,
  handleRideRequest,
} from "../services/requestService";
import { RideRequest, HandleRequestPayload } from "../types";

/**
 * Hook Layer — useRideRequests
 *
 * Manages all ride join request state.
 * Exposes both lists (sent/received) and action functions.
 *
 * Usage:
 *   const { sentRequests, receivedRequests, loading, error, statusMessage, sendRequest, handleRequest } = useRideRequests();
 */

/** Human-readable messages for each non-success status returned by the backend */
const STATUS_MESSAGES: Record<string, string> = {
  Accepted: "You are already an accepted member of this ride.",
  Pending:  "You already have a pending request for this ride.",
  Rejected: "Your previous request was rejected. You cannot re-request this ride.",
  Left:     "You previously left this ride and cannot re-request.",
};

export function useRideRequests() {
  const [sentRequests, setSentRequests] = useState<RideRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  /** Informational (non-error) status message — shown differently to the user */
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  /** Loads both sent and received requests in parallel */
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sent, received] = await Promise.all([
        getSentRequests(),
        getReceivedRequests(),
      ]);
      setSentRequests(sent);
      setReceivedRequests(received);
    } catch {
      setError("Failed to load ride requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sends a join request for a ride.
   *
   * Returns true only when a new request was successfully created ("RequestMade").
   * For informational statuses (Pending, Accepted, Rejected, Left) sets statusMessage
   * and returns false — the caller should NOT navigate to the success page.
   * For HTTP/network errors, sets error (from the actual backend message) and returns false.
   */
  const sendRequest = async (rideId: string): Promise<boolean> => {
    setError(null);
    setStatusMessage(null);
    try {
      const status = await sendRideRequest(rideId);

      if (status === "RequestMade") {
        await fetchRequests(); // refresh state after a genuine new request
        return true;
      }

      // Not a new request — show an informational message instead
      setStatusMessage(STATUS_MESSAGES[status] ?? `Unexpected status: ${status}`);
      return false;
    } catch (err: unknown) {
      // Extract the actual backend error message from the Axios response, falling
      // back to the thrown error's message, then a generic fallback.
      const axiosMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const thrownMessage = err instanceof Error ? err.message : undefined;
      setError(axiosMessage ?? thrownMessage ?? "Failed to send request. Please try again.");
      return false;
    }
  };

  /**
   * Accepts or rejects a received request.
   * After success, re-fetches to update received list.
   */
  const handleRequest = async (payload: HandleRequestPayload): Promise<boolean> => {
    setError(null);
    setStatusMessage(null);
    try {
      await handleRideRequest(payload);
      await fetchRequests(); // refresh state
      return true;
    } catch (err: unknown) {
      const axiosMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(axiosMessage ?? "Failed to handle request.");
      return false;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    sentRequests,
    receivedRequests,
    loading,
    error,
    statusMessage,
    sendRequest,
    handleRequest,
    fetchRequests,
  };
}
