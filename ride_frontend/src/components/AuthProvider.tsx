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
 * UI Layer — AuthProvider (Token-Based Authentication)
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

  /** Extracts token from URL if present, then calls /auth/status */
  const checkAuthStatusHandler = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams(window.location.search);
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      const tokenFromUrl = window.location.pathname === "/auth/callback"
        ? fragment.get("token") ?? params.get("token") : null;
      if (tokenFromUrl) {
        localStorage.setItem("bearer_token", tokenFromUrl);
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
    } catch {
      setError("Logout failed");
    } finally {
      localStorage.removeItem("bearer_token");
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
