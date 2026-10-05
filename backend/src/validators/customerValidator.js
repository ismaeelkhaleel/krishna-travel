import { z } from 'zod';

export const customerRegistrationSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  mobile: z.string().min(10, 'Mobile number must be at least 10 digits'),
  whatsapp: z.string().min(10, 'WhatsApp number must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  dob: z.string().optional().or(z.literal('')), // Could validate Date further
  gender: z.string().optional(),
  address: z.string().optional(),
  pincode: z.string().optional(),
  gstin: z.string().optional(),
  customerSource: z.enum(['WhatsApp', 'Website', 'Walk-in', 'Call', 'Referral', 'Other'], {
    errorMap: () => ({ message: 'Invalid Customer Source' })
  })
});
