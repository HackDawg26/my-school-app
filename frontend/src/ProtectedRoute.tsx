import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

interface Props {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );

  if (!user || !user.role) return <Navigate to="/login" replace />;

  const role = user.role.toUpperCase();

  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
