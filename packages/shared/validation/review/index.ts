import { z } from 'zod';

export const CreatePRSchema = z.object({
  // Prisma schema doesn't have title/description. We leave it open for future.
});

export const UpdatePRSchema = z.object({
  status: z.enum(['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'MERGED']).optional(),
});

export const AssignReviewerSchema = z.object({
  userId: z.string().uuid(),
});

export const ApproveSchema = z.object({});

export const RequestChangesSchema = z.object({});

export const MergeSchema = z.object({});
