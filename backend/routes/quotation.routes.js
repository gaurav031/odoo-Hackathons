import express from 'express';
import {
  submitQuotation,
  getQuotationsByRFQ,
  updateQuotationStatus,
} from '../controllers/quotation.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../validations/auth.validation.js';
import { createQuotationSchema, updateQuotationStatusSchema } from '../validations/quotation.validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .post(restrictTo('Vendor', 'Admin', 'Manager'), validate(createQuotationSchema), submitQuotation);

router
  .route('/rfq/:rfqId')
  .get(restrictTo('Admin', 'Manager', 'Approver'), getQuotationsByRFQ);

router
  .route('/:id/status')
  .put(restrictTo('Admin', 'Manager', 'Approver'), validate(updateQuotationStatusSchema), updateQuotationStatus);

export default router;
