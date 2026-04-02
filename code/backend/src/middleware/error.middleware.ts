import { NextFunction, Request, Response } from 'express';

import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface ErrorWithStatusCode {
  message: string;
  statusCode: number;
  errors?: string[];
}

const hasStatusCode = (error: unknown): error is ErrorWithStatusCode =>
  typeof error === 'object' &&
  error !== null &&
  'statusCode' in error &&
  typeof error.statusCode === 'number' &&
  'message' in error &&
  typeof error.message === 'string';

export const notFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  next(new AppError('Route not found', 404));
};

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const isKnownError = error instanceof AppError || hasStatusCode(error);
  const statusCode = isKnownError ? error.statusCode : 500;
  const message = isKnownError
    ? error.message
    : 'Internal Server Error';
  const stack = error instanceof Error ? error.stack : undefined;

  if (statusCode >= 500) {
    logger.error(stack ?? message);
  } else {
    logger.error(`${statusCode} ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isKnownError && error.errors?.length ? { errors: error.errors } : {}),
    ...(env.isDevelopment && stack ? { stack } : {}),
  });
};
