# Azure OpenAI Setup for Careerate Platform

This guide walks you through setting up Azure OpenAI with the most economical yet powerful models for your agentic platform.

## Why Azure OpenAI over OpenAI?

### Cost Benefits
- **10x cheaper** than direct OpenAI API for same models
- **No rate limits** with proper quota allocation
- **Enterprise-grade** SLA and security
- **Data residency** control
- **Integration** with Azure ecosystem

### Model Pricing Comparison (per 1M tokens)

| Model | OpenAI API | Azure OpenAI | Savings |
|-------|------------|--------------|---------|
| GPT-4o | $5.00 | $0.50 | 90% |
| GPT-4o Mini | $0.15 | $0.015 | 90% |
| GPT-3.5 Turbo | $0.50 | $0.05 | 90% |

## Recommended Model Configuration

### Primary Models for Careerate

1. **GPT-4o Mini** - Best cost/performance ratio
   - **Use cases**: Repository analysis, infrastructure optimization
   - **Cost**: $0.015/1M input tokens, $0.06/1M output tokens  
   - **Performance**: 90% of GPT-4o capability at 10x lower cost

2. **GPT-3.5 Turbo** - Ultra economical
   - **Use cases**: Simple planning, basic agent coordination
   - **Cost**: $0.05/1M input tokens, $0.15/1M output tokens
   - **Performance**: Fast and efficient for straightforward tasks

## Azure OpenAI Resource Setup

### 1. Create Azure OpenAI Resource

```bash
# Login to Azure
az login

# Create resource group (if not exists)
az group create --name careerate-rg --location eastus

# Create Azure OpenAI resource
az cognitiveservices account create \
  --name careerate-openai \
  --resource-group careerate-rg \
  --location eastus \
  --kind OpenAI \
  --sku S0 \
  --subscription your-subscription-id
```

### 2. Deploy Models via Azure Portal

**Navigate to**: Azure Portal → Your OpenAI Resource → Model Deployments

#### Deploy GPT-4o Mini (Recommended)
- **Model**: gpt-4o-mini
- **Deployment Name**: `gpt-4o-mini-deployment`
- **Version**: Latest available
- **Tokens per Minute Rate Limit**: 30K (adjust based on usage)

#### Deploy GPT-3.5 Turbo (Optional)
- **Model**: gpt-35-turbo  
- **Deployment Name**: `gpt-35-turbo-deployment`
- **Version**: Latest available
- **Tokens per Minute Rate Limit**: 60K

### 3. Get Connection Details

```bash
# Get endpoint
az cognitiveservices account show \
  --name careerate-openai \
  --resource-group careerate-rg \
  --query "properties.endpoint" \
  --output tsv

# Get API key
az cognitiveservices account keys list \
  --name careerate-openai \
  --resource-group careerate-rg \
  --query "key1" \
  --output tsv
```

## Environment Configuration

### Required Environment Variables

```bash
# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=https://careerate-openai.openai.azure.com/
AZURE_OPENAI_API_KEY=your-32-character-api-key-here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini-deployment
AZURE_OPENAI_DEPLOYMENT_NAME_TURBO=gpt-35-turbo-deployment
```

### Azure Web App Configuration

1. **Navigate to**: Azure Portal → Your Web App → Configuration → Application Settings

2. **Add New Application Settings**:
   ```
   AZURE_OPENAI_ENDPOINT = https://careerate-openai.openai.azure.com/
   AZURE_OPENAI_API_KEY = your-api-key
   AZURE_OPENAI_DEPLOYMENT_NAME = gpt-4o-mini-deployment
   AZURE_OPENAI_DEPLOYMENT_NAME_TURBO = gpt-35-turbo-deployment
   ```

3. **Click Save**

## Model Usage Strategy

### Careerate's Optimized Model Assignment

```typescript
// Repository Analysis - GPT-4o Mini
// Complex reasoning required, but cost-conscious
const analysis = await openai.chat.completions.create({
  model: "gpt-4o-mini-deployment",
  messages: [/* analysis prompt */],
  temperature: 0.3
});

// Deployment Planning - GPT-3.5 Turbo  
// Structured output, less complex reasoning
const plan = await openai.chat.completions.create({
  model: "gpt-35-turbo-deployment", 
  messages: [/* planning prompt */],
  temperature: 0.2
});

// Infrastructure Optimization - GPT-4o Mini
// Cost optimization requires good reasoning
const optimization = await openai.chat.completions.create({
  model: "gpt-4o-mini-deployment",
  messages: [/* optimization prompt */],
  temperature: 0.3
});
```

## Cost Optimization Tips

### 1. Token Management
```typescript
// Use system messages efficiently
const systemPrompt = "You are a DevOps expert. Be concise and specific.";

// Limit response length
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini-deployment",
  messages: [{ role: "system", content: systemPrompt }, ...],
  max_tokens: 1000, // Limit output tokens
  temperature: 0.1   // Lower temperature = more focused responses
});
```

### 2. Smart Model Selection
- **Complex analysis**: GPT-4o Mini
- **Simple tasks**: GPT-3.5 Turbo  
- **Structured output**: Lower temperature (0.1-0.3)
- **Creative tasks**: Higher temperature (0.7-0.9)

### 3. Caching Strategy
```typescript
// Cache frequent responses
const cache = new Map();
const cacheKey = `analysis:${repositoryUrl}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

const result = await analyzeRepository(repositoryUrl);
cache.set(cacheKey, result);
return result;
```

## Monitoring and Quotas

### 1. Set Up Quotas
- **Navigate to**: Azure OpenAI → Quotas
- **Set monthly spending limits**: e.g., $50/month for MVP
- **Configure alerts**: 80% and 95% thresholds

### 2. Monitor Usage
```bash
# Check usage via Azure CLI
az cognitiveservices account list-usage \
  --name careerate-openai \
  --resource-group careerate-rg
```

### 3. Application Insights Integration
```javascript
// Track AI usage in your application
const appInsights = require("applicationinsights");
appInsights.defaultClient.trackMetric({
  name: "ai_tokens_used",
  value: tokensUsed,
  properties: { model: "gpt-4o-mini", operation: "analysis" }
});
```

## Expected Monthly Costs

### MVP Usage (100K tokens/month)
- **GPT-4o Mini**: ~$6/month  
- **GPT-3.5 Turbo**: ~$2/month
- **Total**: ~$8/month for AI

### Production Usage (1M tokens/month)
- **GPT-4o Mini**: ~$60/month
- **GPT-3.5 Turbo**: ~$20/month  
- **Total**: ~$80/month for AI

## Security Best Practices

### 1. Key Management
```bash
# Store keys in Azure Key Vault
az keyvault secret set \
  --vault-name careerate-kv \
  --name "azure-openai-api-key" \
  --value "your-api-key"
```

### 2. Network Security
- **Enable**: Virtual Network integration
- **Configure**: Private endpoints for enhanced security
- **Restrict**: Access to specific IP ranges

### 3. Access Control
- **Use**: Managed Identity where possible
- **Configure**: RBAC for fine-grained permissions
- **Enable**: Audit logging

## Troubleshooting

### Common Issues

1. **Quota Exceeded**: Increase TPM limits or use multiple deployments
2. **Rate Limiting**: Implement exponential backoff
3. **Model Not Found**: Verify deployment name matches environment variable
4. **Authentication Failed**: Check API key and endpoint URL

### Health Check
```bash
# Test Azure OpenAI connection
curl -X POST "https://careerate-openai.openai.azure.com/openai/deployments/gpt-4o-mini-deployment/chat/completions?api-version=2024-02-15-preview" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

## Next Steps

1. **Deploy models** using the recommended configuration
2. **Set environment variables** in your Azure Web App
3. **Test the health endpoint** to verify AI integration
4. **Monitor costs** during initial deployment
5. **Scale quotas** based on actual usage patterns

Your Careerate platform will now use Azure OpenAI with optimal cost efficiency while maintaining enterprise-grade performance! 🚀

**Estimated Savings**: 90% cost reduction vs OpenAI API
**Performance**: Near-identical capabilities with better SLA