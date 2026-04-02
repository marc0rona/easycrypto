import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { AuthenticatedUser } from '../types';
import { AppError } from '../utils/AppError';

interface JwtPayload {
  userId?: unknown;
  role?: unknown;
}

const createUnauthorizedError = (): AppError =>
  new AppError('Unauthorized', 401);

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    next(createUnauthorizedError());
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  if (!token) {
    next(createUnauthorizedError());
    return;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('userId' in decoded) ||
      !('role' in decoded)
    ) {
      next(createUnauthorizedError());
      return;
    }

    const payload = decoded as JwtPayload;

    if (
      typeof payload.userId !== 'string' ||
      (payload.role !== 'USER' && payload.role !== 'ADMIN')
    ) {
      next(createUnauthorizedError());
      return;
    }

    const authenticatedUser: AuthenticatedUser = {
      id: payload.userId,
      role: payload.role,
    };

    req.user = authenticatedUser;
  } catch (_error) {
    next(createUnauthorizedError());
    return;
  }

  next();
};
