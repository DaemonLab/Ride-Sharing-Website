import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for the auth check to finish before deciding to redirect
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Pass the attempted path in state so SignIn can redirect back after login
    return (
      <Navigate
        to="/signin"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
