# Azure Deployment Guide for Careerate Platform

This guide walks you through deploying the Careerate multi-agent DevOps platform to Azure Web App.

## Prerequisites

1. **Azure Subscription** with sufficient credits
2. **GitHub repository** with the Careerate codebase
3. **Database setup** (Azure Database for PostgreSQL or Neon)
4. **Required API keys** (OpenAI, cloud providers)

## Azure Resources Required

### 1. Azure OpenAI Service (Recommended for Cost Efficiency)
```bash
# Create Azure OpenAI resource
az cognitiveservices account create \
  --name careerate-openai \
  --resource-group careerate-rg \
  --location eastus \
  --kind OpenAI \
  --sku S0 \
  --subscription your-subscription-id

# Deploy economical models (after resource creation in Azure Portal)
# Deploy gpt-4o-mini (most cost-effective for complex reasoning)
# Deploy gpt-35-turbo (ultra economical for simple tasks)
```

### 2. Azure Web App  
```bash
# Create resource group
az group create --name careerate-rg --location eastus

# Create App Service Plan (B1 or higher for production)
az appservice plan create --name careerate-plan --resource-group careerate-rg --sku B1 --is-linux

# Create Web App with Node.js 18
az webapp create --resource-group careerate-rg --plan careerate-plan --name careerate-platform --runtime "NODE|18-lts"
```

### 3. Azure Database for PostgreSQL
```bash
# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group careerate-rg \
  --name careerate-db \
  --admin-user careerateuser \
  --admin-password "YourSecurePassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --public-access 0.0.0.0 \
  --storage-size 32 \
  --version 14

# Create database
az postgres flexible-server db create --resource-group careerate-rg --server-name careerate-db --database-name careerate
```

### 4. Azure Key Vault (Recommended)
```bash
# Create Key Vault for secrets
az keyvault create --name careerate-kv --resource-group careerate-rg --location eastus

# Add secrets
az keyvault secret set --vault-name careerate-kv --name "openai-api-key" --value "sk-your-key"
az keyvault secret set --vault-name careerate-kv --name "session-secret" --value "your-secure-session-secret-32-chars"
```

## Environment Variables Configuration

Set these environment variables in Azure Web App settings:

### Required Variables
```bash
NODE_ENV=production
PORT=8080  # Azure sets this automatically
DATABASE_URL=postgresql://careerateuser:YourSecurePassword123!@careerate-db.postgres.database.azure.com:5432/careerate

# AI Configuration - Azure OpenAI (Recommended for cost efficiency)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini-deployment
AZURE_OPENAI_DEPLOYMENT_NAME_TURBO=gpt-35-turbo-deployment

# Alternative: OpenAI API (if not using Azure OpenAI)
# OPENAI_API_KEY=sk-your-openai-api-key

# Session Configuration  
SESSION_SECRET=your-super-secure-session-secret-at-least-32-characters-long
```

### Cloud Provider Credentials (Optional but Recommended)

#### AWS Integration
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
```

#### Google Cloud Integration
```bash
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"your-project",...}
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
```

#### Azure Integration
```bash
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_SUBSCRIPTION_ID=your-azure-subscription-id
```

## GitHub Actions Setup

1. **Configure GitHub Secrets:**
   - `AZURE_WEBAPP_NAME`: Your Azure Web App name (e.g., `careerate-platform`)
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Download from Azure Portal → Web App → Get publish profile

2. **The GitHub Actions workflow** (`.github/workflows/azure-deploy.yml`) will automatically:
   - Build the application
   - Run type checking
   - Deploy to Azure Web App
   - Perform health checks

## Database Setup

### Option 1: Azure Database for PostgreSQL
- Fully managed PostgreSQL service
- Built-in SSL encryption
- Automatic backups
- **Cost**: ~$30-100/month depending on tier

### Option 2: Neon Database (Recommended for MVP)
- Serverless PostgreSQL
- Free tier available
- Faster setup
- **Cost**: Free tier, then usage-based

```bash
# For Neon, just use the connection string:
DATABASE_URL=postgresql://username:password@hostname.neon.tech/database?sslmode=require
```

## Deployment Steps

1. **Fork/Clone the repository**
2. **Set up Azure resources** (using commands above)
3. **Configure environment variables** in Azure Web App
4. **Set up GitHub secrets** for deployment
5. **Push to main branch** - deployment happens automatically
6. **Verify deployment** at your Azure Web App URL

## Health Check Endpoints

After deployment, verify these endpoints work:

- **Main health check**: `https://your-app.azurewebsites.net/health`
- **API health**: `https://your-app.azurewebsites.net/api/health`
- **Readiness probe**: `https://your-app.azurewebsites.net/ready`
- **Dashboard**: `https://your-app.azurewebsites.net/dashboard`

## Scaling & Production Considerations

### Performance
- **App Service Plan**: Start with B1, scale to S1 or P1V2 for production
- **Database**: Use Standard tier for production workloads
- **CDN**: Consider Azure CDN for static assets

### Security
- **Key Vault**: Store all secrets in Azure Key Vault
- **Private Endpoints**: For database security
- **Application Insights**: For monitoring and logging
- **SSL/TLS**: Enabled by default on Azure Web App

### Monitoring
```bash
# Enable Application Insights
az monitor app-insights component create \
  --app careerate-insights \
  --location eastus \
  --resource-group careerate-rg \
  --application-type web
```

## Cost Estimation

### MVP Setup (Development)
- **Web App (B1)**: ~$13/month
- **Database (Neon Free)**: $0/month
- **Total**: ~$13/month

### Production Setup
- **Web App (S1)**: ~$73/month
- **Database (Standard_B1ms)**: ~$30/month
- **Key Vault**: ~$3/month
- **Application Insights**: Usage-based
- **Total**: ~$106/month

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check TypeScript compilation errors

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check firewall rules
   - Ensure SSL is properly configured

3. **Environment Variable Issues**
   - Double-check all required variables are set
   - Verify no extra quotes or spaces
   - Check Azure Web App configuration

4. **Health Check Failures**
   - Check application logs in Azure Portal
   - Verify database connectivity
   - Check OpenAI API key validity

### Viewing Logs
```bash
# Stream logs from Azure Web App
az webapp log tail --name careerate-platform --resource-group careerate-rg
```

## Support

- **Platform Issues**: Check the health endpoints
- **Database Issues**: Verify connection strings and firewall rules
- **API Issues**: Check environment variables and API keys
- **Deployment Issues**: Review GitHub Actions logs

## Next Steps After Deployment

1. **Set up monitoring** with Application Insights
2. **Configure custom domain** if needed
3. **Set up backup strategy** for database
4. **Configure alerts** for system health
5. **Scale resources** based on usage patterns

The Careerate platform will now be running on Azure with full multi-agent DevOps capabilities, AI-powered repository analysis, and multi-cloud infrastructure orchestration! 🚀