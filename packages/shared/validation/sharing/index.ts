import { z } from 'zod';

export const CreateShareSchema = z.object({
  targetOrgId: z.string().uuid(),
});

export const SharedResourceQuerySchema = z.object({}); // Currently empty, but ready for future query params

export const RevokeShareSchema = z.object({});
