"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const env_1 = require("../config/env");
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const hasStatusCode = (error) => typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number' &&
    'message' in error &&
    typeof error.message === 'string';
const notFoundHandler = (_req, _res, next) => {
    next(new AppError_1.AppError('Route not found', 404));
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (error, _req, res, next) => {
    if (res.headersSent) {
        next(error);
        return;
    }
    const isKnownError = error instanceof AppError_1.AppError || hasStatusCode(error);
    const statusCode = isKnownError ? error.statusCode : 500;
    const message = isKnownError
        ? error.message
        : 'Internal Server Error';
    const stack = error instanceof Error ? error.stack : undefined;
    if (statusCode >= 500) {
        logger_1.logger.error(stack ?? message);
    }
    else {
        logger_1.logger.error(`${statusCode} ${message}`);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(isKnownError && error.errors?.length ? { errors: error.errors } : {}),
        ...(env_1.env.isDevelopment && stack ? { stack } : {}),
    });
};
exports.errorHandler = errorHandler;
