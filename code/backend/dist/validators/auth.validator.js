"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordRequired = 'Password is required';
exports.registerSchema = zod_1.z
    .object({
    email: zod_1.z.string().trim().email('Valid email is required'),
    username: zod_1.z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters long'),
    password: zod_1.z
        .string()
        .refine((value) => value.trim().length >= 6, 'Password must be at least 6 characters long'),
})
    .strict();
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.string().trim().email('Valid email is required'),
    password: zod_1.z.string().refine((value) => value.trim().length > 0, passwordRequired),
})
    .strict();
exports.updateProfileSchema = zod_1.z
    .object({
    email: zod_1.z.string().trim().email('Valid email is required'),
    name: zod_1.z
        .string()
        .trim()
        .min(2, 'Name must be at least 2 characters long'),
})
    .strict();
exports.changePasswordSchema = zod_1.z
    .object({
    currentPassword: zod_1.z
        .string()
        .refine((value) => value.trim().length > 0, 'Current password is required'),
    newPassword: zod_1.z
        .string()
        .refine((value) => value.trim().length >= 6, 'Password must be at least 6 characters long'),
})
    .strict();
