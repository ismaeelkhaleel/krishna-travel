import express from 'express';
import { getAnalyticsController } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/', getAnalyticsController);

export default router;
