import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can show a spinner or nothing while checking auth
    return <div className="text-center p-10">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin?message=Please sign in to access this page" />;
  }

  return <Outlet />;
};
export default ProtectedRoute;
