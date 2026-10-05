import { prisma } from '../server.js';
import crypto from 'crypto';

export const registerCustomer = async (customerData) => {
  // Check if customer already exists by mobile or whatsapp
  const existingCustomers = await prisma.customer.findMany({
    where: {
      OR: [
        { mobile: customerData.mobile },
        { whatsapp: customerData.whatsapp }
      ]
    }
  });

  if (existingCustomers.length > 0) {
    if (existingCustomers.length > 1) {
      return {
        success: false,
        message: 'Conflict: Mobile number belongs to one customer and WhatsApp belongs to another customer.',
        reason: 'Conflict: Numbers belong to different customers.',
        data: existingCustomers
      };
    }

    const existingCustomer = existingCustomers[0];
    const matchMobile = existingCustomer.mobile === customerData.mobile;
    const matchWhatsApp = existingCustomer.whatsapp === customerData.whatsapp;
    
    let reason = '';
    if (matchMobile && matchWhatsApp) reason = 'Mobile Number and WhatsApp Number already registered';
    else if (matchMobile) reason = 'Mobile Number already registered';
    else if (matchWhatsApp) reason = 'WhatsApp Number already registered';

    return {
      success: false,
      message: 'Customer already registered',
      reason,
      data: existingCustomer
    };
  }

  // Generate unique Customer ID KT-XXXXXX
  const generateCustomerId = async () => {
    let id;
    let isUnique = false;
    while (!isUnique) {
      const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
      id = `KT-${randomHex}`;
      const existingId = await prisma.customer.findUnique({ where: { customerId: id } });
      if (!existingId) isUnique = true;
    }
    return id;
  };

  const newCustomerId = await generateCustomerId();

  const newCustomer = await prisma.customer.create({
    data: {
      ...customerData,
      customerId: newCustomerId,
      dob: customerData.dob ? new Date(customerData.dob) : null
    }
  });

  return {
    success: true,
    message: 'Customer registered successfully',
    data: { customerId: newCustomer.customerId }
  };
};

export const searchCustomer = async (searchType, searchValue) => {
  const allowedSearchTypes = ['customerId', 'mobile', 'whatsapp'];
  
  if (!allowedSearchTypes.includes(searchType)) {
    throw new Error('Invalid search type');
  }

  const customer = await prisma.customer.findUnique({
    where: {
      [searchType]: searchValue
    }
  });

  return customer;
};

export const getCustomerHistory = async (searchType, searchValue) => {
  const customer = await searchCustomer(searchType, searchValue);
  
  if (!customer) {
    return null;
  }

  const sales = await prisma.sale.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate summaries
  let totalBookings = sales.length;
  let totalSalesAmount = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;

  sales.forEach(sale => {
    totalSalesAmount += Number(sale.totalSaleAmount);
    totalPaid += Number(sale.paidAmount);
    totalOutstanding += Number(sale.outstandingAmount);
  });

  return {
    customerSummary: {
      ...customer,
      totalBookings,
      totalSalesAmount,
      totalPaid,
      totalOutstanding,
      // Total Refund and Total Profit cannot be calculated from the current schema 
      // as there are no underlying fields for 'cost price' or 'refund amounts'. 
      // They are returned as null to satisfy the API contract without inventing rules.
      totalRefund: null,
      totalProfit: null
    },
    sales
  };
};
