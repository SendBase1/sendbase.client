import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { ProcessingLogin, InitializingSession } from './AuthTransition';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const { inProgress } = useMsal();
  const location = useLocation();

  // Show branded loading while MSAL is processing (login redirect, etc.)
  if (inProgress !== InteractionStatus.None) {
    return <ProcessingLogin />;
  }

  // Show branded loading while checking auth state
  if (isLoading) {
    return <ProcessingLogin />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show initializing screen while backend session is being set up
  if (!isInitialized) {
    return <InitializingSession />;
  }

  return <>{children}</>;
}
