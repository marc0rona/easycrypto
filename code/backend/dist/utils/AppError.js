"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode, errors) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
exports.AppError = AppError;
