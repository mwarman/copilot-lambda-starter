# 🧭 Copilot Instructions for AWS Lambda REST API (TypeScript + AWS CDK)

This guide provides instructions for using **GitHub Copilot** and onboarding developers working on this AWS Lambda REST API project written in **TypeScript**, with **AWS CDK** for infrastructure as code and **co-located unit tests**.

---

## Role

You are a **Senior TypeScript developer** working on an AWS Lambda REST API project. Your goal is to create efficient, maintainable, and testable Lambda functions using AWS CDK for infrastructure management. You will use the following the provided guidelines and best practices.

---

## Language & Stack

- **Language:** TypeScript
- **Platform:** AWS Lambda + API Gateway (REST API)
- **Infrastructure:** AWS CDK v2
- **Runtime:** Node.js 22+
- **AWS SDK:** v3 (modular packages)
- **Testing:** Vitest
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
    getUser.ts              # Lambda handler
    getUser.test.ts         # Unit test for getUser
  /services
    userService.ts          # Business logic
    userService.test.ts     # Unit test for userService
  /models
    User.ts
  /utils
    response.ts             # Helper for formatting Lambda responses
    response.test.ts

/infrastructure
  /stacks
    ApiStack.ts             # CDK stack for REST API + Lambdas
  app.ts                    # CDK app entry point

cdk.json                    # CDK config
tsconfig.json               # TypeScript config
jest.config.js              # Jest config
```

---

## AWS CDK Guidelines

- Use **NodejsFunction** from `aws-cdk/aws-lambda-nodejs` to build Lambdas with automatic TypeScript transpilation.
- Define one CDK stack per major grouping of resources (e.g., API stack, database stack).
- Example: Basic Lambda + API Gateway route:

```ts
const getUserFunction = new NodejsFunction(this, 'GetUserFunction', {
  entry: '../src/handlers/getUser.ts',
  handler: 'getUser',
  environment: {
    USERS_TABLE: usersTable.tableName,
  },
});

const api = new RestApi(this, 'UsersApi');
api.root
  .addResource('users')
  .addResource('{userId}')
  .addMethod('GET', new LambdaIntegration(getUserFunction));
```

---

## Code Organization Rules

- Handlers should **only parse input, call services, and return responses**.
- Place core business logic and integrations in `/services`.
- Reuse models and utilities across layers.

### Handler Format Example

```ts
export const getUser = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.pathParameters?.userId;
  if (!userId) return badRequest('Missing userId');

  try {
    const user = await userService.getUserById(userId);
    return user ? ok(user) : notFound('User not found');
  } catch (err) {
    console.error('Failed to get user:', err);
    return internalServerError('Unexpected error');
  }
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

### Example Test File (`getUser.test.ts`)

```ts
import { getUser } from './getUser';
import { APIGatewayProxyEvent } from 'aws-lambda';

it('returns 400 if userId is missing', async () => {
  // Arrange
  const event = { pathParameters: {} } as unknown as APIGatewayProxyEvent;

  // Act
  const response = await getUser(event);

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
 * Lambda Handler: getUser
 *
 * Copilot Instructions:
 * - Parse userId from event.pathParameters
 * - Call userService.getUserById(userId)
 * - Return 200 with user object or 404 if not found
 * - Validate input; return 400 if invalid
 * - Catch unexpected errors; log and return 500
 */
```
