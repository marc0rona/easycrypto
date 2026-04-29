"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middleware/error.middleware");
const routes_1 = __importDefault(require("./routes"));
const AppError_1 = require("./utils/AppError");
const logger_1 = require("./utils/logger");
const app = (0, express_1.default)();
const chromeExtensionOriginPattern = /^chrome-extension:\/\/[a-p]{32}$/;
const localDevelopmentOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const isAllowedOrigin = (origin) => env_1.env.allowedCorsOrigins.includes(origin) ||
    (env_1.env.isDevelopment && localDevelopmentOriginPattern.test(origin)) ||
    chromeExtensionOriginPattern.test(origin);
const createRateLimitMessage = (message) => ({
    success: false,
    message,
});
const globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: createRateLimitMessage('Too many requests, please try again later.'),
});
const authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: createRateLimitMessage('Too many authentication attempts, please try again in a minute.'),
});
app.use((req, _res, next) => {
    logger_1.logger.info(`${req.method} ${req.originalUrl}`);
    next();
});
app.use((0, helmet_1.default)());
app.use(globalRateLimiter);
app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }
        callback(new AppError_1.AppError(`CORS origin denied: ${origin}`, 403));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use('/api/v1', routes_1.default);
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
exports.default = app;
