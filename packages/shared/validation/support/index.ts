import { z } from 'zod';

const TicketStatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const CreateTicketSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  assignedToId: z.string().uuid().optional(),
});

export const UpdateTicketSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  status: TicketStatusEnum.optional(),
  assignedToId: z.string().uuid().nullable().optional(),
});

export const StatusTicketSchema = z.object({
  status: TicketStatusEnum,
});

export const AssignTicketSchema = z.object({
  assignedToId: z.string().uuid().nullable(),
});

export const CreateCommentSchema = z.object({
  body: z.string().min(1, 'Comment body cannot be empty'),
});

export const CreateAttachmentSchema = z.object({
  url: z.string().min(1, 'Logical URL or path is required'),
});

export const CreateFeatureFlagSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  enabled: z.boolean().default(false),
});

export const UpdateFeatureFlagSchema = z.object({
  enabled: z.boolean(),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;
export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;
export type StatusTicketInput = z.infer<typeof StatusTicketSchema>;
export type AssignTicketInput = z.infer<typeof AssignTicketSchema>;
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type CreateAttachmentInput = z.infer<typeof CreateAttachmentSchema>;
export type CreateFeatureFlagInput = z.infer<typeof CreateFeatureFlagSchema>;
export type UpdateFeatureFlagInput = z.infer<typeof UpdateFeatureFlagSchema>;
