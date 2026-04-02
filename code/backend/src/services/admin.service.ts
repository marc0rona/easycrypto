import { Status } from '@prisma/client';

import prisma from '../config/prisma';
import { MessageResponse } from '../types';
import { AppError } from '../utils/AppError';

interface AdminUserRecord {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';
  status: Status;
  createdAt: Date;
}

interface AdminUsersResponse {
  data: AdminUserRecord[];
}

interface AdminUserResponse {
  data: AdminUserRecord;
}

interface UpdateUserStatusInput {
  status?: unknown;
}

const createBadRequestError = (message: string): AppError =>
  new AppError(message, 400);
const createNotFoundError = (message: string): AppError =>
  new AppError(message, 404);

class AdminService {
  async getUsers(): Promise<AdminUsersResponse> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: users,
    };
  }

  async updateUserStatus(
    adminId: string,
    userId: string,
    input: UpdateUserStatusInput,
  ): Promise<AdminUserResponse> {
    const status =
      typeof input.status === 'string' ? input.status.trim().toUpperCase() : '';

    if (!status) {
      throw createBadRequestError('Status is required');
    }

    if (!Object.values(Status).includes(status as Status)) {
      throw createBadRequestError('Invalid status value');
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      throw createNotFoundError('User not found');
    }

    if (existingUser.id === adminId) {
      throw createBadRequestError('Admin cannot update their own status');
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: status as Status,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      data: updatedUser,
    };
  }

  async deleteUser(adminId: string, userId: string): Promise<MessageResponse> {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!existingUser) {
      throw createNotFoundError('User not found');
    }

    if (existingUser.id === adminId) {
      throw createBadRequestError('Admin cannot delete their own account');
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}

export const adminService = new AdminService();
