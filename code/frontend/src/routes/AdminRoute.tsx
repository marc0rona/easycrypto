import type { PropsWithChildren, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { Loader } from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';

export interface AdminRouteProps extends PropsWithChildren {
  children?: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-50">
        <Loader className="min-h-screen" message="Loading application..." />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate replace to="/dashboard" />;
  }

  return children ?? <Outlet />;
}
