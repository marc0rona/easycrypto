"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const AppError_1 = require("../utils/AppError");
const formatValidationErrors = (issues) => issues.map((issue) => {
    if (!issue.path.length) {
        return issue.message;
    }
    return `${issue.path.join('.')}: ${issue.message}`;
});
const validateBody = (schema) => (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        next(new AppError_1.AppError('Validation error', 400, formatValidationErrors(result.error.issues)));
        return;
    }
    req.body = result.data;
    next();
};
exports.validateBody = validateBody;
