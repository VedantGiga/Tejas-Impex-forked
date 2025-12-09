import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSupplier?: boolean;
  requireUser?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  requireSupplier = false,
  requireUser = false 
}: ProtectedRouteProps) {
  const { user, isAdmin, isSupplier, isUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireSupplier && !isSupplier) {
    return <Navigate to="/" replace />;
  }

  if (requireUser && !isUser && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
