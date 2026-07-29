import { Router } from 'express';
import { TicketController } from './controllers/ticket.controller';
import { CommentController } from './controllers/comment.controller';
import { AttachmentController } from './controllers/attachment.controller';
import { FeatureFlagController } from './controllers/feature-flag.controller';

import { authenticate } from '../../middleware/authenticate';
import { requireSession } from '../../middleware/session';
import { resolveActiveOrg } from '../../middleware/resolveActiveOrg';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { Role } from '@workspace/database';
import { 
  CreateTicketSchema, UpdateTicketSchema, StatusTicketSchema, AssignTicketSchema,
  CreateCommentSchema, CreateAttachmentSchema,
  CreateFeatureFlagSchema, UpdateFeatureFlagSchema
} from '@workspace/shared/validation/support';

export const supportRoutes = Router();

// Strict pipeline for all support routes
supportRoutes.use(authenticate);
supportRoutes.use(requireSession);
supportRoutes.use(resolveActiveOrg);

// Support Agents & Admins can access Tickets
const requireSupportOrAdmin = authorize([Role.SUPPORT_AGENT, Role.ORG_ADMIN]);

// Tickets
supportRoutes.post('/tickets', requireSupportOrAdmin, validate(CreateTicketSchema), TicketController.create);
supportRoutes.get('/tickets', requireSupportOrAdmin, TicketController.getMany);
supportRoutes.get('/tickets/:id', requireSupportOrAdmin, TicketController.getOne);
supportRoutes.patch('/tickets/:id', requireSupportOrAdmin, validate(UpdateTicketSchema), TicketController.update);
supportRoutes.patch('/tickets/:id/status', requireSupportOrAdmin, validate(StatusTicketSchema), TicketController.updateStatus);
supportRoutes.patch('/tickets/:id/assign', requireSupportOrAdmin, validate(AssignTicketSchema), TicketController.assign);
supportRoutes.delete('/tickets/:id', requireSupportOrAdmin, TicketController.delete);

// Comments
supportRoutes.post('/tickets/:id/comments', requireSupportOrAdmin, validate(CreateCommentSchema), CommentController.create);
supportRoutes.get('/tickets/:id/comments', requireSupportOrAdmin, CommentController.getMany);
supportRoutes.delete('/tickets/:id/comments/:commentId', requireSupportOrAdmin, CommentController.delete);

// Attachments
supportRoutes.post('/tickets/:id/attachments', requireSupportOrAdmin, validate(CreateAttachmentSchema), AttachmentController.create);
supportRoutes.get('/tickets/:id/attachments', requireSupportOrAdmin, AttachmentController.getMany);

// Feature Flags (Admins Only)
const requireAdmin = authorize([Role.ORG_ADMIN]);
supportRoutes.post('/feature-flags', requireAdmin, validate(CreateFeatureFlagSchema), FeatureFlagController.create);
supportRoutes.get('/feature-flags', requireAdmin, FeatureFlagController.getMany);
supportRoutes.patch('/feature-flags/:id', requireAdmin, validate(UpdateFeatureFlagSchema), FeatureFlagController.update);
supportRoutes.delete('/feature-flags/:id', requireAdmin, FeatureFlagController.delete);
