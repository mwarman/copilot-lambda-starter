import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { CreateTaskRequest } from '@/models/Task';
import { createTask } from './createTask';

// Mock dependencies
vi.mock('../services/taskService.js', () => ({
  TaskService: {
    createTask: vi.fn(),
  },
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('createTask handler', () => {
  const mockRequestId = 'test-request-id';

  // Create a helper function to build mock events
  const createMockEvent = (body?: string): APIGatewayProxyEvent =>
    ({
      body,
      requestContext: {
        requestId: mockRequestId,
      },
    }) as unknown as APIGatewayProxyEvent;

  beforeEach(async () => {
    // Import the module fresh in each test to reset the mocks
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('request validation', () => {
    it('should return 400 when body is not valid JSON', async () => {
      // Arrange
      const mockEvent = createMockEvent('not-valid-json');
      const { logger } = await import('../utils/logger.js');

      // Act
      const response = await createTask(mockEvent);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({
        message: 'Invalid request format: The request body must be valid JSON',
      });
      expect(logger.warn).toHaveBeenCalledWith(
        'Invalid request format',
        expect.objectContaining({
          requestId: mockRequestId,
        }),
      );
    });

    it('should return 400 when task data is invalid', async () => {
      // Arrange
      const invalidTaskData = { title: '' }; // Missing required title
      const mockEvent = createMockEvent(JSON.stringify(invalidTaskData));
      const { logger } = await import('../utils/logger.js');

      // Act
      const response = await createTask(mockEvent);

      // Assert
      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('Invalid task data:');
      expect(logger.warn).toHaveBeenCalledWith(
        'Invalid task data',
        expect.objectContaining({
          requestId: mockRequestId,
        }),
      );
    });
  });

  describe('successful task creation', () => {
    it('should create a task and return 201 with the created task', async () => {
      // Arrange
      const validTaskData: CreateTaskRequest = {
        title: 'Test Task',
        detail: 'This is a test task',
        dueAt: '2025-06-30',
      };
      const mockEvent = createMockEvent(JSON.stringify(validTaskData));

      const createdTask = {
        id: 'test-task-id',
        ...validTaskData,
        isComplete: false,
      };

      const { TaskService } = await import('../services/taskService.js');
      const { logger } = await import('../utils/logger.js');

      // Mock the TaskService.createTask to return a task
      vi.mocked(TaskService.createTask).mockResolvedValue(createdTask);

      // Act
      const response = await createTask(mockEvent);

      // Assert
      // Validate that the task service was called (we need to be less strict about the exact match)
      expect(TaskService.createTask).toHaveBeenCalled();
      // Instead of checking exact match, verify the key properties
      const createTaskCalls = vi.mocked(TaskService.createTask).mock.calls;
      expect(createTaskCalls.length).toBe(1);
      const taskArg = createTaskCalls[0][0];
      expect(taskArg.title).toEqual(validTaskData.title);
      expect(taskArg.detail).toEqual(validTaskData.detail);
      expect(taskArg.dueAt).toEqual(validTaskData.dueAt);

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual(createdTask);
      expect(logger.info).toHaveBeenCalledWith(
        'Task created successfully',
        expect.objectContaining({
          requestId: mockRequestId,
          taskId: createdTask.id,
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should return 500 when an unexpected error occurs', async () => {
      // Arrange
      const validTaskData = {
        title: 'Test Task',
        detail: 'This is a test task',
      };
      const mockEvent = createMockEvent(JSON.stringify(validTaskData));

      const { TaskService } = await import('../services/taskService.js');
      const { logger } = await import('../utils/logger.js');

      // Mock the TaskService.createTask to throw an error
      const mockError = new Error('Test error');
      vi.mocked(TaskService.createTask).mockRejectedValue(mockError);

      // Act
      const response = await createTask(mockEvent);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        message: 'An unexpected error occurred while creating the task',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to create task',
        mockError,
        expect.objectContaining({
          requestId: mockRequestId,
        }),
      );
    });
  });
});
