import { getSecret } from "./keyVault";

export type Integration = {
  id: string;
  name: string;
  category: "cloud" | "database" | "monitoring" | "messaging" | "ci_cd" | "notifications" | "auth" | "storage" | "other";
  docsUrl?: string;
  requiredSecrets: string[];
};

export const INTEGRATIONS: Integration[] = [
  // Cloud providers
  { id: "azure", name: "Azure", category: "cloud", docsUrl: "https://learn.microsoft.com/azure", requiredSecrets: ["azure-client-id","azure-client-secret","azure-tenant-id","azure-subscription-id"] },
  { id: "aws", name: "AWS", category: "cloud", docsUrl: "https://docs.aws.amazon.com", requiredSecrets: ["aws-access-key-id","aws-secret-access-key"] },
  { id: "gcp", name: "Google Cloud", category: "cloud", docsUrl: "https://cloud.google.com/docs", requiredSecrets: ["google-cloud-credentials","google-cloud-project-id"] },

  // Databases
  { id: "neon", name: "Neon Postgres", category: "database", docsUrl: "https://neon.tech/docs", requiredSecrets: ["neon-api-key"] },
  { id: "railway", name: "Railway", category: "database", docsUrl: "https://docs.railway.app", requiredSecrets: ["railway-api-token"] },
  { id: "mongodb", name: "MongoDB Atlas", category: "database", docsUrl: "https://www.mongodb.com/docs", requiredSecrets: ["mongodb-atlas-api-key","mongodb-atlas-public-key","mongodb-atlas-private-key"] },

  // Monitoring & APM
  { id: "datadog", name: "Datadog", category: "monitoring", docsUrl: "https://docs.datadoghq.com", requiredSecrets: ["datadog-api-key","datadog-app-key"] },
  { id: "opentelemetry", name: "OpenTelemetry", category: "monitoring", requiredSecrets: [] },

  // Notifications
  { id: "sendgrid", name: "SendGrid", category: "notifications", docsUrl: "https://docs.sendgrid.com", requiredSecrets: ["sendgrid-api-key"] },
  { id: "slack", name: "Slack", category: "notifications", docsUrl: "https://api.slack.com", requiredSecrets: ["slack-bot-token"] },

  // CI/CD & Repos
  { id: "github", name: "GitHub", category: "ci_cd", docsUrl: "https://docs.github.com", requiredSecrets: ["github-token"] },
  { id: "gitlab", name: "GitLab", category: "ci_cd", docsUrl: "https://docs.gitlab.com", requiredSecrets: ["gitlab-token"] },

  // Storage/CDN
  { id: "vercel", name: "Vercel", category: "storage", docsUrl: "https://vercel.com/docs", requiredSecrets: ["vercel-api-token"] },
  
  // Additional Cloud Providers
  { id: "oracle", name: "Oracle Cloud Infrastructure", category: "cloud", docsUrl: "https://docs.oracle.com", requiredSecrets: ["oracle-user-ocid","oracle-tenancy-ocid","oracle-fingerprint","oracle-private-key"] },
  
  // Additional Monitoring
  { id: "pagerduty", name: "PagerDuty", category: "monitoring", docsUrl: "https://developer.pagerduty.com", requiredSecrets: ["pagerduty-api-key"] },
  { id: "newrelic", name: "New Relic", category: "monitoring", docsUrl: "https://docs.newrelic.com", requiredSecrets: ["newrelic-api-key"] },
  
  // Additional Notifications
  { id: "discord", name: "Discord", category: "notifications", docsUrl: "https://discord.com/developers", requiredSecrets: ["discord-bot-token"] },
  { id: "teams", name: "Microsoft Teams", category: "notifications", docsUrl: "https://docs.microsoft.com/teams", requiredSecrets: ["teams-webhook-url"] },
];

export async function getIntegrationStatus() {
  const statuses = [] as { id: string; ready: boolean; missing: string[] }[];
  for (const integ of INTEGRATIONS) {
    const missing: string[] = [];
    for (const secret of integ.requiredSecrets) {
      try {
        const v = await getSecret(secret);
        if (!v) missing.push(secret);
      } catch {
        missing.push(secret);
      }
    }
    statuses.push({ id: integ.id, ready: missing.length === 0, missing });
  }
  return statuses;
}


