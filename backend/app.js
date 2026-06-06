import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import rfqRoutes from './routes/rfq.routes.js';
import quotationRoutes from './routes/quotation.routes.js';
import approvalRoutes from './routes/approval.routes.js';
import poRoutes from './routes/po.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import activityRoutes from './routes/activity.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import userRoutes from './routes/user.routes.js';
import { globalErrorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static uploaded files
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rfqs', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
