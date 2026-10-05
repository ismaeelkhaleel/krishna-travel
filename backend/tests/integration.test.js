import { PrismaClient } from '@prisma/client';
import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';

// Use a separate test database URL
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/krishna_travels_test";

const prisma = new PrismaClient();

describe('PostgreSQL Integration Tests', () => {
  beforeAll(async () => {
    // Attempt connection
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  afterEach(async () => {
    // Clean up DB after each test
    await prisma.saleServiceDetails.deleteMany({});
    await prisma.sale.deleteMany({});
    await prisma.customer.deleteMany({});
  });

  test('Customer registration inserts into PostgreSQL and generates Customer ID', async () => {
    const res = await request(app)
      .post('/api/customers/register')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        fullName: 'Integration User',
        mobile: '9999999991',
        whatsapp: '9999999991',
        customerSource: 'Website'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.customerId).toMatch(/^KT-[0-9A-F]{6}$/);

    const dbCustomer = await prisma.customer.findUnique({
      where: { customerId: res.body.data.customerId }
    });
    expect(dbCustomer).not.toBeNull();
    expect(dbCustomer.mobile).toBe('9999999991');
  });

  test('Duplicate mobile/whatsapp is rejected', async () => {
    await prisma.customer.create({
      data: {
        customerId: 'KT-AAAAAA',
        fullName: 'First User',
        mobile: '8888888888',
        whatsapp: '8888888888',
        customerSource: 'Call'
      }
    });

    const res = await request(app)
      .post('/api/customers/register')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        fullName: 'Second User',
        mobile: '8888888888',
        whatsapp: '8888888888',
        customerSource: 'Call'
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Customer already registered');
  });

  test('Sale is created, linked to Customer, handles ServiceDetails, and Outstanding Amount is calculated', async () => {
    const customer = await prisma.customer.create({
      data: {
        customerId: 'KT-BBBBBB',
        fullName: 'Sale User',
        mobile: '7777777777',
        whatsapp: '7777777777',
        customerSource: 'Website'
      }
    });

    const res = await request(app)
      .post('/api/sales/new')
      .set('X-Forwarded-For', '127.0.0.1')
      .send({
        customerSearchType: 'customerId',
        customerSearchValue: 'KT-BBBBBB',
        invoiceId: 'INV-TEST-1',
        totalSaleAmount: 10000,
        totalPaid: 6000,
        bookingDate: '2023-01-01',
        bookingSource: 'Walk-in',
        customerType: 'Retail',
        serviceType: 'Flight',
        paymentStatus: 'Partial',
        bookingStatus: 'Confirmed',
        serviceDetails: {
          airline: 'Air India',
          pnr: 'AI123'
        }
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);

    const saleId = res.body.data.id;

    const dbSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { serviceDetails: true }
    });

    expect(dbSale.customerId).toBe(customer.id); // Linked correctly
    expect(dbSale.invoiceId).toBe('INV-TEST-1'); // Invoice uniqueness works
    expect(Number(dbSale.totalOutstanding)).toBe(4000); // 10000 - 6000
    expect(dbSale.serviceDetails).not.toBeNull();
    expect(dbSale.serviceDetails.details.pnr).toBe('AI123'); // SaleServiceDetails is linked
  });

  test('Customer sale history returns the created sale', async () => {
    const customer = await prisma.customer.create({
      data: {
        customerId: 'KT-CCCCCC',
        fullName: 'History User',
        mobile: '6666666666',
        whatsapp: '6666666666',
        customerSource: 'Website'
      }
    });

    await prisma.sale.create({
      data: {
        customerId: customer.id,
        invoiceId: 'INV-TEST-2',
        totalSaleAmount: 5000,
        totalPaid: 5000,
        totalOutstanding: 0,
        bookingDate: new Date('2023-01-01'),
        bookingSource: 'Website',
        customerType: 'Retail',
        serviceType: 'Flight',
        paymentStatus: 'Full Paid',
        bookingStatus: 'Confirmed'
      }
    });

    const res = await request(app)
      .get('/api/customers/history?identifier=customerId&value=KT-CCCCCC')
      .set('X-Forwarded-For', '127.0.0.1');

    expect(res.status).toBe(200);
    expect(res.body.data.customerSummary.totalBookings).toBe(1);
    expect(res.body.data.sales.length).toBe(1);
    expect(res.body.data.sales[0].invoiceId).toBe('INV-TEST-2');
  });

});
