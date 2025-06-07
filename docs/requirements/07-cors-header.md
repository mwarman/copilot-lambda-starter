# CORS Origin Header Integration for Task Service

## Overview

This document outlines the requirements for implementing CORS (Cross-Origin Resource Sharing) headers in the Task Service API responses. The implementation will allow the API to be accessible from web applications hosted on different domains.

## Requirements

### 1. CORS Header Implementation

The Task Service API must include the `Access-Control-Allow-Origin` header in all HTTP responses with the following specifications:

- The header must be present in all API responses regardless of HTTP method
- The header value will be configurable via an environment variable
- If no value is provided, the default value will be `"*"` (allow all origins)

### 2. Environment Variable Configuration

An environment variable will be created to control the CORS origin header value:

| Variable Name       | Description                                      | Default Value | Required |
| ------------------- | ------------------------------------------------ | ------------- | -------- |
| `CORS_ALLOW_ORIGIN` | Value for the Access-Control-Allow-Origin header | `"*"`         | No       |

### 3. Implementation Details

#### Response Utility Update

The response utility module (`/src/utils/response.ts`) should be updated to include the CORS header in all response objects:

```typescript
// Example implementation
export const ok = (body: any): APIGatewayProxyResult => {
  const corsOrigin = process.env.CORS_ALLOW_ORIGIN || '*';

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': corsOrigin,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
};

// Other response helpers (notFound, badRequest, etc.) should be updated similarly
```

#### CDK Infrastructure Update

The CDK stack should be updated to include the environment variable in all Lambda function configurations:

```typescript
// Example implementation in ApiStack.ts
const getTaskFunction = new NodejsFunction(this, 'GetTaskFunction', {
  entry: '../src/handlers/getTask.ts',
  handler: 'getTask',
  environment: {
    TASKS_TABLE: tasksTable.tableName,
    CORS_ALLOW_ORIGIN: this.node.tryGetContext('corsAllowOrigin') || '*',
  },
});
```

### 4. Testing Requirements

- Unit tests should verify that all response helper functions include the CORS header
- Tests should verify that the environment variable is correctly used when set
- Tests should verify that the default value (`"*"`) is used when the environment variable is not set

## Acceptance Criteria

1. All API responses include the `Access-Control-Allow-Origin` header
2. The header value matches the `CORS_ALLOW_ORIGIN` environment variable when set
3. The header value defaults to `"*"` when the environment variable is not set
4. Unit tests verify the CORS header implementation
5. Documentation is updated to reflect the new environment variable

## References

- [MDN Web Docs: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [AWS Lambda Proxy Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html)
