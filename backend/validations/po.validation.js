import { z } from 'zod';

export const generatePoSchema = z.object({
  body: z.object({
    quotationId: z.string({ required_error: 'Quotation ID is required' }),
  }),
});

export const updatePoStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Draft', 'Sent', 'Accepted', 'Fulfilled']),
  }),
});
