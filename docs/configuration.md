# Configuration

This document describes the configuration system used in the Task Service.

## Overview

The Task Service uses a centralized configuration system based on Zod validation to ensure all environment variables are properly validated and typed. This approach helps catch configuration errors early and provides TypeScript type safety for all configuration values.

## Configuration Utility

The configuration utility is located in `src/utils/config.ts`. It provides:

1. Validation of all environment variables
2. Type-safe access to configuration values
3. Default values for optional configuration
4. Environment-specific configuration helper

## Required Environment Variables

The following environment variables are required:

| Variable    | Description                                        |
| ----------- | -------------------------------------------------- |
| TASKS_TABLE | The name of the DynamoDB table used to store tasks |

## Optional Environment Variables

The following environment variables are optional and have default values:

| Variable          | Default   | Description                                                               |
| ----------------- | --------- | ------------------------------------------------------------------------- |
| AWS_REGION        | us-east-1 | The AWS region to use for AWS SDK clients                                 |
| ENABLE_LOGGING    | true      | Indicates if logging is enabled                                           |
| LOG_LEVEL         | info      | The level of logging statements emitted. One of: debug, info, warn, error |
| CORS_ALLOW_ORIGIN | \*        | Value for the Access-Control-Allow-Origin header in API responses         |

## Usage

### In Application Code

Instead of using `process.env` directly, import and use the `config` object:

```typescript
import { config } from '@/utils/config';

// Access configuration values
const tableName = config.TASKS_TABLE;
const region = config.AWS_REGION;
```

### In Tests

For tests that need to modify environment variables, use the `refreshConfig` function:

```typescript
import { config, refreshConfig } from '../utils/config';

// Set new environment variables
process.env.AWS_REGION = 'eu-west-1';

// Refresh the configuration
const updatedConfig = refreshConfig();

// Now config.AWS_REGION will be 'eu-west-1'
```

## CDK Infrastructure Configuration

The CDK infrastructure uses a similar configuration system located in `@infrastructure/utils/config.ts`. It validates and provides type-safe access to CDK-specific environment variables like `CDK_DEFAULT_ACCOUNT` and `CDK_DEFAULT_REGION`.
