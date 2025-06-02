import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { CreateTaskSchema } from '@/models/Task';
import { badRequest, created, internalServerError } from '@/utils/response';
import { TaskService } from '@/services/taskService';
import { logger } from '@/utils/logger';

/**
 * Schema for validating the request
 */
const requestSchema = z.object({
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

/**
 * Lambda Handler: createTask
 *
 * Copilot Instructions:
 * - Parse task data from event.body
 * - Validate input against CreateTaskSchema
 * - Call taskService.createTask with validated data
 * - Return 201 with created task or appropriate error
 * - Catch unexpected errors; log and return 500
 */
export const createTask = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext?.requestId;
  logger.info('Processing create task request', { requestId });

  try {
    // Parse and validate request
    const parseResult = requestSchema.safeParse(event);
    if (!parseResult.success) {
      logger.warn('Invalid request format', { requestId, errors: parseResult.error.errors });
      return badRequest('Invalid request format: The request body must be valid JSON');
    }

    // Validate task data against schema
    const taskValidation = CreateTaskSchema.safeParse(parseResult.data.body);
    if (!taskValidation.success) {
      const errors = taskValidation.error.errors.map((e) => e.message).join(', ');
      logger.warn('Invalid task data', { requestId, errors });
      return badRequest(`Invalid task data: ${errors}`);
    }

    logger.debug('Creating task', { requestId, taskData: taskValidation.data });

    // Create task using the service
    const task = await TaskService.createTask(taskValidation.data);

    logger.info('Task created successfully', { requestId, taskId: task.id });

    // Return successful response
    return created(task);
  } catch (error) {
    logger.error('Failed to create task', error as Error, { requestId });
    return internalServerError('An unexpected error occurred while creating the task');
  }
};
