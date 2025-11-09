import { z } from 'zod';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const;

export const createEndpointSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores',
    ),
  name: z
    .string()
    .min(1, 'Endpoint name is required')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Endpoint name can only contain letters, numbers, hyphens, and underscores',
    ),
  description: z.string().min(1, 'Description is required'),
  originalUrl: z
    .string()
    .url('Invalid URL format')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: 'URL must use http or https protocol' },
    ),
  httpMethod: z.enum(HTTP_METHODS, {
    errorMap: () => ({ message: 'Invalid HTTP method' }),
  }),
  paymentAmount: z.number().nonnegative('Payment amount must be a non-negative number'),
  tokenType: z.string().min(1, 'Token type is required'),
  customAuthHeaders: z.record(z.string(), z.string()).optional().nullable(),
  sampleBody: z.any().optional().nullable(),
  sampleResponse: z.any().optional().nullable(),
});

export const listEndpointsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().positive().max(100)),
});

export const getEndpointParamsSchema = z.object({
  id: z.string().uuid('Invalid endpoint ID format'),
});

export const getUserEndpointsParamsSchema = z.object({
  wallet: z.string().min(1, 'Wallet address is required'),
});

export const updateEndpointSchema = z.object({
  name: z
    .string()
    .min(1, 'Endpoint name is required')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Endpoint name can only contain letters, numbers, hyphens, and underscores',
    )
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  originalUrl: z
    .string()
    .url('Invalid URL format')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: 'URL must use http or https protocol' },
    )
    .optional(),
  httpMethod: z
    .enum(HTTP_METHODS, {
      errorMap: () => ({ message: 'Invalid HTTP method' }),
    })
    .optional(),
  paymentAmount: z.number().nonnegative('Payment amount must be a non-negative number').optional(),
  tokenType: z.string().min(1, 'Token type is required').optional(),
  customAuthHeaders: z.record(z.string(), z.string()).optional().nullable(),
  sampleBody: z.any().optional().nullable(),
  sampleResponse: z.any().optional().nullable(),
});

export const deleteEndpointParamsSchema = z.object({
  id: z.string().uuid('Invalid endpoint ID format'),
});

export type CreateEndpointDto = z.infer<typeof createEndpointSchema>;
export type ListEndpointsQueryDto = z.infer<typeof listEndpointsQuerySchema>;
export type GetEndpointParamsDto = z.infer<typeof getEndpointParamsSchema>;
export type GetUserEndpointsParamsDto = z.infer<typeof getUserEndpointsParamsSchema>;
export type UpdateEndpointDto = z.infer<typeof updateEndpointSchema>;
export type DeleteEndpointParamsDto = z.infer<typeof deleteEndpointParamsSchema>;
