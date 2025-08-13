import { z } from 'zod';

// Note creation schema
export const CreateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  userId: z.string().min(1, 'User ID is required'),
});

// Note update schema (all fields optional)
export const UpdateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
});

// Note ID parameter schema
export const NoteParamsSchema = z.object({
  id: z.string().min(1, 'Note ID is required'),
});

// User ID parameter schema for notes
export const UserNoteParamsSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// Query parameters for note listing
export const NoteQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  userId: z.string().optional(),
});

// Type exports
export type CreateNoteInput = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteSchema>;
export type NoteParams = z.infer<typeof NoteParamsSchema>;
export type UserNoteParams = z.infer<typeof UserNoteParamsSchema>;
export type NoteQuery = z.infer<typeof NoteQuerySchema>;
