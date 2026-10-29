import axios from "axios";
import { getAuthStatus, logoutRequest } from "../api/authApi";
import { AuthStatusResponse } from "../types";

/**
 * Service Layer — Auth
 * Business logic for cross-origin bearer-token authentication.
 */

/**
 * Checks the current bearer-token session.
 */
export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    if (!localStorage.getItem("bearer_token")) return { isAuthenticated: false, user: null };
    return await getAuthStatus();
  } catch (err: unknown) {
    if (axios.isAxiosError<AuthStatusResponse>(err) && err.response?.data) return err.response.data;
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Revokes the server session and removes the browser bearer token.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await logoutRequest();
  } finally {
    localStorage.removeItem("bearer_token");
  }
};

/**
 * Start OAuth directly on the public Render backend. The callback returns a
 * bearer token in the URL fragment, which the callback page stores locally.
 */
export const redirectToGoogleLogin = async (): Promise<void> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  window.location.assign(`${backendUrl.replace(/\/+$/, "")}/auth/google`);
};
