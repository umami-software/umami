import { z } from 'zod';

export const loginRequestSchema = z
  .object({
    username: z.string().meta({ description: 'Umami username.' }),
    password: z.string().meta({ description: 'Umami password.' }),
  })
  .meta({ id: 'LoginRequest' });
