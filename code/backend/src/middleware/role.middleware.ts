import { NextFunction, Request, Response } from 'express';

import { AuthenticatedUser } from '../types';
import { AppError } from '../utils/AppError';

const createUnauthorizedError = (): AppError =>
  new AppError('Unauthorized', 401);
const createForbiddenError = (): AppError =>
  new AppError('Forbidden', 403);

export const requireRole =
  (requiredRole: AuthenticatedUser['role']) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(createUnauthorizedError());
      return;
    }

    if (req.user.role !== requiredRole) {
      next(createForbiddenError());
      return;
    }

    next();
  };
