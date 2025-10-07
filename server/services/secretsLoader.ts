/**
 * Secrets Loader Service
 * Loads all secrets from Azure Key Vault at startup and injects into process.env
 * This allows the app to use process.env while keeping secrets secure in Key Vault
 */

import { keyVaultService } from './azureKeyVaultService';

export interface LoadedSecrets {
  loaded: number;
  failed: string[];
  integrations: string[];
}

/**
 * Load all application secrets from Azure Key Vault
 */
export async function loadSecretsFromKeyVault(): Promise<LoadedSecrets> {
  console.log('🔐 Loading secrets from Azure Key Vault...');
  console.log(`   Vault: ${process.env.AZURE_KEY_VAULT_NAME || 'NOT SET'}`);
  
  const secretMappings: Record<string, string> = {
    // AWS
    'AWS-ACCESS-KEY-ID': 'AWS_ACCESS_KEY_ID',
    'AWS-SECRET-ACCESS-KEY': 'AWS_SECRET_ACCESS_KEY',
    
    // GCP
    'GOOGLE-CLOUD-PROJECT': 'GOOGLE_CLOUD_PROJECT',
    'GOOGLE-CLOUD-CLIENT-EMAIL': 'GOOGLE_CLOUD_CLIENT_EMAIL',
    'GOOGLE-CLOUD-PRIVATE-KEY': 'GOOGLE_CLOUD_PRIVATE_KEY',
    
    // GitHub
    'GITHUB-CLIENT-ID': 'GITHUB_CLIENT_ID',
    'GITHUB-CLIENT-SECRET': 'GITHUB_CLIENT_SECRET',
    'GITHUB-REDIRECT-URI': 'GITHUB_REDIRECT_URI',
    
    // GitLab
    'GITLAB-CLIENT-ID': 'GITLAB_CLIENT_ID',
    'GITLAB-CLIENT-SECRET': 'GITLAB_CLIENT_SECRET',
    
    // Azure (for multi-tenant scenarios)
    'AZURE-CLIENT-ID': 'AZURE_CLIENT_ID',
    'AZURE-CLIENT-SECRET': 'AZURE_CLIENT_SECRET',
    'AZURE-TENANT-ID': 'AZURE_TENANT_ID',
    'AZURE-REDIRECT-URI': 'AZURE_REDIRECT_URI',
    
    // AI Services
    'OPENAI-API-KEY': 'OPENAI_API_KEY',
    'ANTHROPIC-API-KEY': 'ANTHROPIC_API_KEY',
    
    // Database
    'DATABASE-URL': 'DATABASE_URL',
    
    // Encryption
    'ENCRYPTION-MASTER-KEY': 'ENCRYPTION_KEY',
    
    // Session
    'SESSION-SECRET': 'SESSION_SECRET',
    'JWT-SECRET': 'JWT_SECRET',
    'JWT-REFRESH-SECRET': 'JWT_REFRESH_SECRET',
    
    // Additional integrations
    'STRIPE-SECRET-KEY': 'STRIPE_SECRET_KEY',
    'STRIPE-WEBHOOK-SECRET': 'STRIPE_WEBHOOK_SECRET',
    'SENDGRID-API-KEY': 'SENDGRID_API_KEY',
    'SLACK-BOT-TOKEN': 'SLACK_BOT_TOKEN',
    'PAGERDUTY-API-KEY': 'PAGERDUTY_API_KEY',
  };

  const failed: string[] = [];
  let loaded = 0;
  const integrations = new Set<string>();

  // Load each secret from Key Vault
  for (const [keyVaultName, envVarName] of Object.entries(secretMappings)) {
    try {
      const value = await keyVaultService.getSecret(keyVaultName);
      
      if (value) {
        // Inject into process.env (only if not already set)
        if (!process.env[envVarName]) {
          process.env[envVarName] = value;
          loaded++;
          console.log(`   ✅ Loaded: ${keyVaultName} -> ${envVarName}`);
          
          // Track which integrations are available
          const integration = keyVaultName.split('-')[0].toLowerCase();
          integrations.add(integration);
        } else {
          console.log(`   ⏭️  Skipped (already set): ${envVarName}`);
        }
      } else {
        // Secret not found (optional secrets)
        console.log(`   ℹ️  Optional secret not found: ${keyVaultName}`);
      }
    } catch (error: any) {
      console.error(`   ❌ Failed to load ${keyVaultName}:`, error.message);
      failed.push(keyVaultName);
    }
  }

  console.log(`✅ Loaded ${loaded} secrets from Key Vault`);
  console.log(`🔌 Available integrations: ${Array.from(integrations).join(', ')}`);
  
  if (failed.length > 0) {
    console.warn(`⚠️  Failed to load ${failed.length} secrets: ${failed.join(', ')}`);
  }

  return {
    loaded,
    failed,
    integrations: Array.from(integrations),
  };
}

/**
 * Load GCP service account credentials from Key Vault and create credentials file
 */
export async function loadGCPCredentials(): Promise<boolean> {
  try {
    const projectId = await keyVaultService.getSecret('GOOGLE-CLOUD-PROJECT');
    const clientEmail = await keyVaultService.getSecret('GOOGLE-CLOUD-CLIENT-EMAIL');
    const privateKey = await keyVaultService.getSecret('GOOGLE-CLOUD-PRIVATE-KEY');

    if (!projectId || !clientEmail || !privateKey) {
      console.log('ℹ️  GCP credentials not configured (optional)');
      return false;
    }

    // Create GCP credentials object
    const gcpCredentials = {
      type: 'service_account',
      project_id: projectId,
      private_key_id: 'key-from-keyvault',
      private_key: privateKey,
      client_email: clientEmail,
      client_id: '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`,
    };

    // Store in memory for GCP SDK to use
    process.env.GCP_CREDENTIALS_JSON = JSON.stringify(gcpCredentials);
    process.env.GOOGLE_CLOUD_PROJECT = projectId;
    
    console.log('✅ GCP credentials loaded from Key Vault');
    return true;
  } catch (error: any) {
    console.error('❌ Failed to load GCP credentials:', error.message);
    return false;
  }
}

/**
 * Validate that required secrets are loaded
 */
export function validateRequiredSecrets(): void {
  const required = [
    'ENCRYPTION_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`❌ Missing required secrets: ${missing.join(', ')}`);
  }

  console.log('✅ All required secrets validated');
}

/**
 * Get available integrations based on loaded secrets
 */
export function getAvailableIntegrations(): string[] {
  const integrations: string[] = [];

  // Check AWS
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    integrations.push('aws');
  }

  // Check GCP
  if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
    integrations.push('gcp');
  }

  // Check Azure
  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
    integrations.push('azure');
  }

  // Check GitHub
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    integrations.push('github');
  }

  // Check GitLab
  if (process.env.GITLAB_CLIENT_ID && process.env.GITLAB_CLIENT_SECRET) {
    integrations.push('gitlab');
  }

  // Check OpenAI
  if (process.env.OPENAI_API_KEY) {
    integrations.push('openai');
  }

  return integrations;
}

