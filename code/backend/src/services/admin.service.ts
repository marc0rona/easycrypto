import { Prisma, Role, Status } from '@prisma/client';
import bcrypt from 'bcrypt';

import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';

interface AdminUserRecord {
  createdAt: Date;
  email: string;
  id: string;
  name: string;
  role: 'USER' | 'ADMIN';
  status: Status;
  username: string;
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

interface CreateAdminInput {
  email?: unknown;
  name?: unknown;
  password?: unknown;
  username?: unknown;
}

interface UpdateUserAccountInput {
  email?: unknown;
  name?: unknown;
  username?: unknown;
}

const SALT_ROUNDS = 12;

const createBadRequestError = (message: string): AppError =>
  new AppError(message, 400);
const createForbiddenError = (message: string): AppError =>
  new AppError(message, 403);
const createNotFoundError = (message: string): AppError =>
  new AppError(message, 404);

const adminUserSelect = {
  createdAt: true,
  email: true,
  id: true,
  name: true,
  role: true,
  status: true,
  username: true,
} satisfies Prisma.UserSelect;

class AdminService {
  async getUsers(): Promise<AdminUsersResponse> {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: adminUserSelect,
    });

    return {
      data: users,
    };
  }

  async createAdmin(input: CreateAdminInput): Promise<AdminUserResponse> {
    const email =
      typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const username =
      typeof input.username === 'string' ? input.username.trim() : '';
    const name = typeof input.name === 'string' ? input.name.trim() : '';
    const password =
      typeof input.password === 'string' ? input.password : '';

    if (!email || !username || !name || !password.trim()) {
      throw createBadRequestError('Name, username, email, and password are required');
    }

    if (username.length < 3) {
      throw createBadRequestError('Username must be at least 3 characters long');
    }

    if (name.length < 2) {
      throw createBadRequestError('Name must be at least 2 characters long');
    }

    if (password.trim().length < 6) {
      throw createBadRequestError('Password must be at least 6 characters long');
    }

    const [existingEmailUser, existingUsernameUser] = await Promise.all([
      prisma.user.findUnique({
        where: { email },
        select: { id: true },
      }),
      prisma.user.findUnique({
        where: { username },
        select: { id: true },
      }),
    ]);

    if (existingEmailUser) {
      throw createBadRequestError('Email already exists');
    }

    if (existingUsernameUser) {
      throw createBadRequestError('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    try {
      const createdAdmin = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: Role.ADMIN,
          status: Status.ACTIVE,
          username,
        },
        select: adminUserSelect,
      });

      return {
        data: createdAdmin,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw createBadRequestError('Email or username already exists');
      }

      throw error;
    }
  }

  async updateUserAccount(
    userId: string,
    input: UpdateUserAccountInput,
  ): Promise<AdminUserResponse> {
    const email =
      typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const username =
      typeof input.username === 'string' ? input.username.trim() : '';
    const name = typeof input.name === 'string' ? input.name.trim() : '';

    if (!email || !username || !name) {
      throw createBadRequestError('Name, username, and email are required');
    }

    if (username.length < 3) {
      throw createBadRequestError('Username must be at least 3 characters long');
    }

    if (name.length < 2) {
      throw createBadRequestError('Name must be at least 2 characters long');
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        id: true,
        username: true,
      },
    });

    if (!currentUser) {
      throw createNotFoundError('User not found');
    }

    const checks = await Promise.all([
      email !== currentUser.email
        ? prisma.user.findUnique({
            where: { email },
            select: { id: true },
          })
        : Promise.resolve(null),
      username !== currentUser.username
        ? prisma.user.findUnique({
            where: { username },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    const [existingEmailUser, existingUsernameUser] = checks;

    if (existingEmailUser && existingEmailUser.id !== userId) {
      throw createBadRequestError('Email already exists');
    }

    if (existingUsernameUser && existingUsernameUser.id !== userId) {
      throw createBadRequestError('Username already exists');
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          email,
          name,
          username,
        },
        select: adminUserSelect,
      });

      return {
        data: updatedUser,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw createBadRequestError('Email or username already exists');
      }

      throw error;
    }
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

    if (status !== Status.ACTIVE && status !== Status.DISABLED) {
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
      select: adminUserSelect,
    });

    return {
      data: updatedUser,
    };
  }

  async deleteUser(): Promise<never> {
    throw createForbiddenError('Deleting users is disabled. Use account status controls instead.');
  }
}

export const adminService = new AdminService();
