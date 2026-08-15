import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";

/**
 * UI Layer — SignIn
 *
 * Shows Google OAuth sign-in only (no email/password backend exists).
 *
 * Auth flow:
 *  1. User clicks "Continue with Google"
 *  2. login() → redirectToGoogleLogin() → browser navigates to /auth/google
 *  3. Backend redirects to Google, Google redirects back to /auth/google/callback
 *  4. Backend sets session, redirects to /profile?status=success
 *  5. AuthProvider detects ?status=success, re-runs checkAuthStatus()
 *  6. isAuthenticated becomes true → ProtectedRoute allows /profile
 *
 * If already authenticated when landing on this page, redirect immediately to /profile.
 */
export default function SignIn() {
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login, loading } = useAuth();

  // If already authenticated (e.g. user navigated to /signin while logged in),
  // send them to their profile immediately.
  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  // Show any message passed in the URL query (e.g. from ProtectedRoute redirect)
  useEffect(() => {
    setError(message ?? null);
  }, [message]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Don't render the sign-in form if already authenticated
  // (the useEffect above will redirect, but guard render too)
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Error / info message from URL param */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Google OAuth — the only sign-in method */}
        <div>
          <button
            onClick={login}
            className="w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
