import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'path';

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for tasks
    const tasksTable = new dynamodb.Table(this, 'TasksTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // Use RETAIN for production
    });

    // Create and configure CloudWatch Log Group for the Lambda function
    const createTaskFunctionLogGroup = new logs.LogGroup(this, 'CreateTaskFunctionLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda function for creating tasks
    const createTaskFunction = new lambdaNodejs.NodejsFunction(this, 'CreateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/handlers/createTask.ts'),
      handler: 'createTask',
      environment: {
        TASKS_TABLE: tasksTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
      logGroup: createTaskFunctionLogGroup,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(6),
    });

    // Create and configure CloudWatch Log Group for the list tasks Lambda function
    const listTasksFunctionLogGroup = new logs.LogGroup(this, 'ListTasksFunctionLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda function for listing tasks
    const listTasksFunction = new lambdaNodejs.NodejsFunction(this, 'ListTasksFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/handlers/listTasks.ts'),
      handler: 'listTasks',
      environment: {
        TASKS_TABLE: tasksTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
      logGroup: listTasksFunctionLogGroup,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(6),
    });

    // Create and configure CloudWatch Log Group for the get task Lambda function
    const getTaskFunctionLogGroup = new logs.LogGroup(this, 'GetTaskFunctionLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda function for getting a task by ID
    const getTaskFunction = new lambdaNodejs.NodejsFunction(this, 'GetTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/handlers/getTask.ts'),
      handler: 'getTask',
      environment: {
        TASKS_TABLE: tasksTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
      logGroup: getTaskFunctionLogGroup,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(6),
    });

    // Create and configure CloudWatch Log Group for the update task Lambda function
    const updateTaskFunctionLogGroup = new logs.LogGroup(this, 'UpdateTaskFunctionLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda function for updating a task by ID
    const updateTaskFunction = new lambdaNodejs.NodejsFunction(this, 'UpdateTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/handlers/updateTask.ts'),
      handler: 'updateTask',
      environment: {
        TASKS_TABLE: tasksTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
      logGroup: updateTaskFunctionLogGroup,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(6),
    });

    // Create and configure CloudWatch Log Group for the delete task Lambda function
    const deleteTaskFunctionLogGroup = new logs.LogGroup(this, 'DeleteTaskFunctionLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create Lambda function for deleting a task by ID
    const deleteTaskFunction = new lambdaNodejs.NodejsFunction(this, 'DeleteTaskFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, '../../src/handlers/deleteTask.ts'),
      handler: 'deleteTask',
      environment: {
        TASKS_TABLE: tasksTable.tableName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
      logGroup: deleteTaskFunctionLogGroup,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(6),
    });

    // Grant the Lambda functions permissions to access the DynamoDB table
    tasksTable.grantWriteData(createTaskFunction);
    tasksTable.grantReadData(listTasksFunction);
    tasksTable.grantReadData(getTaskFunction);
    tasksTable.grantReadWriteData(updateTaskFunction);
    tasksTable.grantReadWriteData(deleteTaskFunction);

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'TasksApi', {
      restApiName: 'Task Service API',
      description: 'API for managing tasks',
      deployOptions: {
        stageName: 'api',
      },
    });

    // Create a tasks resource
    const tasksResource = api.root.addResource('tasks');

    // Add a POST method to create a new task
    tasksResource.addMethod('POST', new apigateway.LambdaIntegration(createTaskFunction));

    // Add a GET method to list all tasks
    tasksResource.addMethod('GET', new apigateway.LambdaIntegration(listTasksFunction));

    // Create a task resource
    const taskResource = tasksResource.addResource('{taskId}');

    // Add a GET method to get a task by ID
    taskResource.addMethod('GET', new apigateway.LambdaIntegration(getTaskFunction));

    // Add a PUT method to update a task by ID
    taskResource.addMethod('PUT', new apigateway.LambdaIntegration(updateTaskFunction));

    // Add a DELETE method to delete a task by ID
    taskResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTaskFunction));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'URL for the Task Service API',
    });

    // Output the DynamoDB table name
    new cdk.CfnOutput(this, 'TasksTableName', {
      value: tasksTable.tableName,
      description: 'Name of the Tasks DynamoDB table',
    });
  }
}
