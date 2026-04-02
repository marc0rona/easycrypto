import { Router } from 'express';

import addressRoutes from './address.routes';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/addresses', addressRoutes);
router.use('/admin', adminRoutes);

export default router;
