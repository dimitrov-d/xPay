import { z } from 'zod';

/**
 * Schema for creating a review
 */
export const createReviewSchema = z.object({
  endpointId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
});

/**
 * Schema for getting reviews for an endpoint
 */
export const getEndpointReviewsParamsSchema = z.object({
  endpointId: z.string().uuid(),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
export type GetEndpointReviewsParamsDto = z.infer<typeof getEndpointReviewsParamsSchema>;

