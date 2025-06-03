/**
 * The TaskService module provides functionality to operate on tasks in DynamoDB.
 * It includes methods to handle task creation, validation, and interaction with AWS services.
 */
import { PutCommand, ScanCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '@/models/Task.js';
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

/**
 * Updates an existing task in DynamoDB
 *
 * @param taskId The unique identifier of the task to update
 * @param updateTaskRequest The task data to update
 * @returns The updated task if found, undefined otherwise
 */
const updateTask = async (taskId: string, updateTaskRequest: UpdateTaskRequest): Promise<Task | undefined> => {
  logger.debug('Updating task', { taskId, updateData: updateTaskRequest });

  // First check if the task exists
  const existingTask = await getTaskById(taskId);
  if (!existingTask) {
    logger.info('Task not found for update', { taskId });
    return undefined;
  }

  // Build update expression and attribute values
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  // Add each provided field to the update expression
  if (updateTaskRequest.title !== undefined) {
    updateExpressions.push('#title = :title');
    expressionAttributeNames['#title'] = 'title';
    expressionAttributeValues[':title'] = updateTaskRequest.title;
  }

  if (updateTaskRequest.detail !== undefined) {
    updateExpressions.push('#detail = :detail');
    expressionAttributeNames['#detail'] = 'detail';
    expressionAttributeValues[':detail'] = updateTaskRequest.detail;
  }

  if (updateTaskRequest.isComplete !== undefined) {
    updateExpressions.push('#isComplete = :isComplete');
    expressionAttributeNames['#isComplete'] = 'isComplete';
    expressionAttributeValues[':isComplete'] = updateTaskRequest.isComplete;
  }

  if (updateTaskRequest.dueAt !== undefined) {
    updateExpressions.push('#dueAt = :dueAt');
    expressionAttributeNames['#dueAt'] = 'dueAt';
    expressionAttributeValues[':dueAt'] = updateTaskRequest.dueAt;
  }

  // If no fields to update, return the existing task
  if (updateExpressions.length === 0) {
    logger.info('No changes to update for task', { taskId });
    return existingTask;
  }

  // Create the update expression
  const updateExpression = `SET ${updateExpressions.join(', ')}`;

  logger.debug('Updating task in DynamoDB', {
    tableName: config.TASKS_TABLE,
    taskId,
    updateExpression,
    expressionAttributeNames,
    expressionAttributeValues,
  });

  // Update in DynamoDB
  const response = await dynamoDocClient.send(
    new UpdateCommand({
      TableName: config.TASKS_TABLE,
      Key: { id: taskId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }),
  );

  // Get the updated task
  const updatedTask = response.Attributes as Task;

  logger.info('Task updated successfully', { taskId });
  logger.debug('Updated task details', { updatedTask });

  // Return the updated task
  return updatedTask;
};

// Define and export the TaskService with the methods to handle task operations
export const TaskService = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
};
