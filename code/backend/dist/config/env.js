"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ quiet: true });
const VALID_NODE_ENVS = ['development', 'test', 'production'];
const getRequiredEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
const getOptionalEnv = (key) => {
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
if (!VALID_NODE_ENVS.includes(nodeEnvValue)) {
    throw new Error(`Invalid environment variable: NODE_ENV must be one of ${VALID_NODE_ENVS.join(', ')}`);
}
const allowedCorsOrigins = Array.from(new Set(corsOrigin
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)));
exports.env = {
    port: parsedPort,
    nodeEnv: nodeEnvValue,
    corsOrigin,
    allowedCorsOrigins,
    databaseUrl,
    jwtSecret,
    jwtExpiresIn,
    jwtRefreshSecret,
    jwtRefreshExpiresIn,
    isDevelopment: nodeEnvValue === 'development',
};
