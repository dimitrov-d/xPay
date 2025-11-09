import { z } from 'zod';

export const updateUserSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Username can only contain letters, numbers, hyphens, and underscores',
    ),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
