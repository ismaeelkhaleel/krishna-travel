import { registerCustomer, searchCustomer, getCustomerHistory } from '../services/customerService.js';
import { customerRegistrationSchema } from '../validators/customerValidator.js';

export const registerCustomerController = async (req, res, next) => {
  try {
    const validatedData = customerRegistrationSchema.parse(req.body);
    const result = await registerCustomer(validatedData);

    if (!result.success) {
      return res.status(409).json({
        success: false,
        message: result.message,
        reason: result.reason,
        data: result.data
      });
    }

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const searchCustomerController = async (req, res, next) => {
  try {
    const { identifier, value } = req.query;

    if (!identifier || !value) {
      return res.status(400).json({
        success: false,
        message: 'Search identifier and value are required'
      });
    }

    const customer = await searchCustomer(identifier, value);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'No customer found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer found',
      data: customer
    });
  } catch (error) {
    if (error.message === 'Invalid search type') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getCustomerHistoryController = async (req, res, next) => {
  try {
    const { identifier, value } = req.query;

    if (!identifier || !value) {
      return res.status(400).json({
        success: false,
        message: 'Search identifier and value are required'
      });
    }

    const history = await getCustomerHistory(identifier, value);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: 'No customer found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer history retrieved successfully',
      data: history
    });
  } catch (error) {
    if (error.message === 'Invalid search type') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};
