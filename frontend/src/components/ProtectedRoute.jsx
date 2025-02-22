import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!token) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Role not authorized, redirect to home page
    return <Navigate to="/" />;
  }

  // Authorized, render children
  return children;
}

export default ProtectedRoute; 