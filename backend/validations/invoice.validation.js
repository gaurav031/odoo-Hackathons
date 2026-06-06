import { z } from 'zod';

export const generateInvoiceSchema = z.object({
  body: z.object({
    poId: z.string({ required_error: 'PO ID is required' }),
    invoiceNumber: z.string({ required_error: 'Invoice number is required' }),
    dueDate: z.string({ required_error: 'Due date is required' }),
    notes: z.string().optional(),
  }),
});

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.enum(['Pending', 'Paid', 'Overdue']),
  }),
});
