import type { PropsWithChildren, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';

export interface AdminRouteProps extends PropsWithChildren {
  children?: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!user || user.role !== 'admin') {
    return <Navigate replace to="/dashboard" />;
  }

  return children ?? <Outlet />;
}
