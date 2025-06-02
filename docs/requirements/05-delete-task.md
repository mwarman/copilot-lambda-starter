# Requirement: Delete a Task by Identifier

This document describes the requirements for an AWS Lambda REST API endpoint that will delete a **Task** item from DynamoDB by its identifier.

---

## Description

Create an AWS Lambda function which handles a REST API request to delete a specific **Task** item from DynamoDB using its unique identifier. The task identifier should be provided as a path parameter in the REST API request. The task service should first check if the **Task** item exists in the task table in AWS DynamoDB using the provided identifier. If found, the task service should delete the **Task** item from the database.

The Lambda function should validate the task identifier in the request. The task service should use the AWS SDK to interact with AWS DynamoDB, specifically using the DynamoDB Document Client to perform the delete operation.

The Lambda function should return an appropriate HTTP status code (204) with no content if the deletion is successful. If the task is not found, the Lambda function should return an appropriate HTTP status code (404) and the body should contain a meaningful message as JSON. If the request is invalid, the Lambda function should return an appropriate HTTP status code (400) and the body should contain validation error details as JSON. If an error occurs during processing, the Lambda function should return an appropriate HTTP status code (500) and the body should contain a meaningful message as JSON.

Create appropriate AWS infrastructure for the new Lambda function using the AWS CDK, including updating the API Gateway to route delete requests to this Lambda function.

Add unit tests for the newly created and updated source members, ensuring proper validation of the task identifier and handling of various response scenarios (success, not found, validation error, system error).

Implement these requirements step by step. Follow all best practices and structure for this project.
