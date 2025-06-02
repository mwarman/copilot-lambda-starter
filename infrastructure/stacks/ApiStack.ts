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

    // Grant the Lambda function permissions to write to the DynamoDB table
    tasksTable.grantWriteData(createTaskFunction);

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
