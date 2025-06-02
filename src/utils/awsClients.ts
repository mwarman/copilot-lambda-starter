import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { config } from './config.js';
import { logger } from './logger.js';

/**
 * Singleton DynamoDB client configured with the application's region
 */
const dynamoClient = new DynamoDBClient({
  region: config.AWS_REGION,
});

logger.info('Initialized AWS DynamoDB client', { region: config.AWS_REGION });

/**
 * DynamoDB Document client for easier interaction with DynamoDB
 */
export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * Export the base DynamoDB client for direct operations if needed
 */
export const dynamoDBClient = dynamoClient;
