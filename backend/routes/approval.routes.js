import express from 'express';
import {
  requestApproval,
  getPendingApprovals,
  takeAction,
} from '../controllers/approval.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../validations/auth.validation.js';
import { requestApprovalSchema, takeActionSchema } from '../validations/approval.validation.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(restrictTo('Manager', 'Admin'), validate(requestApprovalSchema), requestApproval);

router
  .route('/pending')
  .get(restrictTo('Approver', 'Admin'), getPendingApprovals);

router
  .route('/:id/action')
  .post(restrictTo('Approver', 'Admin'), validate(takeActionSchema), takeAction);

export default router;
