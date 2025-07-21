# Copilot Instructions for AWS Lambda REST API (TypeScript + AWS CDK)

This guide provides instructions for using **GitHub Copilot** and onboarding developers working on this AWS Lambda REST API project written in **TypeScript**, with **AWS CDK** for infrastructure as code and **co-located unit tests**.

---

## Role

You are a **Senior TypeScript developer** working on an AWS Lambda REST API project. Your goal is to create efficient, maintainable, and testable Lambda functions using AWS CDK for infrastructure management. You will use the following the provided guidelines and best practices.

---

## Project Overview

- **Component:** Task Service **task-service**
- **Description:** This service provides a REST API for managing tasks, including creating, retrieving, updating, and deleting tasks. It uses AWS Lambda functions triggered by API Gateway events, with business logic encapsulated in service modules. The project follows best practices for TypeScript development, AWS CDK infrastructure management, and unit testing with Vitest.

---

## Language & Stack

- **Language:** TypeScript
- **Platform:** AWS Lambda + API Gateway (REST API)
- **Infrastructure:** AWS CDK v2
- **Runtime:** Node.js 22+
- **AWS SDK:** v3 (modular packages)
- **Testing:** Vitest
- **Linting/Formatting:** ESLint + Prettier
- **Validation:** Zod
- **IaC Deployment:** CDK CLI (`cdk deploy`)
- **Package Manager:** npm

---

## Technology Stack

### Primary Technologies

- **Language:** TypeScript
- **AWS SDK** v3 for modular imports
- **AWS Lambda** for serverless compute
- **API Gateway** for REST API endpoints
- **DynamoDB** for data storage
- **Cognito** for user authentication and authorization
- **Zod** for input validation and schema definitions

### Utilities

- **Lodash** for utility functions
- **date-fns** for date manipulation
- **uuid** for generating unique identifiers

### Testing

- **Vitest** for unit testing
- **Vitest V8** for code coverage

### Development Tools

- **ESLint** for linting TypeScript code
- **Prettier** for code formatting
- **npm** for package management
- **nvm** for Node.js version management
- **rimraf** for cleaning build artifacts

### Infrastructure

- **AWS CDK** for defining cloud infrastructure as code
- **GitHub Actions** for CI/CD workflows

---

## Project Structure

```
/src
  /handlers
    getTasks.ts                    # Lambda handler
    getTasks.test.ts               # Unit test for getTasks
  /services
    tasksService.ts                # Business logic
    tasksService.test.ts           # Unit test for tasksService
  /models
    task.ts                        # TypeScript interfaces for the task domain
  /utils
    awsClients.ts                  # AWS SDK clients (DynamoDB, S3, etc.)
    awsClients.test.ts             # Unit test for AWS clients
    config.ts                      # Configuration utility (reads and validates from process.env)
    config.test.ts                 # Unit test for config utility
    logger.ts                      # Logger utility
    logger.test.ts                 # Unit test for logger utility
    response.ts                    # Helper for formatting Lambda responses
    response.test.ts               # Unit test for response utility

/infrastructure
  /stacks
    dynamoStack.ts                 # AWS CDK stack for DynamoDB tables
    cognitoStack.ts                # AWS CDK stack for Cognito user pool
    apiStack.ts                    # AWS CDK stack for API Gateway + Lambdas
  .env                             # Environment variables for AWS CDK (do not commit)
  .env.example                     # Example AWS CDK environment variables file
  app.ts                           # AWS CDK app entry point
  cdk.json                         # AWS CDK configuration
  tsconfig.json                    # TypeScript configuration for AWS CDK
  package.json                     # Dependencies and scripts for AWS CDK infrastructure

.editorconfig                      # Editor configuration for consistent formatting
.env                               # Environment variables for app local development (do not commit)
.env.example                       # Example app environment variables file
.nvmrc                             # Node.js version management file
.prettierrc                        # Prettier configuration
eslint.config.mjs                  # ESLint configuration
package.json                       # Dependencies and scripts for the app
tsconfig.json                      # TypeScript config for the app
vitest.config.ts                   # Vitest config
```

---

## Development Guidelines

### General Guidelines

- Use **TypeScript** for all app and infrastructure source code.
- Organize imports logically: external libraries first, then internal components.
- Use path aliases for cleaner imports (e.g., `@services/taskService`).
- Do not use barrel files (index.ts).
- Use comments to explain complex logic, but avoid obvious comments.
- Reuse models and utilities across layers.
- Use **Zod** for input validation and schema definitions.

### Lambda Handler Guidelines

- Handlers should **only parse input, call services, and return responses**.
- Use **async Lambda handlers** using `APIGatewayProxyEvent` and return:

  ```ts
  {
    statusCode: number;
    body: string; // Must be JSON stringified
  }
  ```

- Parse input from:

  - `event.body` for POST/PUT
  - `event.pathParameters` or `event.queryStringParameters` for GET/DELETE

- Validate input using **Zod** schemas.
- Use `process.env` for all configuration (not hardcoded values) and `config.ts` for centralized configuration management.

#### Handler Example

```ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { TaskService } from '@/services/taskService';
import { ok, notFound, badRequest, internalServerError } from '@/utils/response';

// Zod schema for request validation
const requestSchema = z.object({
  pathParameters: z.object({
    taskId: z.string().min(1, 'taskId path variable is required'),
  }),
});
type Request = z.infer<typeof requestSchema>;

// Lambda handler function
export const getTask = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Validate input
  const result = requestSchema.safeParse<APIGatewayProxyEvent, Request>(event);
  if (!result.success) return badRequest('Invalid request');

  // Extract validated data
  const request: Request = result.data;
  const { taskId } = request.pathParameters;

  try {
    // Call service to get task
    const task = await TaskService.getTaskById(taskId);
    return task ? ok(task) : notFound('Task not found');
  } catch (err) {
    console.error('Failed to get task:', err);
    return internalServerError('Unexpected error');
  }
};
```

### Service Layer Guidelines

- Place all business logic in `/services`.
- Use **async functions** that return promises.

#### Example Service

```ts
import { GetCommand } from '@aws-sdk/lib-dynamodb';

import { config } from '@/utils/config';
import { dynamoDocClient } from '@/utils/awsClients';
import { Task } from '@/models/task';

// Service function to fetch a task by ID
const getTaskById = async (taskId: string): Promise<Task | null> => {
  // Validate input
  if (!taskId) {
    throw new Error('taskId is required');
  }
  // Fetch task from DynamoDB
  const result = await dynamoDocClient.send(
    new GetCommand({
      TableName: config.TASKS_TABLE,
      Key: { id: taskId },
    }),
  );
  if (!result.Item) {
    return null;
  }
  return result.Item as Task;
};

export const TasksService = {
  getTaskById,
  // Other service methods...
};
```

---

## Testing Guidelines

- Use **Vitest**.
- Co-locate test files next to the source file, with `.test.ts` suffix.
- Use Arrange - Act - Assert (AAA) pattern for test structure:
  - **Arrange:** Set up the test environment and inputs.
  - **Act:** Call the function being tested.
  - **Assert:** Verify the output and side effects.
- Use `describe` and `it` blocks for organization.
- Use `beforeEach` for setup and `afterEach` for cleanup.
- Use `expect` assertions for results.
- Mock dependencies using `vi.mock` or similar.
- Mock external calls (e.g., AWS SDK, databases).
- Prefer unit tests over integration tests in this repo.
- 80% code coverage is the minimum requirement for all components and features.

### Example Test File (`getTask.test.ts`)

```ts
describe('getTask', () => {
  it('returns 200 with task data when task exists', async () => {
    // Arrange
    const event = {
      pathParameters: { taskId: '123' },
    } as unknown as APIGatewayProxyEvent;

    // Mock the service call
    vi.spyOn(TasksService, 'getTaskById').mockResolvedValue({
      id: '123',
      name: 'Test Task',
      // Other properties...
    });

    // Act
    const response = await getTask(event);

    // Assert
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      id: '123',
      name: 'Test Task',
      // Other properties...
    });
  });
});
```

---

## AWS CDK Guidelines

- Self-contained infrastructure code in the `infrastructure` directory.
- Define one CDK stack per major grouping of resources (e.g., API stack, database stack).
- Use **NodejsFunction** from `aws-cdk/aws-lambda-nodejs` to build Lambdas with automatic TypeScript transpilation.
- Enable CORS for all methods in API Gateway.
- Use `/infrastructure/.env` for environment variables prefixed with `CDK_`, but avoid committing this file.
- Use Zod for schema validation of configuration values.
- Tag all CDK resources appropriately (`App`, `Env`, `OU`, `Owner`).
- Deploy separate environments (dev/qa/prd) using configuration values.

### Example Lambda + API Gateway route

```ts
const getTaskFunction = new NodejsFunction(this, 'GetTaskFunction', {
  entry: '../src/handlers/getTask.ts',
  handler: 'getTask',
  environment: {
    TASKS_TABLE: tasksTable.tableName,
  },
});

const api = new RestApi(this, 'TasksApi');
api.root.addResource('tasks').addResource('{taskId}').addMethod('GET', new LambdaIntegration(getTaskFunction));
```

---

## Best Practices

- Never commit secrets or hardcoded credentials.
- Use single table design for DynamoDB where possible.
