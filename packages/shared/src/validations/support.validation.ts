import { z } from 'zod';
import { SUPPORT_MAX_SCREENSHOT_SIZE } from '../types';

export const supportRequestSchema = z.object({
  category: z.enum(['bug', 'question', 'billing', 'other']),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
  screenshot: z.string().max(SUPPORT_MAX_SCREENSHOT_SIZE).optional(),
  projectId: z.string().uuid().optional(),
});

export type SupportRequestSchemaType = z.infer<typeof supportRequestSchema>;
