import express from 'express';
import {
  createSaleController,
  getSaleDetailsController
} from '../controllers/saleController.js';

const router = express.Router();

router.post('/new', createSaleController);
router.get('/:saleId', getSaleDetailsController);

export default router;
