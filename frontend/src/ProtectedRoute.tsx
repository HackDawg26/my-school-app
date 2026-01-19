import { Navigate, Outlet } from 'react-router-dom';


import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isLoading } = useAuth();

  // 1. VERY IMPORTANT: Wait for the "Brain" to wake up
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 2. If no user is logged in at all
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If user exists but their role isn't in the list
  // Note: console.log here to debug!
  console.log("Current User Role:", user.role);
  console.log("Allowed Roles:", allowedRoles);


  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }


  return <Outlet />;
};

export default ProtectedRoute;