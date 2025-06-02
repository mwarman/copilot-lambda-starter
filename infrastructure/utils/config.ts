import { z } from 'zod';

/**
 * Schema for validating CDK environment variables
 */
const cdkEnvSchema = z.object({
  // Required variables
  CDK_DEFAULT_ACCOUNT: z.string().optional(),

  // Optional variables with defaults
  CDK_DEFAULT_REGION: z.string().default('us-east-1'),
  ENV: z.enum(['dev', 'qa', 'prod']).default('dev'),
});

/**
 * Type representing our validated CDK config
 */
export type CdkConfig = z.infer<typeof cdkEnvSchema>;

// Cache for the validated config
let configCache: CdkConfig | null = null;

/**
 * Validates environment variables against schema and returns a validated config object
 * @throws {Error} if validation fails
 */
function validateCdkConfig(): CdkConfig {
  try {
    // Parse and validate environment variables
    return cdkEnvSchema.parse(process.env);
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');

      throw new Error(`CDK Configuration validation failed:\n${errorMessage}`);
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Refreshes the configuration by re-validating environment variables
 * Useful in tests when environment variables are changed
 */
export function refreshCdkConfig(): CdkConfig {
  configCache = validateCdkConfig();
  return configCache;
}

/**
 * Validated CDK configuration object
 */
export const cdkConfig = configCache || refreshCdkConfig();
