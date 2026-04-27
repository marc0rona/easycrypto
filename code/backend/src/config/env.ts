import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const VALID_NODE_ENVS = ['development', 'test', 'production'] as const;

type NodeEnv = (typeof VALID_NODE_ENVS)[number];

const getRequiredEnv = (
  key:
    | 'PORT'
    | 'NODE_ENV'
    | 'DATABASE_URL'
    | 'JWT_SECRET'
    | 'JWT_EXPIRES_IN',
): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getOptionalEnv = (
  key: 'JWT_REFRESH_SECRET' | 'JWT_REFRESH_EXPIRES_IN',
): string | undefined => {
  const value = process.env[key]?.trim();

  return value || undefined;
};

const portValue = getRequiredEnv('PORT');
const parsedPort = Number(portValue);

if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
  throw new Error('Invalid environment variable: PORT must be a positive integer');
}

const nodeEnvValue = getRequiredEnv('NODE_ENV');
const databaseUrl = getRequiredEnv('DATABASE_URL');
const jwtSecret = getRequiredEnv('JWT_SECRET');
const jwtExpiresIn = getRequiredEnv('JWT_EXPIRES_IN');
const jwtRefreshSecret = getOptionalEnv('JWT_REFRESH_SECRET') ?? jwtSecret;
const jwtRefreshExpiresIn = getOptionalEnv('JWT_REFRESH_EXPIRES_IN') ?? '30d';
const corsOrigin = process.env.CORS_ORIGIN?.trim() || 'http://localhost:5173';

if (!VALID_NODE_ENVS.includes(nodeEnvValue as NodeEnv)) {
  throw new Error(
    `Invalid environment variable: NODE_ENV must be one of ${VALID_NODE_ENVS.join(', ')}`,
  );
}

export interface EnvConfig {
  port: number;
  nodeEnv: NodeEnv;
  corsOrigin: string;
  allowedCorsOrigins: string[];
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  isDevelopment: boolean;
}

const allowedCorsOrigins = Array.from(
  new Set(
    corsOrigin
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  ),
);

export const env: EnvConfig = {
  port: parsedPort,
  nodeEnv: nodeEnvValue as NodeEnv,
  corsOrigin,
  allowedCorsOrigins,
  databaseUrl,
  jwtSecret,
  jwtExpiresIn,
  jwtRefreshSecret,
  jwtRefreshExpiresIn,
  isDevelopment: nodeEnvValue === 'development',
};
