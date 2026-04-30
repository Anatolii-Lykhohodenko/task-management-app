import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.email({ error: 'Invalid email' }),
    password: z
      .string()
      .min(6, { error: 'Password should be at least 6 characters' })
      .max(50, { error: 'Password is too long' }),
    confirmPassword: z
      .string()
      .min(6, { error: 'Confirm Password should be at least 6 characters' })
      .max(50, { error: 'Confirm Password is too long' }),
    name: z
      .string()
      .min(2, { error: 'Name must be at least 2 characters' })
      .max(35, { error: 'Name is too long' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email' }),
  password: z
    .string()
    .min(6, { error: 'Password should be at least 6 characters' })
    .max(50, { error: 'Password is too long' }),
})

export type RegisterSchemaType = z.infer<typeof registerSchema>
export type LoginSchemaType = z.infer<typeof loginSchema>;