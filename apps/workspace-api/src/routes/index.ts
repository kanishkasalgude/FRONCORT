import { Router } from 'express';
import { identityRoutes } from '../modules/identity/routes';
import { supportRoutes } from '../modules/support/routes';

const router = Router();

router.use('/auth', identityRoutes);
router.use('/support', supportRoutes);

export default router;
