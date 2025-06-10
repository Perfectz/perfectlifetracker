/**
 * backend/src/config/database.ts
 * Cosmos DB configuration and connection
 */
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export interface DatabaseConfig {
  endpoint: string;
  key: string;
  databaseId: string;
  useMockDatabase: boolean;
  connectionPolicy: {
    requestTimeout: number;
    connectionMode: string;
    maxRetryAttemptCount: number;
    maxRetryWaitTimeInSeconds: number;
  };
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const useMockDatabase = process.env.USE_MOCK_DATABASE === 'true' || process.env.NODE_ENV === 'test';
  
  if (useMockDatabase) {
    logger.info('Using mock database configuration');
    return {
      endpoint: '',
      key: '',
      databaseId: 'mock-database',
      useMockDatabase: true,
      connectionPolicy: {
        requestTimeout: 10000,
        connectionMode: 'Gateway',
        maxRetryAttemptCount: 3,
        maxRetryWaitTimeInSeconds: 30
      }
    };
  }

  const config: DatabaseConfig = {
    endpoint: process.env.COSMOS_DB_ENDPOINT || '',
    key: process.env.COSMOS_DB_KEY || '',
    databaseId: process.env.COSMOS_DB_DATABASE || 'lifetrackpro-db',
    useMockDatabase: false,
    connectionPolicy: {
      requestTimeout: 10000,
      connectionMode: 'Gateway',
      maxRetryAttemptCount: 3,
      maxRetryWaitTimeInSeconds: 30
    }
  };

  // Validate required configuration
  if (!config.endpoint || !config.key) {
    logger.warn('Missing Cosmos DB configuration, falling back to mock database');
    config.useMockDatabase = true;
  }

  return config;
};

export default getDatabaseConfig();