import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { getTask } from './getTask.js';

// Mock dependencies
vi.mock('@/services/taskService.js', () => ({
  TaskService: {
    getTaskById: vi.fn(),
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

describe('getTask', () => {
  // Setup data for tests
  const mockTaskId = 'task-123';
  const mockTask = {
    id: mockTaskId,
    title: 'Test Task',
    detail: 'Test task detail',
    isComplete: false,
  };

  // Common test event
  let event: Partial<APIGatewayProxyEvent>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Setup default event with path parameters
    event = {
      pathParameters: {
        taskId: mockTaskId,
      },
    } as unknown as APIGatewayProxyEvent;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('returns 200 with task when found', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    vi.mocked(TaskService.getTaskById).mockResolvedValue(mockTask);

    // Act
    const response = await getTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(mockTask);
    expect(TaskService.getTaskById).toHaveBeenCalledWith(mockTaskId);
    expect(logger.info).toHaveBeenCalledWith('Task retrieved successfully', { taskId: mockTaskId });
  });
  it('returns 404 when task is not found', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    vi.mocked(TaskService.getTaskById).mockResolvedValue(undefined);

    // Act
    const response = await getTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(404);
    expect(JSON.parse(response.body)).toEqual({ message: `Task with ID ${mockTaskId} not found` });
    expect(TaskService.getTaskById).toHaveBeenCalledWith(mockTaskId);
    expect(logger.info).toHaveBeenCalledWith('Task not found', { taskId: mockTaskId });
  });
  it('returns 400 when taskId is missing', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    event = {
      pathParameters: {},
    } as unknown as APIGatewayProxyEvent;

    // Act
    const response = await getTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request: taskId is required' });
    expect(TaskService.getTaskById).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });
  it('returns 400 when pathParameters is null', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');

    event = {
      pathParameters: null,
    } as unknown as APIGatewayProxyEvent;

    // Act
    const response = await getTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Invalid request: taskId is required' });
    expect(TaskService.getTaskById).not.toHaveBeenCalled();
  });
  it('returns 500 when an unexpected error occurs', async () => {
    // Arrange
    const { TaskService } = await import('@/services/taskService.js');
    const { logger } = await import('@/utils/logger.js');

    const error = new Error('Test error');
    vi.mocked(TaskService.getTaskById).mockRejectedValue(error);

    // Act
    const response = await getTask(event as APIGatewayProxyEvent);

    // Assert
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'An unexpected error occurred while retrieving the task' });
    expect(TaskService.getTaskById).toHaveBeenCalledWith(mockTaskId);
    expect(logger.error).toHaveBeenCalledWith('Failed to get task', error, { taskId: mockTaskId });
  });
});
