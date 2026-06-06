import express from 'express';
import {
  getAllVendors,
  createVendor,
  getVendor,
  updateVendor,
  deleteVendor,
} from '../controllers/vendor.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../validations/auth.validation.js';
import { createVendorSchema, updateVendorSchema } from '../validations/vendor.validation.js';

const router = express.Router();

// Protect all vendor routes
router.use(protect);

router
  .route('/')
  .get(getAllVendors)
  .post(restrictTo('Admin', 'Manager'), validate(createVendorSchema), createVendor);

router
  .route('/:id')
  .get(getVendor)
  .put(restrictTo('Admin', 'Manager'), validate(updateVendorSchema), updateVendor)
  .delete(restrictTo('Admin'), deleteVendor);

export default router;
