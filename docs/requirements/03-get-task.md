# Requirement: Get a Task by Identifier

This document describes the requirements for an AWS Lambda REST API endpoint that will retrieve a single **Task** item from DynamoDB by its identifier.

---

## Description

Create an AWS Lambda function which handles a REST API request to retrieve a specific **Task** item from DynamoDB using its unique identifier. The task identifier should be provided as a path parameter in the REST API request. The task service should fetch the **Task** item from the task table in AWS DynamoDB using the provided identifier. The task service should use the AWS SDK to interact with AWS DynamoDB. The task service should use the DynamoDB Document Client.

The Lambda function should return the **Task** item in the response body along with an appropriate HTTP status code (200) if found. If the task is not found, the Lambda function should return an appropriate HTTP status code (404) and the body should contain a meaningful message as JSON. If an error occurs during processing, the Lambda function should return an appropriate HTTP status code (500) and the body should contain a meaningful message as JSON.

Create appropriate AWS infrastructure for the new Lambda function using the AWS CDK, including updating the API Gateway to route requests to this Lambda function.

Add unit tests for the newly created and updated source members, ensuring proper validation of the task identifier and handling of various response scenarios (success, not found, error).

Implement these requirements step by step. Follow all best practices and structure for this project.
