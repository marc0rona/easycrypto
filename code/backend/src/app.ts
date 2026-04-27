import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import apiRouter from './routes';
import { AppError } from './utils/AppError';
import { logger } from './utils/logger';

const app = express();

const chromeExtensionOriginPattern = /^chrome-extension:\/\/[a-p]{32}$/;
const localDevelopmentOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const isAllowedOrigin = (origin: string): boolean =>
  env.allowedCorsOrigins.includes(origin) ||
  (env.isDevelopment && localDevelopmentOriginPattern.test(origin)) ||
  chromeExtensionOriginPattern.test(origin);

const createRateLimitMessage = (message: string) => ({
  success: false,
  message,
});

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitMessage('Too many requests, please try again later.'),
});

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: createRateLimitMessage(
    'Too many authentication attempts, please try again in a minute.',
  ),
});

app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

app.use(helmet());
app.use(globalRateLimiter);
app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError(`CORS origin denied: ${origin}`, 403));
    },
    credentials: true,
  }),
);
app.use(express.json());

app.use('/api/v1', apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
