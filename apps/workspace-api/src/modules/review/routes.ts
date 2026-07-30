import { Router } from 'express';
import { PullRequestController } from './controllers/pull-request.controller';
import { ReviewerController } from './controllers/reviewer.controller';
import { ReviewController } from './controllers/review.controller';

import { authenticate } from '../../middleware/authenticate';
import { requireSession } from '../../middleware/session';
import { resolveActiveOrg } from '../../middleware/resolveActiveOrg';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { Role } from '@workspace/database';
import {
  CreatePRSchema, UpdatePRSchema, AssignReviewerSchema, ApproveSchema, RequestChangesSchema, MergeSchema
} from '@workspace/shared/validation/review';

export const reviewRoutes = Router();

reviewRoutes.use(authenticate);
reviewRoutes.use(requireSession);
reviewRoutes.use(resolveActiveOrg);

const requireReviewerOrAdmin = authorize([Role.REVIEWER, Role.ORG_ADMIN]);
const requireAdmin = authorize([Role.ORG_ADMIN]);

// Pull Requests
reviewRoutes.post('/pull-requests', requireReviewerOrAdmin, validate(CreatePRSchema), PullRequestController.create);
reviewRoutes.get('/pull-requests', requireReviewerOrAdmin, PullRequestController.getMany);
reviewRoutes.get('/pull-requests/:id', requireReviewerOrAdmin, PullRequestController.getOne);
reviewRoutes.patch('/pull-requests/:id', requireReviewerOrAdmin, validate(UpdatePRSchema), PullRequestController.update);
reviewRoutes.delete('/pull-requests/:id', requireReviewerOrAdmin, PullRequestController.delete);

// Reviewers
reviewRoutes.post('/pull-requests/:id/reviewers', requireAdmin, validate(AssignReviewerSchema), ReviewerController.assignReviewer);
reviewRoutes.delete('/pull-requests/:id/reviewers/:reviewerId', requireAdmin, ReviewerController.removeReviewer);
reviewRoutes.get('/pull-requests/:id/reviewers', requireReviewerOrAdmin, ReviewerController.getReviewers);

// Reviews
reviewRoutes.post('/pull-requests/:id/approve', requireReviewerOrAdmin, validate(ApproveSchema), ReviewController.approve);
reviewRoutes.post('/pull-requests/:id/request-changes', requireReviewerOrAdmin, validate(RequestChangesSchema), ReviewController.requestChanges);
reviewRoutes.post('/pull-requests/:id/merge', requireAdmin, validate(MergeSchema), ReviewController.merge);
