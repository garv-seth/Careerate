# Azure Key Vault Configuration

**All secrets are stored in Azure Key Vault - NO secrets in `.env` files!**

## ✅ Current Setup

Your application is configured to load all secrets from:
- **Key Vault:** `CareeerateSecretsVault`
- **Location:** Automatically detected from Azure CLI or environment variables

### How It Works

1. **At startup**, the application connects to Azure Key Vault
2. **All secrets** are loaded from the vault into memory
3. **Application code** uses `process.env` as normal (secrets are injected automatically)
4. **No `.env` file** needed for secrets (safe to commit configuration-only `.env`)

## 🔐 Available Secrets

Your Key Vault contains:

### Cloud Providers
- ✅ **AWS:** `AWS-ACCESS-KEY-ID`, `AWS-SECRET-ACCESS-KEY`
- ✅ **GCP:** `GOOGLE-CLOUD-PROJECT`, `GOOGLE-CLOUD-CLIENT-EMAIL`, `GOOGLE-CLOUD-PRIVATE-KEY`
- ✅ **Azure:** `AZURE-CLIENT-ID`, `AZURE-CLIENT-SECRET`, `AZURE-TENANT-ID`

### OAuth Integrations
- ✅ **GitHub:** `GITHUB-CLIENT-ID`, `GITHUB-CLIENT-SECRET`
- ✅ **GitLab:** `GITLAB-CLIENT-ID`, `GITLAB-CLIENT-SECRET`

### AI Services
- ✅ **OpenAI:** `OPENAI-API-KEY`
- ✅ **Anthropic:** `ANTHROPIC-API-KEY`

### Database & Security
- ✅ **Database:** `DATABASE-URL`
- ✅ **Encryption:** `ENCRYPTION-MASTER-KEY`
- ✅ **Session:** `SESSION-SECRET`, `JWT-SECRET`, `JWT-REFRESH-SECRET`

### Additional Services
- ✅ **Stripe:** `STRIPE-SECRET-KEY`, `STRIPE-WEBHOOK-SECRET`
- ✅ **SendGrid:** `SENDGRID-API-KEY`
- ✅ **Slack:** `SLACK-BOT-TOKEN`
- ✅ **PagerDuty:** `PAGERDUTY-API-KEY`

## 🚀 Running the Application

### Option 1: Using Azure CLI (Recommended)
```bash
# Login to Azure
az login

# Run the application
npm run dev
```

The application will automatically:
1. Use your Azure CLI credentials
2. Connect to `CareeerateSecretsVault`
3. Load all secrets
4. Start the server

### Option 2: Using Service Principal
```bash
# Set Azure credentials (if not using Azure CLI)
export AZURE_TENANT_ID=your-tenant-id
export AZURE_CLIENT_ID=your-client-id
export AZURE_CLIENT_SECRET=your-client-secret

# Run the application
npm run dev
```

## 📝 Configuration File

Create a `.env` file with **ONLY non-secret configuration**:

```env
# Azure Key Vault (Required)
AZURE_KEY_VAULT_NAME=CareeerateSecretsVault

# Application Settings
NODE_ENV=development
PORT=5000

# Runbook Safety Settings
DEFAULT_DRY_RUN=true
REQUIRE_PROD_APPROVALS=true
KILL_SWITCH_ENABLED=false
ENABLE_BUDGET_CHECKS=true
POLICY_ENFORCEMENT_MODE=block

# AWS Settings
AWS_REGION=us-east-1

# Features
ENABLE_REAL_CLOUD_CALLS=false
```

**✅ This file is SAFE to commit** - it contains no secrets!

## 🔧 Managing Secrets

### Add a New Secret
```bash
az keyvault secret set \
  --vault-name CareeerateSecretsVault \
  --name NEW-SECRET-NAME \
  --value "secret-value"
```

### Update Existing Secret
```bash
az keyvault secret set \
  --vault-name CareeerateSecretsVault \
  --name EXISTING-SECRET \
  --value "new-value"
```

### View Secret
```bash
az keyvault secret show \
  --vault-name CareeerateSecretsVault \
  --name SECRET-NAME \
  --query "value" -o tsv
```

### List All Secrets
```bash
az keyvault secret list \
  --vault-name CareeerateSecretsVault \
  --query "[].name" -o table
```

### Delete Secret
```bash
az keyvault secret delete \
  --vault-name CareeerateSecretsVault \
  --name SECRET-NAME
```

## 🔄 Secret Rotation

Secrets are cached for **5 minutes** for performance. To force reload:

### Option 1: Restart Application
```bash
# Secrets are reloaded on startup
npm run dev
```

### Option 2: Clear Cache (Future Enhancement)
```typescript
// In code
import { keyVaultService } from './server/services/azureKeyVaultService';
keyVaultService.clearCache();
```

## 🏗️ Deployment

### Development
```bash
# Uses Azure CLI credentials
az login
npm run dev
```

### Production (Azure Container Apps)
The deployed application uses **Managed Identity**:
- No credentials needed
- Automatic access to Key Vault
- Secrets loaded at container startup

### Other Environments
Set service principal credentials:
```bash
export AZURE_TENANT_ID=...
export AZURE_CLIENT_ID=...
export AZURE_CLIENT_SECRET=...
```

## 🔍 Troubleshooting

### Error: "Failed to load secrets from Key Vault"
**Solution:**
```bash
# Make sure you're logged in
az login

# Verify you have access
az keyvault secret list --vault-name CareeerateSecretsVault
```

### Error: "Key Vault client not initialized"
**Solution:**
```bash
# Check Azure credentials
az account show

# Re-login if needed
az login
```

### Secret Not Loading
**Solution:**
```bash
# Verify secret exists
az keyvault secret show \
  --vault-name CareeerateSecretsVault \
  --name YOUR-SECRET-NAME

# Check naming convention (use hyphens, not underscores)
# Key Vault: AWS-ACCESS-KEY-ID
# Env Var:   AWS_ACCESS_KEY_ID
```

## 🔐 Security Benefits

### ✅ No Secrets in Code
- All secrets in Azure Key Vault
- `.env` files contain only configuration
- Safe to commit to Git
- No risk of secret exposure

### ✅ Centralized Management
- Single source of truth (Key Vault)
- Easy rotation (update in one place)
- Audit trail of all secret access
- Fine-grained access control

### ✅ Automatic Injection
- Secrets loaded at startup
- Available via `process.env`
- Code remains simple
- No changes to existing code

### ✅ Production Ready
- Works with Managed Identity
- No credentials in containers
- Secure by default
- Compliance-friendly

## 📊 Startup Output

When the application starts successfully:
```
🚀 Starting Careerate Runbook Platform...

🔐 Loading secrets from Azure Key Vault...
✅ Azure Key Vault connected: CareeerateSecretsVault
✅ Loaded 15 secrets from Key Vault
🔌 Available integrations: aws, gcp, azure, github, gitlab, openai
✅ GCP credentials loaded from Key Vault

🔌 Configured Cloud Providers:
  ✅ AWS
  ✅ Azure
  ✅ GCP
  ✅ GitHub
  ✅ GitLab
  ✅ OpenAI

✅ All required secrets validated
✅ Server running on http://localhost:5000
```

## 🎯 Next Steps

1. **Verify secrets are loaded:**
   ```bash
   npm run dev
   # Should show all configured providers
   ```

2. **Test cloud provider access:**
   ```bash
   # AWS
   curl http://localhost:5000/api/runbooks/incident/detect \
     -H "Content-Type: application/json" \
     -d '{"provider":"aws","environment":"dev","resourceType":"container","resourceId":"test"}'
   ```

3. **Add new secrets as needed:**
   ```bash
   az keyvault secret set --vault-name CareeerateSecretsVault --name NEW-SECRET --value "value"
   ```

---

**✨ Your application is now fully configured with Azure Key Vault - secure, scalable, and production-ready!**

