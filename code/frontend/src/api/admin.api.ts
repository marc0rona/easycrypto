import type { AdminUser, AdminUserRole, AdminUserStatus } from '../types/admin';
import { apiClient } from './client';

export interface CreateAdminPayload {
  email: string;
  name: string;
  password: string;
  username: string;
}

export interface UpdateUserStatusPayload {
  status: AdminUserStatus;
}

export interface UpdateUserAccountPayload {
  email: string;
  name: string;
  username: string;
}

interface ApiResponse<TData> {
  data: TData;
  success: boolean;
}

interface BackendAdminUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'DISABLED';
  username: string;
}

function mapUserRole(role: BackendAdminUser['role']): AdminUserRole {
  return role === 'ADMIN' ? 'admin' : 'user';
}

function mapUserStatus(status: BackendAdminUser['status']): AdminUserStatus {
  return status === 'ACTIVE' ? 'active' : 'disabled';
}

function mapAdminUser(user: BackendAdminUser): AdminUser {
  return {
    createdAt: user.createdAt,
    email: user.email,
    id: user.id,
    name: user.name,
    role: mapUserRole(user.role),
    status: mapUserStatus(user.status),
    username: user.username,
  };
}

export async function getUsers() {
  const response = await apiClient.get<ApiResponse<BackendAdminUser[]>>('/admin/users');
  return response.data.data.map(mapAdminUser);
}

export async function createAdmin(data: CreateAdminPayload) {
  const response = await apiClient.post<ApiResponse<BackendAdminUser>>('/admin/users/admins', {
    email: data.email.trim().toLowerCase(),
    name: data.name.trim(),
    password: data.password,
    username: data.username.trim(),
  });

  return mapAdminUser(response.data.data);
}

export async function updateUserAccount(id: string, data: UpdateUserAccountPayload) {
  const response = await apiClient.patch<ApiResponse<BackendAdminUser>>(`/admin/users/${id}`, {
    email: data.email.trim().toLowerCase(),
    name: data.name.trim(),
    username: data.username.trim(),
  });

  return mapAdminUser(response.data.data);
}

export async function updateUserStatus(id: string, status: AdminUserStatus) {
  const response = await apiClient.patch<ApiResponse<BackendAdminUser>>(`/admin/users/${id}/status`, {
    status,
  });

  return mapAdminUser(response.data.data);
}
