import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().transform(Number).default("5000"),
  COSMOSDB_CONNECTION_STRING_CENTRALUS: z.string().min(1).optional(),
  COSMOSDB_KEY: z.string().min(32).optional(),
  
  // AI/ML Configuration - Azure AI Foundry (preferred) or OpenAI
  AZURE_AI_FOUNDRY_ENDPOINT: z.string().optional(),
  AZURE_AI_FOUNDRY_KEY: z.string().optional(),
  AZURE_FOUNDRY_PHI4_DEPLOYMENT: z.string().optional(),
  AZURE_FOUNDRY_MINISTRAL_DEPLOYMENT: z.string().optional(),
  AZURE_OPENAI_ENDPOINT: z.string().optional(),
  AZURE_OPENAI_API_KEY: z.string().optional(),
  AZURE_OPENAI_DEPLOYMENT_NAME: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  
  // Azure B2C Authentication
  AZURE_B2C_TENANT_NAME: z.string().optional(),
  AZURE_B2C_CLIENT_ID: z.string().optional(),
  AZURE_B2C_CLIENT_SECRET: z.string().optional(),
  AZURE_B2C_POLICY_NAME: z.string().default("B2C_1_signupsignin"),
  AZURE_B2C_REDIRECT_URI: z.string().optional(),
  AZURE_B2C_POST_LOGOUT_REDIRECT_URI: z.string().optional(),
  
  // Multi-Provider OAuth
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITLAB_CLIENT_ID: z.string().optional(),
  GITLAB_CLIENT_SECRET: z.string().optional(),
  
  // AWS Configuration
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default("us-east-1"),
  
  // Google Cloud Configuration
  GOOGLE_APPLICATION_CREDENTIALS: z.string().optional(),
  GOOGLE_CLOUD_PROJECT: z.string().optional(),
  
  // Azure Configuration
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),
  AZURE_TENANT_ID: z.string().optional(),
  AZURE_SUBSCRIPTION_ID: z.string().optional(),

  // Additional AI and Service Keys
  ANTHROPIC_API_KEY: z.string().optional(),
  BROWSERBASE_API_KEY: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
  DATADOG_APP_KEY: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),

  // Firebase Configuration
  FIREBASE_API_KEY: z.string().optional(),
  FIREBASE_AUTH_DOMAIN: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),

  // Gmail Configuration (likely for Google OAuth or email)
  GMAIL_CLIENT_ID: z.string().optional(),
  GMAIL_CLIENT_SECRET: z.string().optional(),

  // Other redirects and secrets
  AZURE_REDIRECT_URI: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().optional(),
  
  // Application Configuration
  SESSION_SECRET: z.string().min(32).optional(),
});

export type Environment = z.infer<typeof environmentSchema>;

let env: Environment;

try {
  const rawEnv = {
    ...process.env,
    DATABASE_URL: process.env.COSMOSDB_CONNECTION_STRING_CENTRALUS,
    SESSION_SECRET: process.env.SESSION_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-session-secret-min-32-chars-long-for-development' : undefined),
    COSMOSDB_CONNECTION_STRING_CENTRALUS: process.env.COSMOSDB_CONNECTION_STRING_CENTRALUS,
    COSMOSDB_KEY: process.env.COSMOSDB_KEY,
  };
  env = environmentSchema.parse(rawEnv);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Environment validation failed:");
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    process.exit(1);
  }
  throw error;
}

// Validate AI and cloud provider configurations
const validateProviders = () => {
  const warnings: string[] = [];
  
  // AI Provider validation - Azure AI Foundry preferred
  const hasAzureFoundry = env.AZURE_AI_FOUNDRY_ENDPOINT && env.AZURE_AI_FOUNDRY_KEY && 
                         (env.AZURE_FOUNDRY_PHI4_DEPLOYMENT || env.AZURE_FOUNDRY_MINISTRAL_DEPLOYMENT);
  const hasAzureOpenAI = env.AZURE_OPENAI_ENDPOINT && env.AZURE_OPENAI_API_KEY;
  const hasOpenAI = env.OPENAI_API_KEY;
  
  if (!hasAzureFoundry && !hasAzureOpenAI && !hasOpenAI) {
    if (env.NODE_ENV === 'production') {
      console.error("❌ No AI provider configured! Set either Azure AI Foundry, Azure OpenAI, or OpenAI credentials.");
      process.exit(1);
    } else {
      console.warn("⚠️  No AI provider configured - AI features will be disabled in development mode");
    }
  }
  
  if (hasAzureFoundry) {
    console.log("✅ Azure AI Foundry configured - using Phi-4 reasoning model");
    if (env.AZURE_FOUNDRY_PHI4_DEPLOYMENT) console.log("  🧠 Phi-4 reasoning model available");
    if (env.AZURE_FOUNDRY_MINISTRAL_DEPLOYMENT) console.log("  💰 Ministral-3B model available");
  } else if (hasAzureOpenAI) {
    console.log("✅ Azure OpenAI configured");
  } else if (hasOpenAI) {
    console.log("✅ OpenAI configured - consider Azure AI Foundry for 90% cost savings");
  }
  
  // Authentication validation
  const hasAzureB2C = env.AZURE_B2C_TENANT_NAME && env.AZURE_B2C_CLIENT_ID && env.AZURE_B2C_CLIENT_SECRET;
  if (hasAzureB2C) {
    console.log("✅ Azure B2C authentication configured");
    
    // Check additional OAuth providers
    const providers = [];
    if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) providers.push("GitHub");
    if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) providers.push("Google");
    if (env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET) providers.push("GitLab");
    
    if (providers.length > 0) {
      console.log(`  🔗 Additional OAuth providers: ${providers.join(", ")}`);
    }
  } else {
    warnings.push("Azure B2C not configured - authentication will use fallback method");
  }
  
  // AWS validation
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    warnings.push("AWS credentials not configured - AWS integrations will be disabled");
  }
  
  // GCP validation
  if (!env.GOOGLE_APPLICATION_CREDENTIALS && !env.GOOGLE_CLOUD_PROJECT) {
    warnings.push("Google Cloud credentials not configured - GCP integrations will be disabled");
  }
  
  // Azure validation
  if (!env.AZURE_CLIENT_ID || !env.AZURE_CLIENT_SECRET || !env.AZURE_TENANT_ID) {
    warnings.push("Azure credentials not configured - Azure integrations will be disabled");
  }
  
  if (warnings.length > 0) {
    console.warn("⚠️  Cloud provider warnings:");
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
};

// Run validation on startup
validateProviders();

console.log(`✅ Environment validated successfully (${env.NODE_ENV} mode)`);

export { env };