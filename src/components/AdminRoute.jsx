import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * AdminRoute — ensures only authenticated administrators can access Admin & Operations routes.
 * Non-admin visitors or regular users attempting to enter the URL directly are safely redirected.
 */
export const AdminRoute = ({ children }) => {
  const { loading, isAdmin, currentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying administrator authorization..." />;
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
};
