import { useState, useEffect, useCallback, useRef } from "react";
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
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
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
   * For HTTP/network errors, shows a safe message and returns false.
   */
  const sendRequest = async (rideId: string): Promise<boolean> => {
    if (sendingRef.current) return false;
    sendingRef.current = true;
    setSending(true);
    setError(null);
    setStatusMessage(null);
    try {
      const status = await sendRideRequest(rideId);

      if (status === "RequestMade") {
        await fetchRequests(); // refresh state after a genuine new request
        return true;
      }

      // Not a new request — show an informational message instead
      setStatusMessage(STATUS_MESSAGES[status] ?? "Unable to confirm your request. Please refresh and try again.");
      return false;
    } catch {
      setError("Unable to send your request. Please refresh the ride and try again.");
      return false;
    } finally {
      sendingRef.current = false;
      setSending(false);
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
    } catch {
      setError("Unable to update this request. Please refresh and try again.");
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
    loading: loading || sending,
    error,
    statusMessage,
    sendRequest,
    handleRequest,
    fetchRequests,
  };
}
