import { prisma } from '../server.js';
import { searchCustomer } from './customerService.js';

export const createSale = async (saleData) => {
  const {
    customerSearchType,
    customerSearchValue,
    invoiceId,
    baseAmount = 0,
    serviceCharges = 0,
    discount = 0,
    tax = 0,
    totalSaleAmount: providedTotalSaleAmount,
    paidAmount,
    referenceNumber,
    serviceName,
    remarks,
    paymentMethod,
    paymentStatus,
    bookingStatus,
    ...restSaleData
  } = saleData;

  // 1. Validate Customer
  const customer = await searchCustomer(customerSearchType, customerSearchValue);
  if (!customer) {
    throw new Error('Customer not found');
  }

  // 2. Calculate Money
  let calculatedTotalSaleAmount = providedTotalSaleAmount || 0;
  
  if (baseAmount || serviceCharges || discount || tax) {
     calculatedTotalSaleAmount = Number(baseAmount) + Number(serviceCharges) - Number(discount) + Number(tax);
  }
  
  const outstandingAmount = calculatedTotalSaleAmount - Number(paidAmount || 0);

  // 3. Create Sale inside a transaction
  return await prisma.$transaction(async (tx) => {
    // Check if invoice already exists
    const existingInvoice = await tx.sale.findUnique({
      where: { invoiceId }
    });

    if (existingInvoice) {
      const error = new Error('Invoice ID already exists');
      error.code = 'P2002'; // Simulate Prisma unique constraint error
      throw error;
    }

    const sale = await tx.sale.create({
      data: {
        ...restSaleData,
        invoiceId,
        customerId: customer.id,
        bookingDate: new Date(restSaleData.bookingDate),
        referenceNumber,
        serviceName,
        remarks,
        baseAmount,
        serviceCharges,
        discount,
        tax,
        totalSaleAmount: calculatedTotalSaleAmount,
        paidAmount,
        outstandingAmount,
        paymentStatus,
        paymentMethod,
        bookingStatus
      }
    });

    return sale;
  });
};

export const getSaleDetails = async (saleId) => {
  const sale = await prisma.sale.findUnique({
    where: { id: parseInt(saleId) },
    include: {
      customer: true
    }
  });

  return sale;
};
