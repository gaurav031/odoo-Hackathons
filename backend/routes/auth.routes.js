import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate, registerSchema, loginSchema } from '../validations/auth.validation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

export default router;
