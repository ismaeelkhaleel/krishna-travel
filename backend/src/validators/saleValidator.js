import { z } from 'zod';

export const saleSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  customerSearchType: z.enum(['customerId', 'mobile', 'whatsapp']),
  customerSearchValue: z.string().min(1, 'Customer search value is required'),
  
  bookingDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid booking date format",
  }),
  bookingCreatedBy: z.string().optional(),
  branch: z.string().optional(),
  bookingSource: z.enum(['WhatsApp', 'Website', 'Walk-in', 'Call', 'Referral', 'Other']),
  customerType: z.enum(['Retail', 'Corporate', 'Agent']),
  serviceType: z.enum(['Flight', 'Hotel', 'Bus', 'Train', 'Cab', 'Holiday Package', 'Visa', 'Travel Insurance', 'Other']),
  
  referenceNumber: z.string().optional(),
  serviceName: z.string().optional(),
  remarks: z.string().optional(),
  
  baseAmount: z.number().min(0).optional(),
  serviceCharges: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  
  totalSaleAmount: z.number().min(0).optional(),
  paidAmount: z.number().min(0, 'Paid amount must be positive'),
  
  paymentMethod: z.string().optional(),
  paymentStatus: z.enum(['Full Paid', 'Partial', 'Unpaid', 'Refunded', 'Paid']),
  bookingStatus: z.enum(['Confirmed', 'Pending', 'Cancelled', 'Completed', 'Refunded'])
});
