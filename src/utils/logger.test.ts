import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from './logger.js';
import { config } from './config.js';

// Mock the config module
vi.mock('./config.js', () => ({
  config: {
    ENABLE_LOGGING: true,
    LOG_LEVEL: 'info',
  },
}));

describe('logger', () => {
  // Store original console methods
  const originalConsole = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    // Mock console methods
    console.debug = vi.fn();
    console.info = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });

  afterEach(() => {
    // Restore original console methods
    console.debug = originalConsole.debug;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('log level filtering', () => {
    it('should not log debug when level is info', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'info';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Act
      logger.debug('Debug message');

      // Assert
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('should log info when level is info', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'info';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Act
      logger.info('Info message');

      // Assert
      expect(console.info).toHaveBeenCalled();
    });

    it('should log warn when level is info', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'info';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Act
      logger.warn('Warning message');

      // Assert
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error when level is info', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'info';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Act
      logger.error('Error message');

      // Assert
      expect(console.error).toHaveBeenCalled();
    });

    it('should not log anything when logging is disabled', () => {
      // Arrange
      vi.mocked(config).ENABLE_LOGGING = false;

      // Act
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      // Assert
      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('log message formatting', () => {
    it('should format log messages with timestamp and level', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'debug';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Mock Date.toISOString to return a fixed timestamp
      const mockDate = new Date('2025-06-02T12:00:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      // Act
      logger.info('Test message');

      // Assert
      expect(console.info).toHaveBeenCalledWith('[2025-06-02T12:00:00.000Z] [INFO] Test message');
    });

    it('should include context in log message when provided', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'debug';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Mock Date.toISOString to return a fixed timestamp
      const mockDate = new Date('2025-06-02T12:00:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const context = { userId: '123', action: 'login' };

      // Act
      logger.info('User action', context);

      // Assert
      expect(console.info).toHaveBeenCalledWith(
        '[2025-06-02T12:00:00.000Z] [INFO] User action {"userId":"123","action":"login"}',
      );
    });
  });

  describe('error logging', () => {
    it('should log error message with error details', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'error';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Mock Date.toISOString to return a fixed timestamp
      const mockDate = new Date('2025-06-02T12:00:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const error = new Error('Something went wrong');
      error.stack = 'Error: Something went wrong\n    at test.js:1:1';

      // Act
      logger.error('Failed operation', error);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        '[2025-06-02T12:00:00.000Z] [ERROR] Failed operation {"errorMessage":"Something went wrong","stack":"Error: Something went wrong\\n    at test.js:1:1"}',
      );
    });

    it('should merge error details with provided context', () => {
      // Arrange
      vi.mocked(config).LOG_LEVEL = 'error';
      vi.mocked(config).ENABLE_LOGGING = true;

      // Mock Date.toISOString to return a fixed timestamp
      const mockDate = new Date('2025-06-02T12:00:00Z');
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

      const error = new Error('Database connection failed');
      error.stack = 'Error: Database connection failed\n    at db.js:42:10';
      const context = { operation: 'queryUsers', dbHost: 'localhost' };

      // Act
      logger.error('Database error', error, context);

      // Assert
      expect(console.error).toHaveBeenCalledWith(
        '[2025-06-02T12:00:00.000Z] [ERROR] Database error {"operation":"queryUsers","dbHost":"localhost","errorMessage":"Database connection failed","stack":"Error: Database connection failed\\n    at db.js:42:10"}',
      );
    });
  });
});
