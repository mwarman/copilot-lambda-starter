import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { CreateTaskRequest } from '@/models/Task.js';

// Mock dependencies
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  PutCommand: vi.fn().mockImplementation((params) => ({
    ...params,
  })),
  ScanCommand: vi.fn().mockImplementation((params) => ({
    ...params,
  })),
}));

vi.mock('uuid', () => ({
  v4: vi.fn().mockReturnValue('mocked-uuid'),
}));

vi.mock('@/utils/awsClients.js', () => ({
  dynamoDocClient: {
    send: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/utils/config.js', () => ({
  config: {
    TASKS_TABLE: 'tasks-table-test',
  },
}));

describe('TaskService', () => {
  let taskService: typeof import('./taskService.js').TaskService;

  beforeEach(async () => {
    // Import the module fresh in each test to reset the mocks
    vi.resetModules();
    taskService = (await import('./taskService.js')).TaskService;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task with the provided data', async () => {
      // Arrange
      const { dynamoDocClient } = await import('@/utils/awsClients.js');
      const { logger } = await import('@/utils/logger.js');
      const { config } = await import('@/utils/config.js');

      const createTaskRequest: CreateTaskRequest = {
        title: 'Test Task',
        detail: 'This is a test task',
        dueAt: '2025-06-30T00:00:00.000Z',
      };

      // Act
      const result = await taskService.createTask(createTaskRequest);

      // Assert
      // Check that UUID was generated
      expect(uuidv4).toHaveBeenCalledTimes(1);

      // Check that the task object was created correctly
      expect(result).toEqual({
        id: 'mocked-uuid',
        title: 'Test Task',
        detail: 'This is a test task',
        isComplete: false,
        dueAt: '2025-06-30T00:00:00.000Z',
      });

      // Check that PutCommand was called with the correct parameters
      expect(PutCommand).toHaveBeenCalledWith({
        TableName: config.TASKS_TABLE,
        Item: {
          id: 'mocked-uuid',
          title: 'Test Task',
          detail: 'This is a test task',
          isComplete: false,
          dueAt: '2025-06-30T00:00:00.000Z',
        },
      });

      // Check that the document client's send method was called
      expect(dynamoDocClient.send).toHaveBeenCalledTimes(1);

      // Check logging
      expect(logger.debug).toHaveBeenCalledWith('Creating new task', { taskId: 'mocked-uuid' });
      expect(logger.debug).toHaveBeenCalledWith('Saving task to DynamoDB', {
        tableName: 'tasks-table-test',
        task: {
          id: 'mocked-uuid',
          title: 'Test Task',
          detail: 'This is a test task',
          isComplete: false,
          dueAt: '2025-06-30T00:00:00.000Z',
        },
      });
      expect(logger.info).toHaveBeenCalledWith('Task created successfully', { taskId: 'mocked-uuid' });
    });

    it('should use default isComplete value if not provided', async () => {
      // Arrange
      const createTaskRequest: CreateTaskRequest = {
        title: 'Test Task',
        detail: 'This is a test task',
      };

      // Act
      const result = await taskService.createTask(createTaskRequest);

      // Assert
      expect(result.isComplete).toBe(false);
    });

    it('should respect provided isComplete value', async () => {
      // Arrange
      const createTaskRequest: CreateTaskRequest = {
        title: 'Test Task',
        detail: 'This is a test task',
        isComplete: true,
      };

      // Act
      const result = await taskService.createTask(createTaskRequest);

      // Assert
      expect(result.isComplete).toBe(true);
    });

    it('should handle DynamoDB errors', async () => {
      // Arrange
      const { dynamoDocClient } = await import('@/utils/awsClients.js');
      const error = new Error('DynamoDB Error');

      // Mock the DynamoDB send method to throw an error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (dynamoDocClient.send as any).mockRejectedValueOnce(error);

      const createTaskRequest: CreateTaskRequest = {
        title: 'Test Task',
      };

      // Act & Assert
      await expect(taskService.createTask(createTaskRequest)).rejects.toThrow('DynamoDB Error');
    });
  });

  describe('listTasks', () => {
    it('should retrieve all tasks from DynamoDB', async () => {
      // Arrange
      const { dynamoDocClient } = await import('@/utils/awsClients.js');
      const { logger } = await import('@/utils/logger.js');
      const { config } = await import('@/utils/config.js');

      const mockTasks = [
        {
          id: 'task1',
          title: 'First Task',
          detail: 'Task details',
          isComplete: false,
          dueAt: '2025-06-30',
        },
        {
          id: 'task2',
          title: 'Second Task',
          isComplete: true,
        },
      ];

      // Mock the DynamoDB scan response
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(dynamoDocClient.send as any).mockResolvedValueOnce({
        Items: mockTasks,
      });

      // Act
      const result = await taskService.listTasks();

      // Assert
      // Check that ScanCommand was called with the correct parameters
      expect(ScanCommand).toHaveBeenCalledWith({
        TableName: config.TASKS_TABLE,
      });

      // Check that the document client's send method was called
      expect(dynamoDocClient.send).toHaveBeenCalledTimes(1);

      // Check that the tasks were returned correctly
      expect(result).toEqual(mockTasks);

      // Check logging
      expect(logger.debug).toHaveBeenCalledWith('Listing all tasks from DynamoDB', {
        tableName: 'tasks-table-test',
      });
      expect(logger.info).toHaveBeenCalledWith('Retrieved all tasks successfully', { count: mockTasks.length });
    });

    it('should return an empty array when no tasks exist', async () => {
      // Arrange
      const { dynamoDocClient } = await import('@/utils/awsClients.js');

      // Mock the DynamoDB scan response with no items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(dynamoDocClient.send as any).mockResolvedValueOnce({
        Items: [],
      });

      // Act
      const result = await taskService.listTasks();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle DynamoDB errors', async () => {
      // Arrange
      const { dynamoDocClient } = await import('@/utils/awsClients.js');
      const error = new Error('DynamoDB Error');

      // Mock the DynamoDB send method to throw an error
      vi.mocked(dynamoDocClient.send).mockRejectedValueOnce(error);

      // Act & Assert
      await expect(taskService.listTasks()).rejects.toThrow('DynamoDB Error');
    });
  });
});
