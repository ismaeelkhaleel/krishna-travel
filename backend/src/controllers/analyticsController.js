import { getDashboardAnalytics } from '../services/analyticsService.js';

export const getAnalyticsController = async (req, res, next) => {
  try {
    const analytics = await getDashboardAnalytics();
    res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};
