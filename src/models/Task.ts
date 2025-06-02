import { z } from 'zod';

/**
 * Schema for a Task entity
 *
 * Represents a task with validation rules according to requirements:
 * - id: Required string, max 24 characters
 * - title: Required string, max 100 characters
 * - detail: Optional string, max 2000 characters
 * - isComplete: Boolean, defaults to false
 * - dueAt: Optional ISO-8601 date string
 */
export const TaskSchema = z.object({
  id: z.string().min(1, 'ID is required').max(24, 'ID must be 24 characters or less'),
  title: z.string().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  detail: z.string().max(2000, 'Detail must be 2000 characters or less').optional(),
  isComplete: z.boolean().default(false),
  dueAt: z.string().date().optional(),
});

/**
 * Schema for creating a new Task
 *
 * Different from the Task schema in that:
 * - id is optional (will be generated if not provided)
 * - isComplete defaults to false
 */
export const CreateTaskSchema = TaskSchema.omit({ id: true, isComplete: true }).extend({
  id: z.string().max(24, 'ID must be 24 characters or less').optional(),
  isComplete: z.boolean().default(false).optional(),
});

// Type definitions derived from the schemas
export type Task = z.infer<typeof TaskSchema>;
export type CreateTaskRequest = z.infer<typeof CreateTaskSchema>;
