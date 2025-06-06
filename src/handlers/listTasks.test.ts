import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { listTasks } from './listTasks';

// Mock the config and logger
vi.mock('../utils/config.js', () => ({
  config: {
    TASKS_TABLE: 'mock-tasks-table',
  },
}));

// Mock dependencies
vi.mock('../services/taskService.js', () => ({
  TaskService: {
    listTasks: vi.fn(),
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

describe('listTasks handler', () => {
  const mockRequestId = 'test-request-id';

  // Create a helper function to build mock events
  const createMockEvent = (): APIGatewayProxyEvent =>
    ({
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

  describe('successful tasks retrieval', () => {
    it('should return 200 with an array of tasks', async () => {
      // Arrange
      const mockEvent = createMockEvent();
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

      const { TaskService } = await import('../services/taskService.js');
      const { logger } = await import('../utils/logger.js');

      // Mock the TaskService.listTasks to return tasks
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockTasks);

      // Act
      const response = await listTasks(mockEvent);

      // Assert
      expect(TaskService.listTasks).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockTasks);
      expect(logger.info).toHaveBeenCalledWith(
        'Tasks retrieved successfully',
        expect.objectContaining({
          requestId: mockRequestId,
          count: mockTasks.length,
        }),
      );
    });

    it('should return an empty array when there are no tasks', async () => {
      // Arrange
      const mockEvent = createMockEvent();
      const mockTasks: never[] = [];

      const { TaskService } = await import('../services/taskService.js');

      // Mock the TaskService.listTasks to return an empty array
      vi.mocked(TaskService.listTasks).mockResolvedValue(mockTasks);

      // Act
      const response = await listTasks(mockEvent);

      // Assert
      expect(TaskService.listTasks).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should return 500 when an unexpected error occurs', async () => {
      // Arrange
      const mockEvent = createMockEvent();

      const { TaskService } = await import('../services/taskService.js');
      const { logger } = await import('../utils/logger.js');

      // Mock the TaskService.listTasks to throw an error
      const mockError = new Error('Test error');
      vi.mocked(TaskService.listTasks).mockRejectedValue(mockError);

      // Act
      const response = await listTasks(mockEvent);

      // Assert
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({
        message: 'An unexpected error occurred while retrieving tasks',
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to list tasks',
        mockError,
        expect.objectContaining({
          requestId: mockRequestId,
        }),
      );
    });
  });
});
