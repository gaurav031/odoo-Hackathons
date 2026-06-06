import { z } from 'zod';

export const requestApprovalSchema = z.object({
  body: z.object({
    referenceId: z.string({ required_error: 'Reference ID is required' }),
    referenceType: z.enum(['RFQ', 'Quotation']),
    level: z.number().optional(),
  }),
});

export const takeActionSchema = z.object({
  body: z.object({
    status: z.enum(['Approved', 'Rejected']),
    remarks: z.string().min(1, 'Remarks are required when taking an action'),
  }),
});
