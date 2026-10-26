import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { User } from "../types";
import { authClient } from "../lib/authClient";

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
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const { data: session, isPending, refetch } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user);
  const user: User | null = session?.user
    ? {
        id: String(session.user.id),
        name: session.user.name ?? "",
        email: session.user.email,
        phone: "",
        profilePicture: session.user.image ?? undefined,
      }
    : null;

  useEffect(() => {
    if (isAuthenticated && location.search.includes("status=")) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [isAuthenticated, location.pathname, location.search]);

  const login = () => {
    setError(null);
    void authClient.signIn
      .social({
        provider: "google",
        callbackURL: `${window.location.origin}/profile?status=success`,
      })
      .then(({ error: signInError }) => {
        if (signInError) setError(signInError.message);
      })
      .catch(() => setError("Google sign-in failed. Please try again."));
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      await refetch();
      setError(null);
    } catch {
      setError("Logout failed");
    }
  };

  const checkAuthStatusHandler = async () => {
    setError(null);
    try {
      await refetch();
    } catch {
      setError("Auth check failed");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading: isPending,
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
