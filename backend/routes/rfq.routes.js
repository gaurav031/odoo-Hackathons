import express from 'express';
import {
  getAllRFQs,
  createRFQ,
  getRFQ,
  updateRFQ,
  deleteRFQ,
} from '../controllers/rfq.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { validate } from '../validations/auth.validation.js';
import { createRfqSchema, updateRfqSchema } from '../validations/rfq.validation.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getAllRFQs)
  // Disable body validation for multipart/form-data for now, or validate after multer
  .post(restrictTo('Admin', 'Manager'), upload.array('attachments', 5), createRFQ);

router
  .route('/:id')
  .get(getRFQ)
  .put(restrictTo('Admin', 'Manager'), validate(updateRfqSchema), updateRFQ)
  .delete(restrictTo('Admin'), deleteRFQ);

export default router;
