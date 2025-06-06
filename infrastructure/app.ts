#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from './stacks/ApiStack';
import { cdkConfig } from './utils/config';

const app = new cdk.App();

// Define tags that will be applied to all resources
const tags = {
  App: 'task-service',
  Env: cdkConfig.ENV,
  OU: 'leanstacks',
  Owner: 'M Warman',
};

// Create the API stack
new ApiStack(app, 'TaskServiceApiStack', {
  stackName: `task-service-api-${tags.Env}`,
  description: 'Task Service API with Lambda, API Gateway, and DynamoDB',
  tags: tags,
  env: {
    account: cdkConfig.CDK_DEFAULT_ACCOUNT,
    region: cdkConfig.CDK_DEFAULT_REGION,
  },
  corsAllowOrigin: cdkConfig.CORS_ALLOW_ORIGIN,
});
