import { z } from 'zod';

const passwordRequired = 'Password is required';

export const registerSchema = z
  .object({
    email: z.string().trim().email('Valid email is required'),
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters long'),
    password: z
      .string()
      .refine(
        (value) => value.trim().length >= 6,
        'Password must be at least 6 characters long',
      ),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email('Valid email is required'),
    password: z.string().refine((value) => value.trim().length > 0, passwordRequired),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    email: z.string().trim().email('Valid email is required'),
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters long'),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .refine((value) => value.trim().length > 0, 'Current password is required'),
    newPassword: z
      .string()
      .refine(
        (value) => value.trim().length >= 6,
        'Password must be at least 6 characters long',
      ),
  })
  .strict();
