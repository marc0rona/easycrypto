import type { AdminUser, AdminUserStatus } from '../types/admin';

import { resolveMock } from './client';

export interface UpdateUserStatusPayload {
  status: AdminUserStatus;
}

export interface DeleteUserResponse {
  id: string;
  success: boolean;
}

let mockUsers: AdminUser[] = [
  {
    id: 'user-1',
    username: 'driss_workspace',
    email: 'driss@ez-crypt0.app',
    status: 'active',
  },
  {
    id: 'user-2',
    username: 'alpha_trader',
    email: 'alpha@ez-crypt0.app',
    status: 'active',
  },
  {
    id: 'user-3',
    username: 'cold_storage_ops',
    email: 'ops@ez-crypt0.app',
    status: 'disabled',
  },
];

function cloneUser(user: AdminUser): AdminUser {
  return { ...user };
}

export async function getUsers() {
  return resolveMock(mockUsers.map(cloneUser));
}

export async function updateUserStatus(id: string, status: AdminUserStatus) {
  let updatedUser: AdminUser | null = null;

  mockUsers = mockUsers.map((user) => {
    if (user.id !== id) {
      return user;
    }

    updatedUser = {
      ...user,
      status,
    };

    return updatedUser;
  });

  return resolveMock(cloneUser(updatedUser ?? mockUsers[0]));
}

export async function deleteUser(id: string) {
  mockUsers = mockUsers.filter((user) => user.id !== id);

  return resolveMock<DeleteUserResponse>({
    id,
    success: true,
  });
}
