import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the AWS SDK clients
vi.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: vi.fn().mockImplementation(() => ({
    // Mock implementation of DynamoDBClient
    config: { region: 'mocked-region' },
  })),
}));

vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn().mockImplementation((client) => ({
      // Mock implementation of DynamoDBDocumentClient
      send: vi.fn(),
      client: client,
    })),
  },
}));

// Mock the config and logger
vi.mock('./config.js', () => ({
  config: {
    AWS_REGION: 'test-region',
  },
}));

vi.mock('./logger.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('awsClients', () => {
  // Clear module cache before each test to ensure we get a fresh instance
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create a DynamoDB client with the correct region', async () => {
    // Import dynamically to get fresh instance with mocks applied
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const awsClients = await import('./awsClients.js');

    // Verify DynamoDBClient was instantiated
    expect(DynamoDBClient).toHaveBeenCalledTimes(1);
    expect(DynamoDBClient).toHaveBeenCalledWith({
      region: 'test-region',
    });

    // Verify client was created
    expect(awsClients.dynamoDBClient).toBeDefined();
  });

  it('should create and export a DynamoDB Document client', async () => {
    // Import dynamically to get fresh instance with mocks applied
    const { DynamoDBDocumentClient } = await import('@aws-sdk/lib-dynamodb');
    const awsClients = await import('./awsClients.js');

    // Verify DynamoDBDocumentClient.from was called with the right client
    expect(DynamoDBDocumentClient.from).toHaveBeenCalledTimes(1);
    expect(DynamoDBDocumentClient.from).toHaveBeenCalledWith(awsClients.dynamoDBClient);

    // Verify document client was created
    expect(awsClients.dynamoDocClient).toBeDefined();
  });

  it('should log initialization of the DynamoDB client', async () => {
    // Import logger module directly to access the mock
    const { logger } = await import('./logger.js');

    // Re-import to trigger the log statement
    await import('./awsClients.js');

    // Verify the logger.info was called
    expect(logger.info).toHaveBeenCalledWith('Initialized AWS DynamoDB client', { region: 'test-region' });
  });
});
