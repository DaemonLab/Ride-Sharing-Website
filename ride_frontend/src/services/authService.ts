import axios from "axios";
import { getAuthStatus, logoutRequest } from "../api/authApi";
import { AuthStatusResponse } from "../types";

/**
 * Service Layer — Auth
 * Contains business logic around authentication for token-based auth.
 */

/**
 * Checks whether the current token session is valid.
 * Calls /auth/status with Authorization: Bearer <token>.
 */
export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    // If no token in localStorage, skip network call and return unauthenticated
    const token = localStorage.getItem("bearer_token");
    if (!token) {
      return { isAuthenticated: false, user: null };
    }
    return await getAuthStatus();
  } catch (err: unknown) {
    if (axios.isAxiosError<AuthStatusResponse>(err) && err.response?.data) {
      return err.response.data as AuthStatusResponse;
    }
    return { isAuthenticated: false, user: null };
  }
};

/**
 * Terminates the token session on the server and clears the local bearer token.
 */
export const logoutUser = async (): Promise<void> => {
  try {
    await logoutRequest();
  } finally {
    localStorage.removeItem("bearer_token");
  }
};

/**
 * Start OAuth on the backend as a top-level navigation. Its response forwards
 * Better Auth's state cookies in a first-party context, including in browsers
 * that block third-party cookies. API requests after login use the bearer token.
 */
export const redirectToGoogleLogin = async (): Promise<void> => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  window.location.assign(`${backendUrl.replace(/\/+$/, "")}/auth/google`);
};
