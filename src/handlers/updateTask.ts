/**
 * Lambda Handler: updateTask
 *
 * Updates a single task by its ID in DynamoDB.
 * - Parses taskId from event.pathParameters
 * - Parses update data from event.body
 * - Calls taskService.updateTask(taskId, updateData)
 * - Returns 200 with updated task object or 404 if not found
 * - Validates input; returns 400 if invalid
 * - Catches unexpected errors; logs and returns 500
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { UpdateTaskSchema } from '@/models/Task.js';
import { TaskService } from '@/services/taskService.js';
import { badRequest, internalServerError, notFound, ok } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';

// Zod schema for request path validation
const requestPathSchema = z.object({
  pathParameters: z.object({
    taskId: z.string().min(1, 'taskId path variable is required'),
  }),
});

// Zod schema for request body validation
const requestBodySchema = z.object({
  body: z.string().transform((body, ctx) => {
    try {
      // Parse body as JSON
      return JSON.parse(body);
    } catch (_error) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid JSON in request body',
      });
      return z.NEVER;
    }
  }),
});

// Type definition derived from the schema
type RequestPath = z.infer<typeof requestPathSchema>;

/**
 * Lambda handler function to update a task by ID
 *
 * @param event The API Gateway event containing the request
 * @returns API Gateway response with updated task or error
 */
export const updateTask = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId;
  logger.info('Processing update task request', { requestId });
  logger.debug('Received event', { requestId, event });

  // Validate path parameters
  const pathResult = requestPathSchema.safeParse(event);
  if (!pathResult.success) {
    logger.warn('Invalid path parameters', { requestId, errors: pathResult.error.errors });
    return badRequest('Invalid request: taskId path variable is required');
  }

  // Extract validated path data
  const request: RequestPath = pathResult.data;
  const { taskId } = request.pathParameters;

  // Validate request body
  const bodyResult = requestBodySchema.safeParse(event);
  if (!bodyResult.success) {
    logger.warn('Invalid request format', { requestId, errors: bodyResult.error.errors });
    return badRequest('Invalid request format: The request body must be valid JSON');
  }

  // Validate update task data against schema
  const updateValidation = UpdateTaskSchema.safeParse(bodyResult.data.body);
  if (!updateValidation.success) {
    const errors = updateValidation.error.errors.map((e) => e.message).join(', ');
    logger.warn('Invalid update task data', { requestId, errors });
    return badRequest(`Invalid update task data: ${errors}`);
  }

  // If we get here and have no fields to update, return an error
  if (Object.keys(updateValidation.data).length === 0) {
    logger.warn('No update fields provided', { requestId });
    return badRequest('At least one field must be provided for update');
  }

  logger.debug('Updating task', { requestId, taskId, updateData: updateValidation.data });

  try {
    // Call service to update task
    const updatedTask = await TaskService.updateTask(taskId, updateValidation.data);

    if (!updatedTask) {
      logger.info('Task not found for update', { requestId, taskId });
      return notFound(`Task with ID ${taskId} not found`);
    }

    logger.info('Task updated successfully', { requestId, taskId });
    return ok(updatedTask);
  } catch (err) {
    logger.error('Failed to update task', err as Error, { requestId, taskId });
    return internalServerError('An unexpected error occurred while updating the task');
  }
};
