import { Router } from 'express';

import {
  updateAuthenticatedUserPassword,
  updateAuthenticatedUserProfile,
  getCurrentAuthenticatedUser,
  loginUser,
  logoutUser,
  refreshUserSession,
  registerUser,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

const router = Router();

router.post('/register', validateBody(registerSchema), registerUser);
router.post('/login', validateBody(loginSchema), loginUser);
router.post('/refresh', refreshUserSession);
router.get('/me', authenticate, getCurrentAuthenticatedUser);
router.patch('/me', authenticate, validateBody(updateProfileSchema), updateAuthenticatedUserProfile);
router.patch('/password', authenticate, validateBody(changePasswordSchema), updateAuthenticatedUserPassword);
router.post('/logout', logoutUser);

export default router;
