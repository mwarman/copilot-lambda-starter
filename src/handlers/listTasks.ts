import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ok, internalServerError } from '@/utils/response';
import { TaskService } from '@/services/taskService';
import { logger } from '@/utils/logger';

/**
 * Lambda Handler: listTasks
 *
 * Copilot Instructions:
 * - Call taskService.listTasks()
 * - Return 200 with array of task objects
 * - Catch unexpected errors; log and return 500
 */
export const listTasks = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId;
  logger.info('Processing list tasks request', { requestId });
  logger.debug('Received event', { requestId, event });

  try {
    logger.debug('Retrieving all tasks', { requestId });

    // Call the service to get all tasks
    const tasks = await TaskService.listTasks();

    logger.info('Tasks retrieved successfully', { requestId, count: tasks.length });

    // Return successful response
    return ok(tasks);
  } catch (error) {
    logger.error('Failed to list tasks', error as Error, { requestId });
    return internalServerError('An unexpected error occurred while retrieving tasks');
  }
};
