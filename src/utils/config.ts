import { z } from 'zod';

/**
 * Schema for validating environment variables
 */
const envSchema = z.object({
  // Required variables
  TASKS_TABLE: z.string().min(1, 'TASKS_TABLE environment variable is required'),

  // Optional variables with defaults
  AWS_REGION: z.string().default('us-east-1'),

  // Feature flags (optional)
  ENABLE_LOGGING: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),

  // Add more environment variables as needed
});

/**
 * Type representing our validated config
 */
export type Config = z.infer<typeof envSchema>;

// Cache for the validated config
let configCache: Config | null = null;

/**
 * Validates environment variables against schema and returns a validated config object
 * @throws {Error} if validation fails
 */
function validateConfig(): Config {
  try {
    // Parse and validate environment variables
    return envSchema.parse(process.env);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');

      throw new Error(`Configuration validation failed:\n${errorMessage}`);
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Refreshes the configuration by re-validating environment variables
 * Useful in tests when environment variables are changed
 */
export function refreshConfig(): Config {
  configCache = validateConfig();
  return configCache;
}

/**
 * Validated configuration object
 * Access environment variables through this object instead of process.env directly
 */
export const config = configCache || refreshConfig();
