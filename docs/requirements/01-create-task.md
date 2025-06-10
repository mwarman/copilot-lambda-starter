# Requirement: Create a Task

This document describes the requirements for an AWS Lambda REST API that will create and persist a new **Task** in DynamoDB.

---

## Description

Create an AWS Lambda function which receives a REST API request containing the attributes of a new **Task** to be created. The handler should validate the create task object in the request. The task service should store the **Task** attributes in the task table in AWS DynamoDB. The task service should use the AWS SDK to interact with AWS DynamoDB. The task service should use the DynamoDB Document Client. The Lambda function should return the created **Task** in the response body if successful along with an appropriate HTTP status code (201). If an error occurs, the Lambda function should return an appropriate HTTP status code (500) and the body should contain a meaningful message.

Initialize Vitest for this project. Add unit tests for the Lambda function source members.

Implement these requirements step by step. Follow all best practices and structure for this project.

---

## Task object

A **Task** object has the following attributes:

- **id:** Primary key identifier of a task. String. Required. Maximum of 24 characters.
- **title:** The task title. String. Required. Maximum of 100 characters.
- **detail:** Additional information for the task. String. Optional. Maximum of 2000 characters.
- **isComplete:** Indicates if the task is complete. Boolean. Optional. Defaults to **false** if not provided.
- **dueAt:** The task due date. String. Optional. Use ISO-8601 date format, e.g. 2025-06-01T04:00:00Z

### Create Task Object

The request body to create a new task, the **CreateTaskRequest**, is slightly different from the **Task** object in the following ways:

- **id** The id is optional on the create task request.
- **isComplete** Defaults to **false** if not defined.

---

## CDK Infrastructure

Initialize the AWS CDK for this project. Ensure that the CDK configuration is updated to use the project directory structure specified in the instructions. Create appropriate AWS infrastructure using the AWS CDK including an REST API Gateway, the Lambda function, the DynamoDB table, and all associated AWS resources.
