import { Role } from '@prisma/client';
import { Router } from 'express';

import { createAdmin, getUsers, updateUserAccount, updateUserStatus } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireRole(Role.ADMIN));

router.get('/users', getUsers);
router.post('/users/admins', createAdmin);
router.patch('/users/:id', updateUserAccount);
router.patch('/users/:id/status', updateUserStatus);

export default router;
