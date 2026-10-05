import { jest } from '@jest/globals';
import crypto from 'crypto';

// Mocks
jest.unstable_mockModule('../src/server.js', () => ({
  prisma: {
    customer: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    sale: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    saleServiceDetails: {
      create: jest.fn(),
    },
    $transaction: jest.fn(async (cb) => {
      // Mocking the transaction object tx
      const tx = {
        sale: {
          findUnique: jest.fn(),
          create: jest.fn(),
        },
        saleServiceDetails: {
          create: jest.fn(),
        }
      };
      return cb(tx);
    })
  }
}));

const { registerCustomer, searchCustomer, getCustomerHistory } = await import('../src/services/customerService.js');
const { createSale } = await import('../src/services/saleService.js');
const { prisma } = await import('../src/server.js');

describe('Business Rules Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. Customer registration succeeds', async () => {
    prisma.customer.findFirst.mockResolvedValue(null);
    prisma.customer.findUnique.mockResolvedValue(null);
    prisma.customer.create.mockResolvedValue({ customerId: 'KT-123456' });

    const result = await registerCustomer({
      fullName: 'John Doe',
      mobile: '1234567890',
      whatsapp: '1234567890',
      customerSource: 'Walk-in'
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Customer registered successfully');
  });

  test('2 & 3. Duplicate mobile or whatsapp is detected', async () => {
    prisma.customer.findFirst.mockResolvedValue({ id: 1, customerId: 'KT-999999' });

    const result = await registerCustomer({
      fullName: 'Jane Doe',
      mobile: '1234567890',
      whatsapp: '1234567890',
      customerSource: 'Walk-in'
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe('Customer already registered');
  });

  test('6. Search by Customer ID works', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 1, customerId: 'KT-123456', fullName: 'John' });
    
    const result = await searchCustomer('customerId', 'KT-123456');
    expect(result.customerId).toBe('KT-123456');
  });

  test('9. Nonexistent customer cannot create a sale', async () => {
    prisma.customer.findUnique.mockResolvedValue(null); // Customer not found

    await expect(createSale({
      customerSearchType: 'customerId',
      customerSearchValue: 'KT-000000',
      invoiceId: 'INV-1',
      totalSaleAmount: 1000,
      totalPaid: 500,
      bookingDate: '2023-01-01',
      bookingSource: 'Walk-in',
      customerType: 'Retail',
      serviceType: 'Flight',
      paymentStatus: 'Partial',
      bookingStatus: 'Confirmed'
    })).rejects.toThrow('Customer not found');
  });

  test('11 & 12. Total sale amount and outstanding amount are calculated correctly', async () => {
    prisma.customer.findUnique.mockResolvedValue({ id: 1, customerId: 'KT-123456' });
    
    // We mock transaction to ensure totalOutstanding was calculated correctly
    let passedTxData = null;
    prisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        sale: {
          findUnique: jest.fn().mockResolvedValue(null),
          create: jest.fn().mockImplementation((args) => {
            passedTxData = args.data;
            return { id: 1, ...args.data };
          }),
        },
        saleServiceDetails: {
          create: jest.fn(),
        }
      };
      return cb(tx);
    });

    const sale = await createSale({
      customerSearchType: 'customerId',
      customerSearchValue: 'KT-123456',
      invoiceId: 'INV-2',
      totalSaleAmount: 5000,
      totalPaid: 2000,
      bookingDate: '2023-01-01',
      bookingSource: 'Walk-in',
      customerType: 'Retail',
      serviceType: 'Flight',
      paymentStatus: 'Partial',
      bookingStatus: 'Confirmed'
    });

    expect(passedTxData.totalOutstanding).toBe(3000); // 5000 - 2000
    expect(passedTxData.totalPaid).toBe(2000);
  });
});
