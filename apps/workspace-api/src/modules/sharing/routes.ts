import { Router } from 'express';
import { ResourceShareController } from './controllers/resource-share.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requireSession } from '../../middleware/session';
import { resolveActiveOrg } from '../../middleware/resolveActiveOrg';
import { authorize } from '../../middleware/authorize';
import { Role } from '@workspace/database';
import { CreateShareSchema } from '@workspace/shared';

const router = Router();

// Apply base middleware pipeline
router.use(authenticate);
router.use(requireSession);
router.use(resolveActiveOrg);

// Endpoints
router.post(
  '/resources/:resourceId/share',
  authorize([Role.ORG_ADMIN]),
  validate(CreateShareSchema),
  ResourceShareController.shareResource
);

router.delete(
  '/resources/:resourceId/share/:shareId',
  authorize([Role.ORG_ADMIN]),
  ResourceShareController.revokeShare
);

router.get(
  '/resources/:resourceId/shares',
  authorize([Role.ORG_ADMIN, Role.REVIEWER, Role.SUPPORT_AGENT]),
  ResourceShareController.listShares
);

router.get(
  '/shared-with-me',
  authorize([Role.ORG_ADMIN, Role.REVIEWER, Role.SUPPORT_AGENT]),
  ResourceShareController.getSharedWithMe
);

router.get(
  '/resources/:resourceId',
  authorize([Role.ORG_ADMIN, Role.REVIEWER, Role.SUPPORT_AGENT]),
  ResourceShareController.getSharedResourceDetails
);

export const sharingRoutes = router;
