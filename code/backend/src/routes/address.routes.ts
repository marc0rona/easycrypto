import { Router } from 'express';

import {
  createAddress,
  createAddressFromExtension,
  deleteAddress,
  getAddresses,
  updateAddress,
} from '../controllers/address.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  createAddressSchema,
  updateAddressSchema,
} from '../validators/address.validator';

const router = Router();

router.get('/', authenticate, getAddresses);
router.post('/', authenticate, validateBody(createAddressSchema), createAddress);
router.post(
  '/from-extension',
  authenticate,
  validateBody(createAddressSchema),
  createAddressFromExtension,
);
router.patch('/:id', authenticate, validateBody(updateAddressSchema), updateAddress);
router.delete('/:id', authenticate, deleteAddress);

export default router;
