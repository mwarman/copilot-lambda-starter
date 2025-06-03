/**
 * Lambda Handler: getTask
 *
 * Retrieves a single task by its ID from DynamoDB.
 * - Parses taskId from event.pathParameters
 * - Calls taskService.getTaskById(taskId)
 * - Returns 200 with task object or 404 if not found
 * - Validates input; returns 400 if invalid
 * - Catches unexpected errors; logs and returns 500
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { TaskService } from '@/services/taskService.js';
import { badRequest, internalServerError, notFound, ok } from '@/utils/response.js';
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
 * Lambda handler function to get a task by ID
 *
 * @param event The API Gateway event containing the request
 * @returns API Gateway response with task or error
 */
export const getTask = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.debug('Getting task', { event });

  // Validate input
  const result = requestSchema.safeParse(event);
  if (!result.success) {
    logger.warn('Invalid request', { errors: result.error.errors });
    return badRequest('Invalid request: taskId is required');
  }

  // Extract validated data
  const request: Request = result.data;
  const { taskId } = request.pathParameters;

  try {
    // Call service to get task
    const task = await TaskService.getTaskById(taskId);

    if (!task) {
      logger.info('Task not found', { taskId });
      return notFound(`Task with ID ${taskId} not found`);
    }

    logger.info('Task retrieved successfully', { taskId });
    return ok(task);
  } catch (err) {
    logger.error('Failed to get task', err as Error, { taskId });
    return internalServerError('An unexpected error occurred while retrieving the task');
  }
};
