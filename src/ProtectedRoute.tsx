import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface Props {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const location = useLocation();
  
  // In a real app, you get this from your Auth Context or Redux store
  const user = { 
    isLoggedIn: true, 
    role: 'STUDENT' // Example: This would come from your decoded JWT token
  };

  if (!user.isLoggedIn) {
    // If not logged in, send them to login but remember where they tried to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If they have the wrong role, send to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // If all is good, render the "child" routes (the Outlet)
  return <Outlet />;
};

export default ProtectedRoute;