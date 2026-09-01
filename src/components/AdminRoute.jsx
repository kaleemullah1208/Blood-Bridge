import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * AdminRoute — wraps admin routes ensuring authentication loading completes.
 * AdminDashboardPage handles self-contained authentication and authorization views.
 */
export const AdminRoute = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying admin access..." />;
  }

  return children;
};

