import { Router } from 'express';

import { loginUser, registerUser } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate.middleware';
import { loginSchema, registerSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validateBody(registerSchema), registerUser);
router.post('/login', validateBody(loginSchema), loginUser);

export default router;
