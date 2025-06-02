# Requirement: List all Tasks

This document describes the requirements for an AWS Lambda REST API endpoint that will list all **Task** items found in DynamoDB.

---

## Description

Create an AWS Lambda function which handles a REST API request to retrieve all **Task** items from DynamoDB. The task service should fetch the **Task** items from the task table in AWS DynamoDB. The task service should use the AWS SDK to interact with AWS DynamoDB. The task service should use the DynamoDB Document Client. The Lambda function should return the collection of **Task** items in the response body if successful along with an appropriate HTTP status code (200). If an error occurs, the Lambda function should return an appropriate HTTP status code (500) and the body should contain a meaningful message as JSON.

Create appropriate AWS infrastructure for the new Lambda function using the AWS CDK.

Add unit tests for the newly created and updated source members.

Implement these requirements step by step. Follow all best practices and structure for this project.
