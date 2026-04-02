import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '../layouts/AdminLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PublicLayout } from '../layouts/PublicLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { SystemStatusPage } from '../pages/admin/SystemStatusPage';
import { UsersPage } from '../pages/admin/UsersPage';
import { AddressesPage } from '../pages/dashboard/AddressesPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { ProfilePage } from '../pages/dashboard/ProfilePage';
import { DownloadPage } from '../pages/public/DownloadPage';
import { InstallPage } from '../pages/public/InstallPage';
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { AdminRoute } from './AdminRoute';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="/download" element={<DownloadPage />} />
        <Route path="/install" element={<InstallPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="addresses" element={<AddressesPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="system" element={<SystemStatusPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
