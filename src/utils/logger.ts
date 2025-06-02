import { config } from './config.js';

/**
 * Log levels with numeric values for comparison
 */
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

/**
 * Check if a given log level should be logged based on configured level
 */
function shouldLog(level: LogLevel): boolean {
  if (!config.ENABLE_LOGGING) return false;

  const configuredLevel = LOG_LEVELS[config.LOG_LEVEL as LogLevel];
  const requestedLevel = LOG_LEVELS[level];

  return requestedLevel >= configuredLevel;
}

/**
 * Format a log message with timestamp and metadata
 */
function formatLogMessage(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Logger utility configured based on environment settings
 */
export const logger = {
  debug(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      console.debug(formatLogMessage('debug', message, context));
    }
  },

  info(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      console.info(formatLogMessage('info', message, context));
    }
  },

  warn(message: string, context?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      console.warn(formatLogMessage('warn', message, context));
    }
  },

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      const errorContext = error
        ? {
            ...context,
            errorMessage: error.message,
            stack: error.stack,
          }
        : context;

      console.error(formatLogMessage('error', message, errorContext));
    }
  },
};
