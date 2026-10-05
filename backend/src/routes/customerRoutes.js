import express from 'express';
import {
  registerCustomerController,
  searchCustomerController,
  getCustomerHistoryController
} from '../controllers/customerController.js';

const router = express.Router();

router.post('/register', registerCustomerController);
router.get('/search', searchCustomerController);
router.get('/history', getCustomerHistoryController);

export default router;
