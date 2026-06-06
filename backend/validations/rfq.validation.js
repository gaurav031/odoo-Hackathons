import { z } from 'zod';

export const createRfqSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(3),
    description: z.string({ required_error: 'Description is required' }),
    deadline: z.string({ required_error: 'Deadline is required' }),
    items: z
      .array(
        z.object({
          name: z.string().min(1, 'Item name is required'),
          quantity: z.number().min(1, 'Quantity must be at least 1'),
          specs: z.string().optional(),
        })
      )
      .min(1, 'At least one item is required'),
    invitedVendors: z.array(z.string()).optional(),
  }),
});

export const updateRfqSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    deadline: z.string().optional(),
    items: z
      .array(
        z.object({
          name: z.string(),
          quantity: z.number().min(1),
          specs: z.string().optional(),
        })
      )
      .optional(),
    invitedVendors: z.array(z.string()).optional(),
    status: z.enum(['Draft', 'Open', 'Closed', 'Awarded']).optional(),
  }),
});
