
# GitHub Secrets Setup Guide

This document outlines the required secrets for the Careerate GitHub Actions workflow.

## Required Azure Secrets

### Container Registry Secrets
- `AzureAppService_ContainerUsername_192d2116c4ea4190af68e7020c6ad773`: Azure Container Registry username
- `AzureAppService_ContainerPassword_fc7853b2e420454fa4a94fdb004a69c0`: Azure Container Registry password

### App Service Secrets  
- `AzureAppService_PublishProfile_4004fc0a217047bba5da69daba16e439`: Azure App Service publish profile

## Application Environment Variables

Add these as environment variables in your Azure App Service configuration:

### Database
- `DATABASE_URL`: Neon PostgreSQL connection string
- `DB_HOST`: Database host
- `DB_USER`: Database username  
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name

### Authentication
- `AZURE_CLIENT_ID`: Azure AD application client ID
- `AZURE_CLIENT_SECRET`: Azure AD application client secret
- `AZURE_TENANT_ID`: Azure AD tenant ID
- `GITHUB_CLIENT_ID`: GitHub OAuth app client ID
- `GITHUB_CLIENT_SECRET`: GitHub OAuth app client secret

### Session Management
- `SESSION_SECRET`: Random string for session encryption
- `COOKIE_SECRET`: Random string for cookie signing

### Application Settings
- `NODE_ENV`: Set to "production"
- `PORT`: Set to "80" (Azure will handle port mapping)
- `HOST`: Set to "0.0.0.0"

## How to Set Secrets

### In GitHub:
1. Go to your repository Settings
2. Navigate to Secrets and variables > Actions
3. Click "New repository secret"
4. Add each secret with the exact name listed above

### In Azure App Service:
1. Go to your App Service in Azure Portal
2. Navigate to Configuration > Application settings
3. Add each environment variable listed above
4. Click "Save" after adding all variables

## Security Notes

- Never commit secrets to your repository
- Use Azure Key Vault for additional security in production
- Rotate secrets regularly
- Monitor access logs for unusual activity
