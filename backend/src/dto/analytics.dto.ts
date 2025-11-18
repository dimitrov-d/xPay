import { z } from 'zod';

export const getAnalyticsQuerySchema = z.object({
  endpointId: z.string().uuid(),
  period: z.enum(['24h', '7d', '30d', '90d', 'all']).default('7d'),
});

export type GetAnalyticsQueryDto = z.infer<typeof getAnalyticsQuerySchema>;

