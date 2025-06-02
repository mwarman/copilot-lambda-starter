import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { Config } from './config';

describe('config', () => {
  // Store original env to restore after tests
  const originalEnv = { ...process.env };

  // Use a variable to hold the module we're testing
  let configModule: {
    config: Config;
    refreshConfig: () => Config;
  };

  beforeEach(() => {
    // Reset modules before each test
    vi.resetModules();

    // Make a fresh copy of the environment for each test
    process.env = { ...originalEnv };

    // Set required env vars to avoid validation errors when importing
    process.env.TASKS_TABLE = 'default-table-for-tests';
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  // Helper function to get a fresh instance of the module
  const getConfigModule = async () => {
    // Re-import the module to get a fresh instance with current env vars
    return import('./config.js');
  };

  describe('validation', () => {
    it('should validate required environment variables', async () => {
      // Arrange
      process.env.TASKS_TABLE = 'tasks-table-name';

      // Act
      configModule = await getConfigModule();
      const result = configModule.refreshConfig();

      // Assert
      expect(result.TASKS_TABLE).toBe('tasks-table-name');
    });

    it('should throw error when required variables are missing', async () => {
      // Arrange
      delete process.env.TASKS_TABLE;

      // Act & Assert
      await expect(getConfigModule()).rejects.toThrow('Configuration validation failed');
    });

    it('should use default values for optional variables', async () => {
      // Arrange
      process.env.TASKS_TABLE = 'tasks-table-name';
      delete process.env.AWS_REGION;
      delete process.env.ENABLE_LOGGING;
      delete process.env.LOG_LEVEL;

      // Act
      configModule = await getConfigModule();
      const result = configModule.refreshConfig();

      // Assert
      expect(result.AWS_REGION).toBe('us-east-1');
      expect(result.ENABLE_LOGGING).toBe(true);
      expect(result.LOG_LEVEL).toBe('debug');
    });

    it('should override default values when environment variables are provided', async () => {
      // Arrange
      process.env.TASKS_TABLE = 'tasks-table-name';
      process.env.AWS_REGION = 'eu-west-1';
      process.env.ENABLE_LOGGING = 'false';
      process.env.LOG_LEVEL = 'error';

      // Act
      configModule = await getConfigModule();
      const result = configModule.refreshConfig();

      // Assert
      expect(result.AWS_REGION).toBe('eu-west-1');
      expect(result.ENABLE_LOGGING).toBe(false);
      expect(result.LOG_LEVEL).toBe('error');
    });

    it('should transform ENABLE_LOGGING string to boolean', async () => {
      // Arrange - First test with 'true'
      process.env.TASKS_TABLE = 'tasks-table-name';
      process.env.ENABLE_LOGGING = 'true';

      // Act
      configModule = await getConfigModule();
      const resultTrue = configModule.refreshConfig();

      // Assert
      expect(resultTrue.ENABLE_LOGGING).toBe(true);

      // Reset modules and test with 'false'
      vi.resetModules();
      process.env.ENABLE_LOGGING = 'false';

      // Act again
      configModule = await getConfigModule();
      const resultFalse = configModule.refreshConfig();

      // Assert again
      expect(resultFalse.ENABLE_LOGGING).toBe(false);
    });

    it('should validate LOG_LEVEL enum values', async () => {
      // Valid values
      const validLevels = ['debug', 'info', 'warn', 'error'];

      for (const level of validLevels) {
        // Reset for each iteration
        vi.resetModules();
        process.env.TASKS_TABLE = 'tasks-table-name';
        process.env.LOG_LEVEL = level;

        // Act
        configModule = await getConfigModule();
        const result = configModule.refreshConfig();

        // Assert
        expect(result.LOG_LEVEL).toBe(level);
      }

      // Invalid value test
      vi.resetModules();
      process.env.TASKS_TABLE = 'tasks-table-name';
      process.env.LOG_LEVEL = 'invalid-level';

      // The validation happens at import time, so we need to test the import itself
      await expect(getConfigModule()).rejects.toThrow();
    });
  });

  describe('refreshConfig', () => {
    it('should refresh the configuration when called', async () => {
      // Arrange
      process.env.TASKS_TABLE = 'initial-table';

      // Act - Get module with initial config
      configModule = await getConfigModule();
      const initialConfig = configModule.refreshConfig();

      // Assert initial value
      expect(initialConfig.TASKS_TABLE).toBe('initial-table');

      // Act - Change env and refresh
      process.env.TASKS_TABLE = 'updated-table';
      const updatedConfig = configModule.refreshConfig();

      // Assert updated value
      expect(updatedConfig.TASKS_TABLE).toBe('updated-table');
    });
  });

  describe('config singleton', () => {
    it('should export a valid config object', async () => {
      // Arrange
      process.env.TASKS_TABLE = 'tasks-table-name';

      // Act
      configModule = await getConfigModule();

      // Assert - Verify it has the expected shape
      expect(configModule.config).toBeDefined();
      expect(configModule.config.TASKS_TABLE).toBeDefined();
      expect(configModule.config.AWS_REGION).toBeDefined();
      expect(configModule.config.ENABLE_LOGGING).toBeDefined();
      expect(configModule.config.LOG_LEVEL).toBeDefined();
    });
  });
});
