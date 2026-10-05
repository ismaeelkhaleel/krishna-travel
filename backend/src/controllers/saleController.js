import { createSale, getSaleDetails } from '../services/saleService.js';
import { saleSchema } from '../validators/saleValidator.js';

export const createSaleController = async (req, res, next) => {
  try {
    const validatedData = saleSchema.parse(req.body);
    const sale = await createSale(validatedData);

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale
    });
  } catch (error) {
    if (error.message === 'Customer not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getSaleDetailsController = async (req, res, next) => {
  try {
    const { saleId } = req.params;

    if (!saleId || isNaN(saleId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid Sale ID is required'
      });
    }

    const sale = await getSaleDetails(saleId);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sale details retrieved successfully',
      data: sale
    });
  } catch (error) {
    next(error);
  }
};
