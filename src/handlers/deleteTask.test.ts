import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { deleteTask } from './deleteTask.js';
import { TaskService } from '@/services/taskService.js';

// Mock dependencies
vi.mock('@/services/taskService.js', () => ({
  TaskService: {
    deleteTask: vi.fn(),
  },
}));

vi.mock('@/utils/logger.js', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('deleteTask Lambda handler', () => {
  // Valid mock API Gateway event
  const validEvent = {
    pathParameters: {
      taskId: 'task123',
    },
    requestContext: {
      requestId: 'test-request-id',
    },
  } as unknown as APIGatewayProxyEvent;

  // Invalid event (missing taskId)
  const invalidEvent = {
    pathParameters: {},
    requestContext: {
      requestId: 'test-request-id',
    },
  } as unknown as APIGatewayProxyEvent;

  // Reset mocks between tests
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 204 when task is deleted successfully', async () => {
    // Arrange
    vi.mocked(TaskService.deleteTask).mockResolvedValue(true);

    // Act
    const response = await deleteTask(validEvent);

    // Assert
    expect(response.statusCode).toBe(204);
    expect(response.body).toBe('{}');
    expect(TaskService.deleteTask).toHaveBeenCalledWith('task123');
  });

  it('should return 404 when task is not found', async () => {
    // Arrange
    vi.mocked(TaskService.deleteTask).mockResolvedValue(false);

    // Act
    const response = await deleteTask(validEvent);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ message: 'Task with ID task123 not found' });
    expect(TaskService.deleteTask).toHaveBeenCalledWith('task123');
  });

  it('should return 400 when taskId is not provided', async () => {
    // Act
    const response = await deleteTask(invalidEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request: taskId is required' });
    expect(TaskService.deleteTask).not.toHaveBeenCalled();
  });

  it('should return 500 when an unexpected error occurs', async () => {
    // Arrange
    vi.mocked(TaskService.deleteTask).mockRejectedValue(new Error('Test error'));

    // Act
    const response = await deleteTask(validEvent);

    // Assert
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      message: 'An unexpected error occurred while deleting the task',
    });
    expect(TaskService.deleteTask).toHaveBeenCalledWith('task123');
  });
});
