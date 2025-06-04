/**
 * backend/src/services/keyVaultService.ts
 * Azure Key Vault service for secure secrets management
 */
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential, ManagedIdentityCredential } from '@azure/identity';
import { logger } from '../utils/logger';

interface KeyVaultConfig {
  vaultUrl: string;
  useKeyVault: boolean;
}

class KeyVaultService {
  private client: SecretClient | null = null;
  private config: KeyVaultConfig;
  private secretsCache: Map<string, { value: string; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  constructor() {
    this.config = {
      vaultUrl: process.env.AZURE_KEY_VAULT_URL || '',
      useKeyVault: process.env.USE_KEY_VAULT === 'true'
    };

    if (this.config.useKeyVault && this.config.vaultUrl) {
      this.initializeClient();
    }
  }

  private initializeClient(): void {
    try {
      // Use ManagedIdentityCredential for Azure services, DefaultAzureCredential for local dev
      const credential = process.env.NODE_ENV === 'production' 
        ? new ManagedIdentityCredential()
        : new DefaultAzureCredential();

      this.client = new SecretClient(this.config.vaultUrl, credential);
      logger.info('Key Vault client initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Key Vault client:', { error: error instanceof Error ? error.message : String(error) });
      this.client = null;
    }
  }

  async getSecret(secretName: string, fallbackEnvVar?: string): Promise<string | null> {
    // Check cache first
    const cached = this.secretsCache.get(secretName);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.value;
    }

    // Try Key Vault if configured
    if (this.config.useKeyVault && this.client) {
      try {
        const secret = await this.client.getSecret(secretName);
        if (secret.value) {
          // Cache the secret
          this.secretsCache.set(secretName, {
            value: secret.value,
            timestamp: Date.now()
          });
          return secret.value;
        }
      } catch (error) {
        logger.warn(`Failed to retrieve secret ${secretName} from Key Vault:`, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    // Fallback to environment variable
    if (fallbackEnvVar) {
      const envValue = process.env[fallbackEnvVar];
      if (envValue) {
        logger.info(`Using fallback environment variable for ${secretName}`);
        // Cache the environment variable value
        this.secretsCache.set(secretName, {
          value: envValue,
          timestamp: Date.now()
        });
        return envValue;
      }
    }

    logger.error(`Secret ${secretName} not found in Key Vault or environment variables`);
    return null;
  }

  async setSecret(secretName: string, secretValue: string): Promise<boolean> {
    if (!this.config.useKeyVault || !this.client) {
      logger.warn('Key Vault not configured, cannot set secret');
      return false;
    }

    try {
      await this.client.setSecret(secretName, secretValue);
      
      // Update cache
      this.secretsCache.set(secretName, {
        value: secretValue,
        timestamp: Date.now()
      });
      
      logger.info(`Secret ${secretName} set successfully`);
      return true;
    } catch (error) {
      logger.error(`Failed to set secret ${secretName}:`, { error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  clearCache(): void {
    this.secretsCache.clear();
    logger.info('Key Vault secrets cache cleared');
  }

  isKeyVaultEnabled(): boolean {
    return this.config.useKeyVault && this.client !== null;
  }
}

export const keyVaultService = new KeyVaultService(); 