import type { Request } from "express";
import { getSecret, healthCheck } from "./keyVault";

export type ReadinessItem = {
  key: string;
  label: string;
  required: boolean;
  present: boolean;
};

export type ReadinessReport = {
  keyVaultReachable: boolean;
  items: ReadinessItem[];
  providers: { id: string; label: string; ready: boolean }[];
  integrations: { id: string; label: string; ready: boolean }[];
};

const REQUIRED_SECRETS = {
  azure: [
    { name: "azure-client-id", label: "Azure Client ID" },
    { name: "azure-client-secret", label: "Azure Client Secret" },
    { name: "azure-tenant-id", label: "Azure Tenant ID" },
    { name: "azure-subscription-id", label: "Azure Subscription ID" },
  ],
  aws: [
    { name: "aws-access-key-id", label: "AWS Access Key ID" },
    { name: "aws-secret-access-key", label: "AWS Secret Access Key" },
  ],
  gcp: [
    { name: "google-cloud-credentials", label: "GCP Credentials JSON" },
    { name: "google-cloud-project-id", label: "GCP Project ID" },
  ],
};

const OPTIONAL_INTEGRATIONS = [
  { name: "datadog-api-key", label: "Datadog API Key" },
  { name: "datadog-app-key", label: "Datadog App Key" },
  { name: "sendgrid-api-key", label: "SendGrid API Key" },
  { name: "slack-bot-token", label: "Slack Bot Token" },
  { name: "github-token", label: "GitHub Personal Access Token" },
  { name: "gitlab-token", label: "GitLab Personal Access Token" },
];

async function hasSecret(name: string): Promise<boolean> {
  try {
    const v = await getSecret(name);
    return Boolean(v && v.length > 0);
  } catch {
    return false;
  }
}

export async function generateReadinessReport(_req: Request): Promise<ReadinessReport> {
  const kvOk = await healthCheck();

  // Providers
  const azureItems = await Promise.all(
    REQUIRED_SECRETS.azure.map(async (s) => ({
      key: s.name,
      label: s.label,
      required: true,
      present: await hasSecret(s.name),
    }))
  );
  const awsItems = await Promise.all(
    REQUIRED_SECRETS.aws.map(async (s) => ({
      key: s.name,
      label: s.label,
      required: true,
      present: await hasSecret(s.name),
    }))
  );
  const gcpItems = await Promise.all(
    REQUIRED_SECRETS.gcp.map(async (s) => ({
      key: s.name,
      label: s.label,
      required: true,
      present: await hasSecret(s.name),
    }))
  );

  const items = [...azureItems, ...awsItems, ...gcpItems];

  const providers = [
    { id: "azure", label: "Azure", ready: azureItems.every((i) => i.present) },
    { id: "aws", label: "AWS", ready: awsItems.every((i) => i.present) },
    { id: "gcp", label: "GCP", ready: gcpItems.every((i) => i.present) },
  ];

  const integrations = await Promise.all(
    OPTIONAL_INTEGRATIONS.map(async (i) => ({
      id: i.name,
      label: i.label,
      ready: await hasSecret(i.name),
    }))
  );

  return {
    keyVaultReachable: kvOk,
    items,
    providers,
    integrations,
  };
}


