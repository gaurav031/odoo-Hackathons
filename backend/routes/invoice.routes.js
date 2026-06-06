import express from 'express';
import {
  generateInvoice,
  getInvoices,
  updateInvoiceStatus,
  sendInvoiceEmail,
} from '../controllers/invoice.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../validations/auth.validation.js';
import { generateInvoiceSchema, updateInvoiceStatusSchema } from '../validations/invoice.validation.js';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getInvoices)
  .post(restrictTo('Vendor', 'Admin'), validate(generateInvoiceSchema), generateInvoice);

router
  .route('/:id/status')
  .put(restrictTo('Admin', 'Manager', 'Approver'), validate(updateInvoiceStatusSchema), updateInvoiceStatus);

router
  .route('/:id/send-email')
  .post(restrictTo('Vendor', 'Admin'), sendInvoiceEmail);

export default router;
