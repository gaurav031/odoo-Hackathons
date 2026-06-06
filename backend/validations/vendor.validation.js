import { z } from 'zod';

export const createVendorSchema = z.object({
  body: z.object({
    companyName: z.string({ required_error: 'Company name is required' }).min(2),
    contactPerson: z.string({ required_error: 'Contact person is required' }),
    email: z.string({ required_error: 'Email is required' }).email(),
    phone: z.string({ required_error: 'Phone is required' }),
    address: z.string({ required_error: 'Address is required' }),
    gstNumber: z.string({ required_error: 'GST Number is required' }),
    categories: z.array(z.string()).optional(),
  }),
});

export const updateVendorSchema = z.object({
  body: z.object({
    companyName: z.string().min(2).optional(),
    contactPerson: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    gstNumber: z.string().optional(),
    categories: z.array(z.string()).optional(),
    status: z.enum(['Pending', 'Approved', 'Blacklisted']).optional(),
  }),
});
