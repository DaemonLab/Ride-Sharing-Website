import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { User } from "../types";
import {
  checkAuthStatus,
  logoutUser,
  redirectToGoogleLogin,
} from "../services/authService";

/**
 * UI Layer — AuthProvider (HttpOnly cookie sessions)
 *
 * Owns the global auth state (user, isAuthenticated, loading, error).
 * Populates AuthContext so any component using useAuth() can read the state.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();

  /** Remove legacy token material, then validate the cookie session. */
  const checkAuthStatusHandler = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      // Remove legacy browser tokens during the cookie-session migration.
      try { localStorage.removeItem("bearer_token"); } catch { /* Storage may be disabled; cookie auth still works. */ }
      if (window.location.pathname === "/auth/callback") {
        params.delete("token");
        const remaining = params.toString() ? `?${params.toString()}` : "";
        window.history.replaceState({}, document.title, window.location.pathname + remaining);
      }

      const { isAuthenticated: authed, user: userData } = await checkAuthStatus();
      setIsAuthenticated(authed);
      setUser(userData);
      if (authed && window.location.search.includes("status=")) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch {
      setError("Auth check failed");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatusHandler();
  }, [location.search, checkAuthStatusHandler]);

  /** Redirects to Google OAuth */
  const login = async () => {
    await redirectToGoogleLogin();
  };

  /** Destroys the token session and clears local auth state */
  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      setUser(null);
    } catch {
      setError("Unable to sign out. Please try again.");
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
