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

const portValue = getRequiredEnv('PORT');
const parsedPort = Number(portValue);

if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
  throw new Error('Invalid environment variable: PORT must be a positive integer');
}

const nodeEnvValue = getRequiredEnv('NODE_ENV');
const databaseUrl = getRequiredEnv('DATABASE_URL');
const jwtSecret = getRequiredEnv('JWT_SECRET');
const jwtExpiresIn = getRequiredEnv('JWT_EXPIRES_IN');

if (!VALID_NODE_ENVS.includes(nodeEnvValue as NodeEnv)) {
  throw new Error(
    `Invalid environment variable: NODE_ENV must be one of ${VALID_NODE_ENVS.join(', ')}`,
  );
}

export interface EnvConfig {
  port: number;
  nodeEnv: NodeEnv;
  corsOrigin: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  isDevelopment: boolean;
}

export const env: EnvConfig = {
  port: parsedPort,
  nodeEnv: nodeEnvValue as NodeEnv,
  corsOrigin: 'http://localhost:5173',
  databaseUrl,
  jwtSecret,
  jwtExpiresIn,
  isDevelopment: nodeEnvValue === 'development',
};
