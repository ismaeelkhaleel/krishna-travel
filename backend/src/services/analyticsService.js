import { prisma } from '../server.js';

export const getDashboardAnalytics = async () => {
  // Fetch raw aggregates
  const totalCustomersCount = await prisma.customer.count();
  const totalSalesCount = await prisma.sale.count();
  
  const salesAgg = await prisma.sale.aggregate({
    _sum: {
      totalSaleAmount: true,
      outstandingAmount: true
    }
  });

  const totalRevenue = salesAgg._sum.totalSaleAmount || 0;
  const totalOutstanding = salesAgg._sum.outstandingAmount || 0;

  // Generate last 6 months labels
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const last6Months = [];
  const currentDate = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    last6Months.push({
      label: `${monthNames[d.getMonth()]}`,
      month: d.getMonth(),
      year: d.getFullYear(),
      revenue: 0,
      customers: 0
    });
  }

  // Fetch lightweight data for charts
  // Note: For large DBs, raw SQL grouping is better. Doing in-memory for scale of this CRM MVP.
  
  const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1);

  const recentSales = await prisma.sale.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, totalSaleAmount: true }
  });

  const recentCustomers = await prisma.customer.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true }
  });

  // Populate graph data
  recentSales.forEach(sale => {
    const d = new Date(sale.createdAt);
    const m = d.getMonth();
    const y = d.getFullYear();
    const bucket = last6Months.find(b => b.month === m && b.year === y);
    if (bucket) {
      bucket.revenue += Number(sale.totalSaleAmount || 0);
    }
  });

  recentCustomers.forEach(customer => {
    const d = new Date(customer.createdAt);
    const m = d.getMonth();
    const y = d.getFullYear();
    const bucket = last6Months.find(b => b.month === m && b.year === y);
    if (bucket) {
      bucket.customers += 1;
    }
  });

  // Prepare trend data arrays
  const salesTrend = last6Months.map(b => ({ name: b.label, revenue: b.revenue }));
  const customerGrowth = last6Months.map(b => ({ name: b.label, customers: b.customers }));

  return {
    stats: {
      totalCustomers: totalCustomersCount,
      totalBookings: totalSalesCount,
      totalRevenue: Number(totalRevenue),
      totalOutstanding: Number(totalOutstanding)
    },
    salesTrend,
    customerGrowth
  };
};
