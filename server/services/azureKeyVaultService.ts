import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

/**
 * Enterprise-grade Azure Key Vault integration service
 * Provides secure, cached access to all platform secrets
 */

interface SecretCache {
  value: string;
  expiresAt: number;
}

class AzureKeyVaultService {
  private client: SecretClient | null = null;
  private cache: Map<string, SecretCache> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly vaultName: string;
  private isInitialized = false;

  constructor() {
    this.vaultName = process.env.AZURE_KEY_VAULT_NAME || "CareeerateSecretsVault";
  }

  /**
   * Initialize the Key Vault client with Azure credentials
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const vaultUrl = `https://${this.vaultName}.vault.azure.net`;
      const credential = new DefaultAzureCredential({
        additionallyAllowedTenants: ["*"] // Allow access to KeyVault in any tenant
      });
      this.client = new SecretClient(vaultUrl, credential);
      this.isInitialized = true;
      console.log(`✅ Azure Key Vault connected: ${this.vaultName}`);
    } catch (error) {
      console.error("❌ Failed to initialize Azure Key Vault:", error);
      throw new Error("Key Vault initialization failed");
    }
  }

  /**
   * Get a secret from Key Vault with caching
   */
  async getSecret(secretName: string): Promise<string | null> {
    await this.initialize();

    // Check cache first
    const cached = this.cache.get(secretName);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    try {
      if (!this.client) {
        throw new Error("Key Vault client not initialized");
      }

      const secret = await this.client.getSecret(secretName);

      if (!secret.value) {
        console.warn(`⚠️ Secret ${secretName} exists but has no value`);
        return null;
      }

      // Cache the secret
      this.cache.set(secretName, {
        value: secret.value,
        expiresAt: Date.now() + this.CACHE_TTL
      });

      return secret.value;
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.warn(`⚠️ Secret not found: ${secretName}`);
        return null;
      }
      console.error(`❌ Failed to fetch secret ${secretName}:`, error.message);
      return null;
    }
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(secretNames: string[]): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};

    await Promise.all(
      secretNames.map(async (name) => {
        results[name] = await this.getSecret(name);
      })
    );

    return results;
  }

  /**
   * Get all secrets for a specific integration
   */
  async getIntegrationSecrets(integrationPrefix: string): Promise<Record<string, string>> {
    await this.initialize();

    if (!this.client) {
      throw new Error("Key Vault client not initialized");
    }

    const secrets: Record<string, string> = {};

    try {
      // List all secrets with the prefix
      for await (const secretProperties of this.client.listPropertiesOfSecrets()) {
        if (secretProperties.name.toUpperCase().startsWith(integrationPrefix.toUpperCase())) {
          const secretValue = await this.getSecret(secretProperties.name);
          if (secretValue) {
            secrets[secretProperties.name] = secretValue;
          }
        }
      }
    } catch (error) {
      console.error(`❌ Failed to list secrets for ${integrationPrefix}:`, error);
    }

    return secrets;
  }

  /**
   * Check if required secrets exist for an integration
   */
  async checkIntegrationStatus(
    integrationId: string,
    requiredSecrets: string[]
  ): Promise<{ ready: boolean; missing: string[] }> {
    const secrets = await this.getSecrets(requiredSecrets);
    const missing = requiredSecrets.filter(name => !secrets[name]);

    return {
      ready: missing.length === 0,
      missing
    };
  }

  /**
   * Get all available integrations from Key Vault
   */
  async getAvailableIntegrations(): Promise<string[]> {
    await this.initialize();

    if (!this.client) {
      return [];
    }

    const integrations = new Set<string>();

    try {
      for await (const secretProperties of this.client.listPropertiesOfSecrets()) {
        // Extract integration prefix (e.g., "GITHUB" from "GITHUB-CLIENT-ID")
        const parts = secretProperties.name.split('-');
        if (parts.length > 1) {
          integrations.add(parts[0].toLowerCase());
        }
      }
    } catch (error) {
      console.error("❌ Failed to list available integrations:", error);
    }

    return Array.from(integrations);
  }

  /**
   * Clear the cache (useful for testing or forced refresh)
   */
  clearCache(): void {
    this.cache.clear();
    console.log("🧹 Secret cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
export const keyVaultService = new AzureKeyVaultService();

// Export for testing
export { AzureKeyVaultService };
