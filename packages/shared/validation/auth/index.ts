import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  orgName: z.string().min(2, 'Organization name must be at least 2 characters'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SwitchOrgSchema = z.object({
  orgId: z.string().uuid('Invalid organization ID format'),
});

export type SwitchOrgInput = z.infer<typeof SwitchOrgSchema>;
