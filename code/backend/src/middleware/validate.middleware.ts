import { NextFunction, Request } from 'express';
import { ZodType } from 'zod';

import { AppError } from '../utils/AppError';

const formatValidationErrors = (issues: Array<{ path: PropertyKey[]; message: string }>): string[] =>
  issues.map((issue) => {
    if (!issue.path.length) {
      return issue.message;
    }

    return `${issue.path.join('.')}: ${issue.message}`;
  });

export const validateBody =
  <T>(schema: ZodType<T>) =>
  (req: Request, _res: unknown, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      next(
        new AppError(
          'Validation error',
          400,
          formatValidationErrors(result.error.issues),
        ),
      );
      return;
    }

    req.body = result.data;
    next();
  };
