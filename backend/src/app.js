import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ipAllowlist } from './middleware/ipAllowlist.js';
import { errorHandler } from './middleware/errorHandler.js';
import customerRoutes from './routes/customerRoutes.js';
import saleRoutes from './routes/saleRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply IP allowlist globally or explicitly on all /api routes
app.use('/api', ipAllowlist);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Route
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
