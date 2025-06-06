import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { updateTask } from './updateTask.js';

// Mock the config and logger
vi.mock('../utils/config.js', () => ({
  config: {
    TASKS_TABLE: 'mock-tasks-table',
  },
}));

// Mock dependencies
vi.mock('@/services/taskService.js', () => ({
  TaskService: {
    updateTask: vi.fn(),
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

describe('updateTask', () => {
  // Setup data for tests
  const mockTaskId = 'task-123';
  const mockUpdateData = {
    title: 'Updated Task',
    isComplete: true,
  };
  const mockUpdatedTask = {
    id: mockTaskId,
    title: 'Updated Task',
    detail: 'Original detail',
    isComplete: true,
  };

  // Common test event
  let event: Partial<APIGatewayProxyEvent>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Setup default event with path parameters and body
    event = {
      pathParameters: {
        taskId: mockTaskId,
      },
      body: JSON.stringify(mockUpdateData),
    } as unknown as APIGatewayProxyEvent;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with updated task when update is successful', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    vi.mocked(TaskService.updateTask).mockResolvedValue(mockUpdatedTask);

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockUpdatedTask);
    expect(TaskService.updateTask).toHaveBeenCalledWith(mockTaskId, mockUpdateData);
    expect(logger.info).toHaveBeenCalledWith(
      'Task updated successfully',
      expect.objectContaining({ taskId: mockTaskId }),
    );
  });

  it('returns 404 when task is not found', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    vi.mocked(TaskService.updateTask).mockResolvedValue(undefined);

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ message: `Task with ID ${mockTaskId} not found` });
    expect(TaskService.updateTask).toHaveBeenCalledWith(mockTaskId, mockUpdateData);
    expect(logger.info).toHaveBeenCalledWith(
      'Task not found for update',
      expect.objectContaining({ taskId: mockTaskId }),
    );
  });

  it('returns 400 when taskId is missing', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    event = {
      pathParameters: {},
      body: JSON.stringify(mockUpdateData),
    } as unknown as APIGatewayProxyEvent;

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request: taskId path variable is required' });
    expect(TaskService.updateTask).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('returns 400 when pathParameters is null', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');

    event = {
      pathParameters: null,
      body: JSON.stringify(mockUpdateData),
    } as unknown as APIGatewayProxyEvent;

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request: taskId path variable is required' });
    expect(TaskService.updateTask).not.toHaveBeenCalled();
  });

  it('returns 400 when request body is not valid JSON', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    event = {
      pathParameters: {
        taskId: mockTaskId,
      },
      body: 'not valid json',
    } as unknown as APIGatewayProxyEvent;

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Invalid request format: The request body must be valid JSON',
    });
    expect(TaskService.updateTask).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('returns 400 when update data does not match schema', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    event = {
      pathParameters: {
        taskId: mockTaskId,
      },
      body: JSON.stringify({
        title: 'A'.repeat(101), // Exceeds max length
        isComplete: 'not a boolean', // Not a boolean
      }),
    } as unknown as APIGatewayProxyEvent;

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).message).toContain('Invalid update task data');
    expect(TaskService.updateTask).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('returns 400 when no update fields are provided', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    event = {
      pathParameters: {
        taskId: mockTaskId,
      },
      body: JSON.stringify({}),
    } as unknown as APIGatewayProxyEvent;

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'At least one field must be provided for update' });
    expect(TaskService.updateTask).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it('returns 500 when an unexpected error occurs', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    const error = new Error('Test error');
    vi.mocked(TaskService.updateTask).mockRejectedValue(error);

    // Act
    const response = await updateTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'An unexpected error occurred while updating the task' });
    expect(TaskService.updateTask).toHaveBeenCalledWith(mockTaskId, mockUpdateData);
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to update task',
      error,
      expect.objectContaining({ taskId: mockTaskId }),
    );
  });
});
