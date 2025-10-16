/**
 * Azure Key Vault Service
 *
 * Retrieves credentials for cloud providers and third-party integrations
 * from Azure Key Vault (CareeerateSecretsVault)
 */

import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const VAULT_URL = "https://careeeratesecretsvault.vault.azure.net";

let secretClient: SecretClient | null = null;

/**
 * Initialize Azure Key Vault client
 */
function getSecretClient(): SecretClient {
  if (!secretClient) {
    const credential = new DefaultAzureCredential({
      additionallyAllowedTenants: ["*"] // Allow access to KeyVault in any tenant
    });
    secretClient = new SecretClient(VAULT_URL, credential);
  }
  return secretClient;
}

/**
 * Retrieve a single secret from Key Vault
 */
export async function getSecret(secretName: string): Promise<string> {
  try {
    const client = getSecretClient();
    const secret = await client.getSecret(secretName);

    if (!secret.value) {
      throw new Error(`Secret ${secretName} has no value`);
    }

    return secret.value;
  } catch (error) {
    console.error(`Error retrieving secret ${secretName}:`, error);
    throw new Error(`Failed to retrieve secret ${secretName}`);
  }
}

/**
 * Retrieve multiple secrets in one call
 */
export async function getSecrets(secretNames: string[]): Promise<Record<string, string>> {
  const secrets: Record<string, string> = {};

  for (const secretName of secretNames) {
    secrets[secretName] = await getSecret(secretName);
  }

  return secrets;
}

/**
 * Get AWS credentials
 */
export async function getAwsCredentials() {
  return {
    accessKeyId: await getSecret('aws-access-key-id'),
    secretAccessKey: await getSecret('aws-secret-access-key')
  };
}

/**
 * Get Azure credentials
 */
export async function getAzureCredentials() {
  return {
    clientId: await getSecret('azure-client-id'),
    clientSecret: await getSecret('azure-client-secret'),
    tenantId: await getSecret('azure-tenant-id'),
    subscriptionId: await getSecret('azure-subscription-id')
  };
}

/**
 * Get Google Cloud credentials
 */
export async function getGcpCredentials() {
  return {
    credentials: await getSecret('google-cloud-credentials'),
    projectId: await getSecret('google-cloud-project-id')
  };
}

/**
 * Get Vercel API token
 */
export async function getVercelToken() {
  return await getSecret('vercel-api-token');
}

/**
 * Get Railway API token
 */
export async function getRailwayToken() {
  return await getSecret('railway-api-token');
}

/**
 * Get Neon API key
 */
export async function getNeonApiKey() {
  return await getSecret('neon-api-key');
}

/**
 * Get MongoDB Atlas credentials
 */
export async function getMongoDbAtlasCredentials() {
  return {
    apiKey: await getSecret('mongodb-atlas-api-key'),
    publicKey: await getSecret('mongodb-atlas-public-key'),
    privateKey: await getSecret('mongodb-atlas-private-key')
  };
}

/**
 * Get Datadog credentials
 */
export async function getDatadogCredentials() {
  return {
    apiKey: await getSecret('datadog-api-key'),
    appKey: await getSecret('datadog-app-key')
  };
}

/**
 * Get SendGrid API key
 */
export async function getSendGridApiKey() {
  return await getSecret('sendgrid-api-key');
}

/**
 * Get Slack bot token
 */
export async function getSlackBotToken() {
  return await getSecret('slack-bot-token');
}

/**
 * Check if Key Vault is accessible
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getSecretClient();
    // Try to list secrets (just to check connectivity)
    const secretIterator = client.listPropertiesOfSecrets();
    await secretIterator.next();
    return true;
  } catch (error) {
    console.error('Key Vault health check failed:', error);
    return false;
  }
}
