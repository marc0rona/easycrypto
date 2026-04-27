import { Prisma, Role, Status } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';

interface RegisterUserInput {
  email?: unknown;
  name?: unknown;
  username?: unknown;
  password?: unknown;
}

interface SafeUser {
  id: string;
  email: string;
  name: string;
  username: string;
  role: Role;
}

interface LoginUserInput {
  email?: unknown;
  password?: unknown;
}

interface AuthSessionResponse {
  token: string;
  refreshToken: string;
  user: SafeUser;
}

interface RefreshTokenPayload {
  role?: unknown;
  tokenType?: unknown;
  userId?: unknown;
}

interface UpdateProfileInput {
  email?: unknown;
  name?: unknown;
}

interface ChangePasswordInput {
  currentPassword?: unknown;
  newPassword?: unknown;
}

const SALT_ROUNDS = 12;

const createBadRequestError = (message: string): AppError =>
  new AppError(message, 400);

const createUnauthorizedError = (message: string): AppError =>
  new AppError(message, 401);

const createForbiddenError = (message: string): AppError =>
  new AppError(message, 403);

class AuthService {
  private createAccessToken(userId: string, role: Role): string {
    return jwt.sign(
      {
        userId,
        role,
        tokenType: 'access',
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
      },
    );
  }

  private createRefreshToken(userId: string, role: Role): string {
    return jwt.sign(
      {
        userId,
        role,
        tokenType: 'refresh',
      },
      env.jwtRefreshSecret,
      {
        expiresIn: env.jwtRefreshExpiresIn as SignOptions['expiresIn'],
      },
    );
  }

  private createSession(user: SafeUser): AuthSessionResponse {
    return {
      token: this.createAccessToken(user.id, user.role),
      refreshToken: this.createRefreshToken(user.id, user.role),
      user,
    };
  }

  private assertUserStatus(status: Status): void {
    if (status === Status.DISABLED) {
      throw createForbiddenError('User account is disabled');
    }

    if (status === Status.BANNED) {
      throw createForbiddenError('User account is banned');
    }
  }

  private async getCurrentSafeUser(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw createUnauthorizedError('Unauthorized');
    }

    this.assertUserStatus(user.status);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
    };
  }

  async registerUser(input: RegisterUserInput): Promise<AuthSessionResponse> {
    const email =
      typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const username =
      typeof input.username === 'string' ? input.username.trim() : '';
    const name =
      typeof input.name === 'string' && input.name.trim()
        ? input.name.trim()
        : username;
    const password =
      typeof input.password === 'string' ? input.password : '';

    if (!email || !username || !name || !password.trim()) {
      throw createBadRequestError('Email, username, and password are required');
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
      const createdUser = await prisma.user.create({
        data: {
          email,
          name,
          username,
          password: hashedPassword,
          role: Role.USER,
          status: Status.ACTIVE,
        },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
        },
      });

      return this.createSession(createdUser);
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

  async loginUser(input: LoginUserInput): Promise<AuthSessionResponse> {
    const email =
      typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const password =
      typeof input.password === 'string' ? input.password : '';

    if (!email || !password.trim()) {
      throw createBadRequestError('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        password: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      throw createUnauthorizedError('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw createUnauthorizedError('Invalid credentials');
    }

    this.assertUserStatus(user.status);

    return this.createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  }

  async refreshUserSession(refreshToken: string): Promise<AuthSessionResponse> {
    let payload: RefreshTokenPayload;

    try {
      payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as RefreshTokenPayload;
    } catch (_error) {
      throw createUnauthorizedError('Unauthorized');
    }

    if (
      typeof payload.userId !== 'string' ||
      payload.tokenType !== 'refresh' ||
      (payload.role !== Role.USER && payload.role !== Role.ADMIN)
    ) {
      throw createUnauthorizedError('Unauthorized');
    }

    const user = await this.getCurrentSafeUser(payload.userId);

    return this.createSession(user);
  }

  async getCurrentUser(userId: string): Promise<SafeUser> {
    return this.getCurrentSafeUser(userId);
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
    const email =
      typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const name = typeof input.name === 'string' ? input.name.trim() : '';

    if (!email || !name) {
      throw createBadRequestError('Email and name are required');
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        id: true,
        status: true,
      },
    });

    if (!currentUser) {
      throw createUnauthorizedError('Unauthorized');
    }

    this.assertUserStatus(currentUser.status);

    if (email !== currentUser.email) {
      const existingEmailUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingEmailUser && existingEmailUser.id !== userId) {
        throw createBadRequestError('Email already exists');
      }
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          email,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw createBadRequestError('Email already exists');
      }

      throw error;
    }
  }

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const currentPassword =
      typeof input.currentPassword === 'string' ? input.currentPassword : '';
    const newPassword =
      typeof input.newPassword === 'string' ? input.newPassword : '';

    if (!currentPassword.trim() || !newPassword.trim()) {
      throw createBadRequestError('Current password and new password are required');
    }

    if (newPassword.trim().length < 6) {
      throw createBadRequestError('Password must be at least 6 characters long');
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
        status: true,
      },
    });

    if (!user) {
      throw createUnauthorizedError('Unauthorized');
    }

    this.assertUserStatus(user.status);

    const passwordMatches = await bcrypt.compare(currentPassword, user.password);

    if (!passwordMatches) {
      throw createUnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }
}

export const authService = new AuthService();
