import axios from "axios";
import { getAuthStatus, logoutRequest } from "../api/authApi";
import { AuthStatusResponse } from "../types";

/**
 * Service Layer — Auth
 * Business logic for same-origin cookie sessions.
 */

/**
 * Checks the session through a credentialed same-origin request.
 */
export const checkAuthStatus = async (): Promise<AuthStatusResponse> => {
  try {
    return await getAuthStatus();
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 401) return { isAuthenticated: false, user: null };
    throw err;
  }
};

/**
 * Revokes the server session; the response expires its HttpOnly cookie.
 */
export const logoutUser = async (): Promise<void> => {
  await logoutRequest();
};

/**
 * Start OAuth on the backend as a top-level navigation. Its response forwards
 * Better Auth's state cookies in a first-party context, including in browsers
 * that block third-party cookies. API requests after login use cookies.
 */
export const redirectToGoogleLogin = async (): Promise<void> => {
  window.location.assign("/backend/auth/google");
};
