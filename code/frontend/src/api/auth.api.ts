import { resolveMock } from './client';

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
  role: UserRole;
  username: string;
}

export interface AuthResponse {
  user: CurrentUser;
}

export interface LogoutResponse {
  success: boolean;
}

let mockCurrentUser: CurrentUser | null = null;

export async function login(data: LoginPayload) {
  mockCurrentUser = {
    id: mockCurrentUser?.id ?? `user-${Date.now()}`,
    username: data.email.includes('admin') ? 'admin_control' : 'driss_workspace',
    email: data.email,
    role: data.email.includes('admin') ? 'admin' : 'user',
  };

  return resolveMock<AuthResponse>({
    user: mockCurrentUser,
  });
}

export async function register(data: RegisterPayload) {
  mockCurrentUser = {
    id: `user-${Date.now()}`,
    username: data.username,
    email: data.email,
    role: 'user',
  };

  return resolveMock<AuthResponse>({
    user: mockCurrentUser,
  });
}

export async function logout() {
  mockCurrentUser = null;

  return resolveMock<LogoutResponse>({
    success: true,
  });
}

export async function getCurrentUser() {
  return resolveMock<CurrentUser | null>(mockCurrentUser);
}
