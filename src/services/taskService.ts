/**
 * The TaskService module provides functionality to operate on tasks in DynamoDB.
 * It includes methods to handle task creation, validation, and interaction with AWS services.
 */
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskRequest } from '@/models/Task.js';
import { dynamoDocClient } from '@/utils/awsClients.js';
import { logger } from '@/utils/logger.js';
import { config } from '@/utils/config.js';

/**
 * Creates a new task in DynamoDB
 *
 * @param createTaskRequest The task data to create
 * @returns The created task with generated ID
 */
const createTask = async (createTaskRequest: CreateTaskRequest): Promise<Task> => {
  // Generate a new ID
  const taskId = uuidv4();
  logger.debug('Creating new task', { taskId });

  // Create the complete task object
  const task: Task = {
    id: taskId,
    title: createTaskRequest.title,
    detail: createTaskRequest.detail,
    isComplete: createTaskRequest.isComplete ?? false,
    dueAt: createTaskRequest.dueAt,
  };

  logger.debug('Saving task to DynamoDB', {
    tableName: config.TASKS_TABLE,
    task,
  });

  // Save to DynamoDB
  await dynamoDocClient.send(
    new PutCommand({
      TableName: config.TASKS_TABLE,
      Item: task,
    }),
  );

  logger.info('Task created successfully', { taskId: task.id });
  return task;
};

// Define and export the TaskService with the methods to handle task operations
export const TaskService = {
  createTask,
};
