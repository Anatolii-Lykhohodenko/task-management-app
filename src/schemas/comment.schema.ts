import z from 'zod';

export const commentSchema = z.object({
  text: z
    .string()
    .min(1, { error: "text's length should be at least 1 chatacter" })
    .max(1000, { error: 'Text is too long' }),
});

export type CommentSchemaType = z.infer<typeof commentSchema>;
