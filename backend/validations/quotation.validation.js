import { z } from 'zod';

export const createQuotationSchema = z.object({
  body: z.object({
    rfqId: z.string({ required_error: 'RFQ ID is required' }),
    items: z
      .array(
        z.object({
          name: z.string(),
          quantity: z.number().min(1),
          unitPrice: z.number().min(0),
          tax: z.number().min(0).optional(),
        })
      )
      .min(1, 'At least one item is required'),
    deliveryTimeline: z.string({ required_error: 'Delivery timeline is required' }),
    terms: z.string().optional(),
  }),
});

export const updateQuotationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Submitted', 'Shortlisted', 'Rejected', 'Approved']),
  }),
});
