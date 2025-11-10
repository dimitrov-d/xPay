import { z } from 'zod';

export const generateTextSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  temperature: z.number().min(0).max(2).optional(),
});

export const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  size: z
    .enum(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'])
    .optional()
    .default('1024x1024'),
  n: z.number().int().positive().max(4).optional().default(1),
});

export type GenerateTextDto = z.infer<typeof generateTextSchema>;
export type GenerateImageDto = z.infer<typeof generateImageSchema>;
