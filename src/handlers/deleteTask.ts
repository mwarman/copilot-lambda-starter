/**
 * Lambda Handler: deleteTask
 *
 * Deletes a task by its ID from DynamoDB.
 * - Parses taskId from event.pathParameters
 * - Calls taskService.deleteTask(taskId)
 * - Returns 204 No Content if successful, 404 if not found
 * - Validates input; returns 400 if invalid
 * - Catches unexpected errors; logs and returns 500
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { TaskService } from '@/services/taskService.js';
import { badRequest, internalServerError, notFound, noContent } from '@/utils/response.js';
import { logger } from '@/utils/logger.js';

// Zod schema for request validation
const requestSchema = z.object({
  pathParameters: z.object({
    taskId: z.string().min(1, 'taskId path variable is required'),
  }),
});

// Type definition derived from the schema
type Request = z.infer<typeof requestSchema>;

/**
 * Lambda handler function to delete a task by ID
 *
 * @param event The API Gateway event containing the request
 * @returns API Gateway response with 204 No Content, or error
 */
export const deleteTask = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId;
  logger.info('Processing delete task request', { requestId });
  logger.debug('Received event', { requestId, event });

  // Validate input
  const result = requestSchema.safeParse(event);
  if (!result.success) {
    logger.warn('Invalid request', { requestId, errors: result.error.errors });
    return badRequest('Invalid request: taskId is required');
  }

  // Extract validated data
  const request: Request = result.data;
  const { taskId } = request.pathParameters;

  try {
    // Call service to delete task
    const deleted = await TaskService.deleteTask(taskId);

    if (!deleted) {
      logger.info('Task not found for deletion', { requestId, taskId });
      return notFound(`Task with ID ${taskId} not found`);
    }

    logger.info('Task deleted successfully', { requestId, taskId });
    return noContent();
  } catch (err) {
    logger.error('Failed to delete task', err as Error, { requestId, taskId });
    return internalServerError('An unexpected error occurred while deleting the task');
  }
};
