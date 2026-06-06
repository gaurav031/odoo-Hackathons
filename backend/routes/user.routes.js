import express from 'express';
import { getAllUsers, updateUserStatus } from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('Admin')); // Only admin can manage users

router.route('/')
  .get(getAllUsers);

router.route('/:id/status')
  .put(updateUserStatus);

export default router;
