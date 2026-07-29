import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { requireSession } from '../../middleware/session';
import { resolveActiveOrg } from '../../middleware/resolveActiveOrg';
import { RegisterSchema, LoginSchema, SwitchOrgSchema } from '@workspace/shared/validation/auth';

const router = Router();

router.post('/register', validate(RegisterSchema), AuthController.register);
router.post('/login', validate(LoginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);

// Protected routes
router.use(authenticate);
router.use(requireSession);

router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);
router.patch('/switch-org', validate(SwitchOrgSchema), AuthController.switchOrg);

// Routes requiring resolved tenant context
router.use(resolveActiveOrg);

router.get('/me', AuthController.me);

export { router as identityRoutes };
