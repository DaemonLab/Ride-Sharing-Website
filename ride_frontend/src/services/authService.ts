import axios from "axios";
import { getAuthStatus, logoutRequest } from "../api/authApi";
import { AuthStatusResponse } from "../types";
import { authClient } from "../lib/auth-client";

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
 * Initiates Google OAuth via Better Auth client.
 *
 * Uses authClient.signIn.social() which POSTs directly to Better Auth's
 * /api/auth/sign-in/social endpoint. Better Auth's toNodeHandler sets the
 * OAuth state cookie properly in the browser response before redirecting to
 * Google — avoiding the state_mismatch error that occurs when the state is
 * generated server-side inside an Express handler.
 */
export const redirectToGoogleLogin = async (): Promise<void> => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: `${window.location.origin}/auth/callback`,
  });
};
