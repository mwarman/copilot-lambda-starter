# Adding OPTIONS Method to Tasks API Resources

## Background

The Tasks API currently supports standard REST operations (GET, POST, PUT, DELETE) for task resources. To support CORS (Cross-Origin Resource Sharing) and preflight requests, we need to implement the OPTIONS HTTP method for both the `/tasks` and `/tasks/{taskId}` resources.

## Requirements

### 1. Infrastructure Changes

The AWS CDK infrastructure code needs to be updated to add support for the OPTIONS method on:

- The collection resource `/tasks`
- The item resource `/tasks/{taskId}`

### 2. Implementation Details

- **Integration Type**: Use Mock Integration in API Gateway
- **Response Configuration**:
  - Status code: 200
  - Response headers:
    - `Access-Control-Allow-Origin`: Use the existing `corsAllowOrigin` stack property
    - `Access-Control-Allow-Headers`: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key'
    - `Access-Control-Allow-Methods`: 'GET,POST,PUT,DELETE,OPTIONS'
    - `Access-Control-Allow-Credentials`: 'true'

### 3. Mock Integration Response

The response body for the OPTIONS method should be empty (as per the HTTP specification).

### 4. Code Changes

Update the CDK stack in `infrastructure/stacks/ApiStack.ts` to add the OPTIONS method to both resources:

```typescript
// For the /tasks resource
tasksResource.addMethod(
  'OPTIONS',
  new MockIntegration({
    integrationResponses: [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key'",
          'method.response.header.Access-Control-Allow-Methods': "'GET,POST,PUT,DELETE,OPTIONS'",
          'method.response.header.Access-Control-Allow-Origin': `'${this.corsAllowOrigin}'`,
          'method.response.header.Access-Control-Allow-Credentials': "'true'",
        },
      },
    ],
    passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
    requestTemplates: {
      'application/json': '{"statusCode": 200}',
    },
  }),
  {
    methodResponses: [
      {
        statusCode: '200',
        responseParameters: {
          'method.response.header.Access-Control-Allow-Headers': true,
          'method.response.header.Access-Control-Allow-Methods': true,
          'method.response.header.Access-Control-Allow-Origin': true,
          'method.response.header.Access-Control-Allow-Credentials': true,
        },
      },
    ],
  },
);

// Same implementation for the /tasks/{taskId} resource
```

### 5. Testing Requirements

- Verify the OPTIONS method returns a 200 status code with the correct CORS headers
- Confirm that preflight requests from browsers work correctly
- Test cross-origin requests to ensure CORS is working as expected

## Success Criteria

- OPTIONS requests to `/tasks` and `/tasks/{taskId}` return a 200 status code with the appropriate CORS headers
- Client applications from different origins can make requests to the Tasks API
- Preflight requests are handled correctly

## Out of Scope

- Implementation of Lambda functions (not needed for OPTIONS method)
- Changes to existing API methods
