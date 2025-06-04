/**
 * backend/src/config/secrets.ts
 * Centralized secrets management using Azure Key Vault
 */
import { keyVaultService } from '../services/keyVaultService';
import { logger } from '../utils/logger';

export class SecretsManager {
  private static instance: SecretsManager;
  private secretsCache: Map<string, string> = new Map();

  private constructor() {}

  static getInstance(): SecretsManager {
    if (!SecretsManager.instance) {
      SecretsManager.instance = new SecretsManager();
    }
    return SecretsManager.instance;
  }

  async initializeSecrets(): Promise<void> {
    logger.info('Initializing secrets from Key Vault...');

    const secretMappings = [
      { keyVaultName: 'cosmos-db-key', envVar: 'COSMOS_DB_KEY', cacheKey: 'COSMOS_DB_KEY' },
      { keyVaultName: 'cosmos-db-endpoint', envVar: 'COSMOS_DB_ENDPOINT', cacheKey: 'COSMOS_DB_ENDPOINT' },
      { keyVaultName: 'jwt-secret', envVar: 'JWT_SECRET', cacheKey: 'JWT_SECRET' },
      { keyVaultName: 'session-secret', envVar: 'SESSION_SECRET', cacheKey: 'SESSION_SECRET' },
      { keyVaultName: 'encryption-key', envVar: 'ENCRYPTION_KEY', cacheKey: 'ENCRYPTION_KEY' },
      { keyVaultName: 'azure-openai-key', envVar: 'AZURE_OPENAI_API_KEY', cacheKey: 'AZURE_OPENAI_API_KEY' },
      { keyVaultName: 'azure-storage-connection', envVar: 'AZURE_STORAGE_CONNECTION_STRING', cacheKey: 'AZURE_STORAGE_CONNECTION_STRING' }
    ];

    for (const mapping of secretMappings) {
      try {
        const secretValue = await keyVaultService.getSecret(mapping.keyVaultName, mapping.envVar);
        if (secretValue) {
          this.secretsCache.set(mapping.cacheKey, secretValue);
          logger.info(`Secret ${mapping.cacheKey} loaded successfully`);
        } else {
          logger.warn(`Secret ${mapping.cacheKey} could not be loaded`);
        }
      } catch (error) {
        logger.error(`Error loading secret ${mapping.cacheKey}:`, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    logger.info('Secrets initialization completed');
  }

  getSecret(key: string): string | null {
    return this.secretsCache.get(key) || null;
  }

  // Specific getter methods for type safety
  getCosmosDbKey(): string | null {
    return this.getSecret('COSMOS_DB_KEY');
  }

  getCosmosDbEndpoint(): string | null {
    return this.getSecret('COSMOS_DB_ENDPOINT');
  }

  getJwtSecret(): string | null {
    return this.getSecret('JWT_SECRET');
  }

  getSessionSecret(): string | null {
    return this.getSecret('SESSION_SECRET');
  }

  getEncryptionKey(): string | null {
    return this.getSecret('ENCRYPTION_KEY');
  }

  getAzureOpenAIKey(): string | null {
    return this.getSecret('AZURE_OPENAI_API_KEY');
  }

  getAzureStorageConnectionString(): string | null {
    return this.getSecret('AZURE_STORAGE_CONNECTION_STRING');
  }
}

export const secretsManager = SecretsManager.getInstance(); 