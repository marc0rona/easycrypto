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
