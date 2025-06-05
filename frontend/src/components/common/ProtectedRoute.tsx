import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants';
import { PageLayout } from '../layout/PageLayout'; // Import PageLayout
import { Spinner } from '../ui/Spinner'; // Import Spinner

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <PageLayout> {/* Wrap spinner in PageLayout to maintain structure */}
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated() || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role is not allowed, redirect to a generic page or home
    // Potentially show an "Unauthorized" page
    // For simplicity, redirecting to their default dashboard or home.
    let redirectPath = '/'; // Default fallback
    if (user.role === ROLES.ADMIN) redirectPath = '/admin/dashboard';
    else if (user.role === ROLES.DOCTOR) redirectPath = '/doctor/dashboard';
    else if (user.role === ROLES.PARENT) redirectPath = '/parent/dashboard';
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // User is authenticated and has the required role (if specified)
  // Render the PageLayout هنا to ensure sidebar is present for protected routes
  return (
    <PageLayout>
      <Outlet /> {/* This will render the child route component */}
    </PageLayout>
  );
};

export { ProtectedRoute };