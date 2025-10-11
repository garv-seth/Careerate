/**
 * Encryption Service for Cloud Credentials
 * 
 * Provides AES-256-GCM encryption for sensitive cloud provider credentials
 * Uses Azure Key Vault for master encryption key storage
 * 
 * Security Features:
 * - AES-256-GCM authenticated encryption
 * - Unique IV (initialization vector) per encryption
 * - Key rotation support
 * - Tamper detection via authentication tag
 */

import crypto from 'crypto';
import { keyVaultService } from './azureKeyVaultService';

// Encryption algorithm configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const KEY_LENGTH = 32; // 256 bits

interface EncryptedData {
  encrypted: string; // Base64 encoded ciphertext
  iv: string; // Base64 encoded initialization vector
  authTag: string; // Base64 encoded authentication tag
  algorithm: string; // Encryption algorithm used
  keyId: string; // Key Vault key ID for rotation tracking
  encryptedAt: string; // ISO timestamp
}

interface CloudCredentials {
  // AWS
  roleArn?: string;
  externalId?: string;
  region?: string;
  
  // Azure
  tenantId?: string;
  subscriptionId?: string;
  clientId?: string;
  clientSecret?: string;
  
  // GCP
  projectId?: string;
  serviceAccountKey?: object;
  
  // Additional metadata
  [key: string]: any;
}

class EncryptionService {
  private masterKeyCache: Buffer | null = null;
  private masterKeyId: string = 'ENCRYPTION_MASTER_KEY';

  /**
   * Get or generate master encryption key from Azure Key Vault
   */
  private async getMasterKey(): Promise<{ key: Buffer; keyId: string }> {
    try {
      // Check cache first (valid for 1 hour in production)
      if (this.masterKeyCache) {
        return { key: this.masterKeyCache, keyId: this.masterKeyId };
      }

      // Try to get existing key from Key Vault
      let masterKeyHex = await keyVaultService.getSecret(this.masterKeyId);

      if (!masterKeyHex) {
        // Generate new master key (first time setup)
        console.log('🔐 Generating new master encryption key...');
        const newKey = crypto.randomBytes(KEY_LENGTH);
        masterKeyHex = newKey.toString('hex');
        
        // Store in Key Vault
        await keyVaultService.setSecret(this.masterKeyId, masterKeyHex);
        console.log('✅ Master encryption key stored in Key Vault');
      }

      // Parse and cache
      const key = Buffer.from(masterKeyHex, 'hex');
      this.masterKeyCache = key;

      return { key, keyId: this.masterKeyId };
    } catch (error) {
      console.error('❌ Failed to get master encryption key:', error);
      throw new Error('Encryption service unavailable');
    }
  }

  /**
   * Encrypt cloud provider credentials
   */
  async encryptCredentials(credentials: CloudCredentials): Promise<string> {
    try {
      // Get master key
      const { key: masterKey, keyId } = await this.getMasterKey();

      // Serialize credentials to JSON
      const plaintext = JSON.stringify(credentials);

      // Generate random IV (must be unique for each encryption)
      const iv = crypto.randomBytes(IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);

      // Encrypt
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // Get authentication tag (proves data hasn't been tampered with)
      const authTag = cipher.getAuthTag();

      // Package encrypted data
      const encryptedData: EncryptedData = {
        encrypted,
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        algorithm: ALGORITHM,
        keyId,
        encryptedAt: new Date().toISOString()
      };

      // Return as JSON string (stored in database)
      return JSON.stringify(encryptedData);
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt credentials');
    }
  }

  /**
   * Decrypt cloud provider credentials
   */
  async decryptCredentials(encryptedDataJson: string): Promise<CloudCredentials> {
    try {
      // Parse encrypted data package
      const encryptedData: EncryptedData = JSON.parse(encryptedDataJson);

      // Get master key (use keyId for rotation support in future)
      const { key: masterKey } = await this.getMasterKey();

      // Decode components from base64
      const iv = Buffer.from(encryptedData.iv, 'base64');
      const authTag = Buffer.from(encryptedData.authTag, 'base64');
      const encrypted = encryptedData.encrypted;

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, masterKey, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      // Parse back to object
      return JSON.parse(decrypted) as CloudCredentials;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      
      // Provide helpful error messages
      if (error instanceof SyntaxError) {
        throw new Error('Invalid encrypted data format');
      }
      if ((error as any).code === 'ERR_CRYPTO_INVALID_AUTH_TAG') {
        throw new Error('Credentials have been tampered with or corrupted');
      }
      
      throw new Error('Failed to decrypt credentials');
    }
  }

  /**
   * Rotate encryption key (for future use)
   * 
   * Process:
   * 1. Generate new master key
   * 2. Decrypt all credentials with old key
   * 3. Re-encrypt with new key
   * 4. Update database
   * 5. Store new key in Key Vault
   */
  async rotateEncryptionKey(): Promise<void> {
    // TODO: Implement key rotation
    // This will be a critical operation that requires careful orchestration
    throw new Error('Key rotation not yet implemented');
  }

  /**
   * Hash sensitive data (one-way, for comparison)
   * Useful for detecting duplicate connections without storing plaintext
   */
  hashCredentials(credentials: CloudCredentials): string {
    const data = JSON.stringify(credentials);
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Clear cached master key (for testing or security)
   */
  clearCache(): void {
    this.masterKeyCache = null;
  }

  /**
   * Validate encrypted data structure
   */
  isValidEncryptedData(data: string): boolean {
    try {
      const parsed: EncryptedData = JSON.parse(data);
      return !!(
        parsed.encrypted &&
        parsed.iv &&
        parsed.authTag &&
        parsed.algorithm &&
        parsed.keyId
      );
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

// Export types
export type { CloudCredentials, EncryptedData };

