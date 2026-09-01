import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * AdminRoute Guard
 * Only allows users with role === 'admin' to access the child components.
 * Otherwise redirects to /login (with state for admin tab) or displays access denied.
 */
export const AdminRoute = ({ children }) => {
  const { currentUser, userProfile, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner text="Verifying administrator credentials..." />
      </div>
    );
  }

  if (!currentUser || !isAdmin) {
    return <Navigate to="/login" state={{ from: location, tab: 'admin' }} replace />;
  }

  return children;
};
