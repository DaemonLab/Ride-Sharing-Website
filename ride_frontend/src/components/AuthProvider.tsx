import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { User } from "../types";
import {
  checkAuthStatus,
  logoutUser,
  redirectToGoogleLogin,
} from "../services/authService";

/**
 * UI Layer — AuthProvider
 *
 * Owns the global auth state (user, isAuthenticated, loading, error).
 * Populates AuthContext so any component using useAuth() can read the state.
 *
 * Key behaviour:
 * - Runs checkAuthStatus on mount (restores session after page refresh)
 * - Re-runs checkAuthStatus when the URL contains ?status=success
 *   (this is how we detect the Google OAuth callback redirect back to the frontend)
 * - After logout, always clears local state even if the server call fails
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  /** Calls /auth/status and updates local state accordingly */
  const checkAuthStatusHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      const { isAuthenticated: authed, user: userData } = await checkAuthStatus();
      setIsAuthenticated(authed);
      setUser(userData);
      if (authed && location.search.includes("status=")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      setError("Auth check failed");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Single effect — runs on mount and whenever the query string changes.
  // On every mount we always check auth (restores session after page refresh).
  // On subsequent location.search changes we only re-check if ?status= is present
  // (i.e. the Google OAuth redirect just landed).
  // This avoids two concurrent checkAuthStatus() calls on the initial render
  // when the URL is already /profile?status=success, which caused a race condition
  // where loading briefly went false with isAuthenticated=false → ProtectedRoute
  // kicked the user back to /signin.
  useEffect(() => {
    checkAuthStatusHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  /** Redirects to Google OAuth — no API call, just a browser navigation */
  const login = () => {
    redirectToGoogleLogin();
  };

  /** Destroys the server session and clears local auth state */
  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      setError("Logout failed");
    } finally {
      // Always clear local state even if the server call fails
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        logout,
        checkAuthStatus: checkAuthStatusHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
