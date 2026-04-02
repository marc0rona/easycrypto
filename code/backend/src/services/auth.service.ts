import { Prisma, Role, Status } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';
import prisma from '../config/prisma';
import { AppError } from '../utils/AppError';

interface RegisterUserInput {
  email?: unknown;
  username?: unknown;
  password?: unknown;
}

interface SafeUser {
  id: string;
  email: string;
  username: string;
  role: Role;
}

interface LoginUserInput {
  email?: unknown;
  password?: unknown;
}

interface LoginResponse {
  token: string;
  user: SafeUser;
}

const SALT_ROUNDS = 12;

const createBadRequestError = (message: string): AppError =>
  new AppError(message, 400);

const createUnauthorizedError = (message: string): AppError =>
  new AppError(message, 401);

const createForbiddenError = (message: string): AppError =>
  new AppError(message, 403);

class AuthService {
  async registerUser(input: RegisterUserInput): Promise<SafeUser> {
    const email =
      typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    const username =
      typeof input.username === 'string' ? input.username.trim() : '';
    const password =
      typeof input.password === 'string' ? input.password : '';

    if (!email || !username || !password.trim()) {
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
      return await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          role: Role.USER,
          status: Status.ACTIVE,
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
        },
      });
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

  async loginUser(input: LoginUserInput): Promise<LoginResponse> {
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

    if (user.status === Status.DISABLED) {
      throw createForbiddenError('User account is disabled');
    }

    if (user.status === Status.BANNED) {
      throw createForbiddenError('User account is banned');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      env.jwtSecret,
      {
        expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
      },
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
