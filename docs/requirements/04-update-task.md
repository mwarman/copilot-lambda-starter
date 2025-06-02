# Requirement: Update a Task by Identifier

This document describes the requirements for an AWS Lambda REST API endpoint that will update a single **Task** item in DynamoDB by its identifier.

---

## Description

Create an AWS Lambda function which handles a REST API request to update a specific **Task** item in DynamoDB using its unique identifier. The task identifier should be provided as a path parameter in the REST API request, and the updated task attributes should be provided in the request body. The task service should first check if the **Task** item exists in the task table in AWS DynamoDB using the provided identifier. If found, the task service should update the **Task** item with the new attributes provided in the request.

The Lambda function should validate the update task object in the request body. The task service should use the AWS SDK to interact with AWS DynamoDB, specifically using the DynamoDB Document Client to perform the update operation.

The Lambda function should return the updated **Task** item in the response body along with an appropriate HTTP status code (200) if the update is successful. If the task is not found, the Lambda function should return an appropriate HTTP status code (404) and the body should contain a meaningful message as JSON. If the request body is invalid, the Lambda function should return an appropriate HTTP status code (400) and the body should contain validation error details as JSON. If an error occurs during processing, the Lambda function should return an appropriate HTTP status code (500) and the body should contain a meaningful message as JSON.

Create appropriate AWS infrastructure for the new Lambda function using the AWS CDK, including updating the API Gateway to route update requests to this Lambda function.

Add unit tests for the newly created and updated source members, ensuring proper validation of the task identifier, task attributes, and handling of various response scenarios (success, not found, validation error, system error).

Implement these requirements step by step. Follow all best practices and structure for this project.

---

## Update Task Object

The request body to update an existing task, the **UpdateTaskRequest**, should include:

- **title:** The task title. String. Optional. Maximum of 100 characters.
- **detail:** Additional information for the task. String. Optional. Maximum of 2000 characters.
- **isComplete:** Indicates if the task is complete. Boolean. Optional.
- **dueAt:** The task due date. String. Optional. Use ISO-8601 date format, YYYY-MM-DD.

The update operation should only modify the attributes that are provided in the request. Attributes not included in the request should remain unchanged.
