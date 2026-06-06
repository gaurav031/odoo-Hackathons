import express from 'express';
import {
  generatePO,
  getAllPOs,
  updatePOStatus,
  sendPOEmail,
} from '../controllers/po.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../validations/auth.validation.js';
import { generatePoSchema, updatePoStatusSchema } from '../validations/po.validation.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getAllPOs)
  .post(restrictTo('Admin', 'Manager'), validate(generatePoSchema), generatePO);

router
  .route('/:id/status')
  .put(restrictTo('Admin', 'Manager', 'Approver', 'Vendor'), validate(updatePoStatusSchema), updatePOStatus);

router
  .route('/:id/send-email')
  .post(restrictTo('Admin', 'Manager', 'Approver'), sendPOEmail);

export default router;
