import { Router } from 'express';
import { identityRoutes } from '../modules/identity/routes';
import { supportRoutes } from '../modules/support/routes';
import { reviewRoutes } from '../modules/review/routes';
import { sharingRoutes } from '../modules/sharing/routes';

const router = Router();

router.use('/auth', identityRoutes);
router.use('/support', supportRoutes);
router.use('/review', reviewRoutes);
router.use('/sharing', sharingRoutes);

export default router;
