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

## Coding Guidelines

- Use **TypeScript** for all source and infrastructure code.
- Write **async Lambda handlers** using `APIGatewayProxyEvent` and return:

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
- Use `process.env` for all configuration (not hardcoded values).

---

## Project Structure with Co-located Tests

```
/src
  /handlers
    getTask.ts              # Lambda handler
    getTask.test.ts         # Unit test for getTask
  /services
    taskService.ts          # Business logic
    taskService.test.ts     # Unit test for taskService
  /models
    Task.ts
  /utils
    response.ts             # Helper for formatting Lambda responses
    response.test.ts

/infrastructure
  /stacks
    ApiStack.ts             # CDK stack for REST API + Lambdas
  app.ts                    # CDK app entry point

cdk.json                    # CDK config
tsconfig.json               # TypeScript config
vitest.config.ts            # Vitest config
```

---

## AWS CDK Guidelines

- Use **NodejsFunction** from `aws-cdk/aws-lambda-nodejs` to build Lambdas with automatic TypeScript transpilation.
- Define one CDK stack per major grouping of resources (e.g., API stack, database stack).
- Example: Basic Lambda + API Gateway route:

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

## Code Organization Rules

- Handlers should **only parse input, call services, and return responses**.
- Place core business logic and integrations in `/services`.
- Reuse models and utilities across layers.

### Handler Format Example

```ts
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

### Service Format Example

```ts
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskRequest } from '@/models/Task.js';
import { dynamoDocClient } from '@/utils/awsClients.js';
import { logger } from '@/utils/logger.js';
import { config } from '@/utils/config.js';

// Service function to create a new task
const createTask = async (createTaskRequest: CreateTaskRequest): Promise<Task> => {
  // Generate a new ID
  const taskId = uuidv4();

  // Create the complete task object
  const task: Task = {
    id: taskId,
    title: createTaskRequest.title,
    detail: createTaskRequest.detail,
    isComplete: createTaskRequest.isComplete ?? false,
    dueAt: createTaskRequest.dueAt,
  };

  // Log the task creation
  logger.info(`Creating task with ID: ${taskId}`, { task });

  // Save to DynamoDB
  await dynamoDocClient.send(
    new PutCommand({
      TableName: config.TASKS_TABLE,
      Item: task,
    }),
  );

  return task;
};

// Define and export the TaskService with the methods to handle task operations
export const TaskService = {
  createTask,
};
```

---

## Co-located Testing Guidelines

- Use **Vitest**.
- Place test files next to the source file, with `.test.ts` suffix.
- Use `describe` and `it` blocks for organization.
- Mock dependencies using `vi.mock` or similar.
- Use `beforeEach` for setup and `afterEach` for cleanup.
- Use `expect` assertions for results.
- Use Arrange - Act - Assert (AAA) pattern for test structure:
  - **Arrange:** Set up the test environment and inputs.
  - **Act:** Call the function being tested.
  - **Assert:** Verify the output and side effects.
- Mock external calls (e.g., AWS SDK, databases).
- Prefer unit tests over integration tests in this repo.

### Example Test File (`getTask.test.ts`)

```ts
import { getTask } from './getTask';
import { APIGatewayProxyEvent } from 'aws-lambda';

it('returns 400 if taskId is missing', async () => {
  // Arrange
  const event = { pathParameters: {} } as unknown as APIGatewayProxyEvent;

  // Act
  const response = await getTask(event);

  // Assert
  expect(response.statusCode).toBe(400);
});
```

---

## Best Practices

- Never commit secrets or hardcoded credentials.
- Use **SSM Parameter Store** for secure configuration.
- Tag all CDK resources appropriately (`App`, `Env`, `OU`, `Owner`).
- Deploy separate environments (dev/qa/prod) using CDK context or stacks.

---

## Example Inline Copilot Comment Prompt

```ts
/**
 * Lambda Handler: getTask
 *
 * Copilot Instructions:
 * - Parse taskId from event.pathParameters
 * - Call taskService.getTaskById(taskId)
 * - Return 200 with task object or 404 if not found
 * - Validate input; return 400 if invalid
 * - Catch unexpected errors; log and return 500
 */
```
