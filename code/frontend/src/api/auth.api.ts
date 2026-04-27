import type { ApiErrorWithMessage } from './client';
import { apiClient } from './client';

export type UserRole = 'user' | 'admin';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export interface CurrentUser {
  email: string;
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface AuthResponse {
  user: CurrentUser;
}

export interface LogoutResponse {
  success: boolean;
}

export interface UpdateProfilePayload {
  email: string;
  name: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
}

interface ApiResponse<TData> {
  data: TData;
  success: boolean;
}

interface BackendUser {
  email: string;
  id: string;
  name: string;
  role: 'USER' | 'ADMIN';
  username: string;
}

interface AuthSessionPayload {
  token: string;
  user: BackendUser;
}

let currentSessionUser: CurrentUser | null = null;

function mapCurrentUser(user: BackendUser): CurrentUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role === 'ADMIN' ? 'admin' : 'user',
  };
}

function setCurrentSessionUser(user: CurrentUser | null) {
  currentSessionUser = user;
  return currentSessionUser;
}

export async function login(data: LoginPayload) {
  const response = await apiClient.post<ApiResponse<AuthSessionPayload>>('/auth/login', data);
  const user = mapCurrentUser(response.data.data.user);

  setCurrentSessionUser(user);

  return {
    user,
  } satisfies AuthResponse;
}

export async function register(data: RegisterPayload) {
  const response = await apiClient.post<ApiResponse<AuthSessionPayload>>('/auth/register', data);
  const user = mapCurrentUser(response.data.data.user);

  setCurrentSessionUser(user);

  return {
    user,
  } satisfies AuthResponse;
}

export async function logout() {
  await apiClient.post<ApiResponse<{ success: boolean }>>('/auth/logout');
  setCurrentSessionUser(null);

  return {
    success: true,
  } satisfies LogoutResponse;
}

export async function getCurrentUser() {
  try {
    const response = await apiClient.get<ApiResponse<BackendUser>>('/auth/me');
    const user = mapCurrentUser(response.data.data);

    setCurrentSessionUser(user);

    return user;
  } catch (error) {
    if ((error as Partial<ApiErrorWithMessage>).status === 401) {
      setCurrentSessionUser(null);
      return null;
    }

    throw error;
  }
}

export async function updateProfile(data: UpdateProfilePayload) {
  const response = await apiClient.patch<ApiResponse<BackendUser>>('/auth/me', {
    email: data.email.trim().toLowerCase(),
    name: data.name.trim(),
  });
  const updatedUser = mapCurrentUser(response.data.data);

  setCurrentSessionUser(updatedUser);

  return updatedUser;
}

export async function changePassword(data: ChangePasswordPayload) {
  const response = await apiClient.patch<ApiResponse<ChangePasswordResponse>>('/auth/password', {
    currentPassword: data.currentPassword,
    newPassword: data.newPassword,
  });

  return response.data.data;
}
