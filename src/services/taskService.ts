/**
 * The TaskService module provides functionality to operate on tasks in DynamoDB.
 * It includes methods to handle task creation, validation, and interaction with AWS services.
 */
import { PutCommand, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
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

/**
 * Lists all tasks from DynamoDB
 *
 * @returns Array of Task objects
 */
const listTasks = async (): Promise<Task[]> => {
  logger.debug('Listing all tasks from DynamoDB', {
    tableName: config.TASKS_TABLE,
  });

  // Scan the DynamoDB table to get all tasks
  const response = await dynamoDocClient.send(
    new ScanCommand({
      TableName: config.TASKS_TABLE,
    }),
  );

  // Convert the Items to Task objects
  const tasks = response.Items as Task[];

  logger.info('Retrieved all tasks successfully', { count: tasks.length });
  return tasks;
};

/**
 * Retrieves a task by its ID from DynamoDB
 *
 * @param taskId The unique identifier of the task to retrieve
 * @returns The task if found, undefined otherwise
 */
const getTaskById = async (taskId: string): Promise<Task | undefined> => {
  logger.debug('Getting task by ID', { taskId });

  // Get the task from DynamoDB
  const response = await dynamoDocClient.send(
    new GetCommand({
      TableName: config.TASKS_TABLE,
      Key: { id: taskId },
    }),
  );

  // If the task wasn't found, return undefined
  if (!response.Item) {
    logger.info('Task not found', { taskId });
    return undefined;
  }

  // Convert the Item to a Task object
  const task = response.Item as Task;

  logger.info('Task retrieved successfully', { taskId });
  return task;
};

// Define and export the TaskService with the methods to handle task operations
export const TaskService = {
  createTask,
  listTasks,
  getTaskById,
};
