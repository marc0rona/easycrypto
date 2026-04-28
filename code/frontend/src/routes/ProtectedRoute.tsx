import type { PropsWithChildren, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { Loader } from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';

export interface ProtectedRouteProps extends PropsWithChildren {
  children?: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Loader className="min-h-screen" message="Loading application..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  if (user?.role === 'admin') {
    return <Navigate replace to="/admin" />;
  }

  return children ?? <Outlet />;
}
