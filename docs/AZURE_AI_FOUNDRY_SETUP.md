# Azure AI Foundry Setup Guide

**Purpose**: Configure Azure AI Foundry workspace and deploy AI model endpoints for Careerate V2.0  
**Date**: October 11, 2025  
**Status**: Ready to Execute

---

## Overview

Careerate V2.0 uses Azure AI Foundry to access multiple AI models:
- **Claude 3.5 Sonnet** (Anthropic via Azure) - Primary reasoning and planning
- **GPT-5** (Azure OpenAI Service) - Code generation and NLU
- **Phi-4** (Microsoft) - Cost optimization and architecture decisions

---

## Prerequisites

- [x] Azure subscription (active)
- [x] Azure CLI installed (`az --version`)
- [x] Owner or Contributor role on subscription
- [x] Azure Key Vault (`careeeratesecretsvault`) accessible

---

## Step 1: Create Azure AI Foundry Workspace

### Via Azure Portal (Recommended)

1. Navigate to [Azure AI Foundry](https://ai.azure.com)
2. Click **"Create new project"**
3. Configure:
   - **Name**: `careerate-ai-workspace`
   - **Resource Group**: `Careerate` (existing)
   - **Region**: `East US 2` (or closest to main deployment)
   - **Pricing Tier**: Standard (pay-as-you-go)
4. Click **"Create"**
5. Wait for provisioning (~3-5 minutes)

### Via Azure CLI (Alternative)

```bash
# Create AI Foundry workspace
az ml workspace create \
  --name careerate-ai-workspace \
  --resource-group Careerate \
  --location eastus2 \
  --description "AI model hub for Careerate V2.0"

# Verify creation
az ml workspace show \
  --name careerate-ai-workspace \
  --resource-group Careerate
```

---

## Step 2: Deploy Claude 3.5 Sonnet Endpoint

### Via Azure AI Foundry Portal

1. In AI Foundry workspace, go to **"Model catalog"**
2. Search for **"Claude 3.5 Sonnet"** (Anthropic)
3. Click **"Deploy"**
4. Configure:
   - **Deployment Name**: `claude-35-sonnet-careerate`
   - **Model Version**: Latest stable (e.g., `claude-3-5-sonnet-20241022`)
   - **Capacity**: Start with 50 TPM (Tokens Per Minute), scale as needed
   - **Content Filter**: Standard (Azure's built-in filters)
5. Click **"Deploy"**
6. Wait for deployment (~5-10 minutes)
7. **Copy the endpoint URL and API key** (displayed after deployment)

### Save Credentials

```bash
# Store in Azure Key Vault
az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-CLAUDE-ENDPOINT" \
  --value "https://careerate-ai-workspace-xxxxxx.eastus2.inference.ml.azure.com/score"

az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-CLAUDE-API-KEY" \
  --value "your-api-key-here"

az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-CLAUDE-DEPLOYMENT-NAME" \
  --value "claude-35-sonnet-careerate"
```

---

## Step 3: Deploy GPT-5 Endpoint

### Via Azure OpenAI Studio

1. Navigate to [Azure OpenAI Studio](https://oai.azure.com)
2. Select your workspace (or create one)
3. Go to **"Deployments"** → **"Create new deployment"**
4. Configure:
   - **Model**: `gpt-5` (or latest available, may be `gpt-4o` until GPT-5 GA)
   - **Deployment Name**: `gpt-5-careerate`
   - **Model Version**: Latest
   - **Capacity**: 50K TPM (adjust based on usage)
5. Click **"Create"**
6. **Copy endpoint URL and API key**

### Save Credentials

```bash
# Store in Key Vault
az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-GPT5-ENDPOINT" \
  --value "https://careerate-openai.openai.azure.com/"

az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-GPT5-API-KEY" \
  --value "your-api-key-here"

az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-GPT5-DEPLOYMENT-NAME" \
  --value "gpt-5-careerate"
```

---

## Step 4: Deploy Phi-4 Reasoning Endpoint

### Via Azure AI Foundry Portal

1. In AI Foundry workspace, go to **"Model catalog"**
2. Search for **"Phi-4"** (Microsoft)
3. Click **"Deploy"**
4. Configure:
   - **Deployment Name**: `phi-4-careerate`
   - **Model Version**: Latest (e.g., `phi-4-reasoning-14b`)
   - **Capacity**: 30 TPM (smaller model, lower capacity needed)
5. Click **"Deploy"**
6. **Copy endpoint URL and API key**

### Save Credentials

```bash
# Store in Key Vault
az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-PHI4-ENDPOINT" \
  --value "https://careerate-ai-workspace-xxxxxx.eastus2.inference.ml.azure.com/score"

az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-PHI4-API-KEY" \
  --value "your-api-key-here"

az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "AZURE-PHI4-DEPLOYMENT-NAME" \
  --value "phi-4-careerate"
```

---

## Step 5: Configure Content Filters

### Apply to All Endpoints

1. In Azure AI Foundry, go to **"Content filters"**
2. Create new filter policy:
   - **Name**: `careerate-production-filter`
   - **Hate**: Medium (block high-severity)
   - **Violence**: Medium
   - **Sexual**: Medium
   - **Self-harm**: High (block all)
   - **Jailbreak**: High (block all attempts)
3. Apply filter to all deployments:
   - `claude-35-sonnet-careerate`
   - `gpt-5-careerate`
   - `phi-4-careerate`

---

## Step 6: Set Up Rate Limiting & Quotas

### Configure Per-Model Quotas

1. Go to **"Quotas"** in Azure AI Foundry
2. Set limits to prevent cost overruns:
   - **Claude 3.5 Sonnet**: 100K TPM max
   - **GPT-5**: 150K TPM max
   - **Phi-4**: 50K TPM max
3. Enable **"Alert on quota threshold"** (80% and 95%)

### Configure Budget Alerts

```bash
# Create budget alert for AI Foundry
az consumption budget create \
  --budget-name "careerate-ai-budget" \
  --amount 500 \
  --time-grain Monthly \
  --resource-group Careerate \
  --notifications \
    threshold=80 \
    contactEmails="your-email@example.com" \
  --notifications \
    threshold=100 \
    contactEmails="your-email@example.com"
```

---

## Step 7: Test All Endpoints

### Create Test Script

Save as `scripts/test-ai-endpoints.ts`:

```typescript
import { keyVaultService } from '../server/services/azureKeyVaultService';

async function testClaudeEndpoint() {
  console.log('🧪 Testing Claude 3.5 Sonnet endpoint...');
  
  const endpoint = await keyVaultService.getSecret('AZURE-CLAUDE-ENDPOINT');
  const apiKey = await keyVaultService.getSecret('AZURE-CLAUDE-API-KEY');
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello! Please respond with "Claude working"' }],
      max_tokens: 50
    })
  });
  
  const data = await response.json();
  console.log('✅ Claude response:', data.choices[0].message.content);
}

async function testGPT5Endpoint() {
  console.log('🧪 Testing GPT-5 endpoint...');
  
  const endpoint = await keyVaultService.getSecret('AZURE-GPT5-ENDPOINT');
  const apiKey = await keyVaultService.getSecret('AZURE-GPT5-API-KEY');
  const deployment = await keyVaultService.getSecret('AZURE-GPT5-DEPLOYMENT-NAME');
  
  const response = await fetch(`${endpoint}openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello! Please respond with "GPT-5 working"' }],
      max_tokens: 50
    })
  });
  
  const data = await response.json();
  console.log('✅ GPT-5 response:', data.choices[0].message.content);
}

async function testPhi4Endpoint() {
  console.log('🧪 Testing Phi-4 endpoint...');
  
  const endpoint = await keyVaultService.getSecret('AZURE-PHI4-ENDPOINT');
  const apiKey = await keyVaultService.getSecret('AZURE-PHI4-API-KEY');
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Hello! Please respond with "Phi-4 working"' }],
      max_tokens: 50
    })
  });
  
  const data = await response.json();
  console.log('✅ Phi-4 response:', data.choices[0].message.content);
}

async function runTests() {
  try {
    await testClaudeEndpoint();
    await testGPT5Endpoint();
    await testPhi4Endpoint();
    
    console.log('\n🎉 All AI endpoints working correctly!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
```

### Run Tests

```bash
# Run test script
tsx scripts/test-ai-endpoints.ts
```

**Expected Output**:
```
🧪 Testing Claude 3.5 Sonnet endpoint...
✅ Claude response: Claude working
🧪 Testing GPT-5 endpoint...
✅ GPT-5 response: GPT-5 working
🧪 Testing Phi-4 endpoint...
✅ Phi-4 response: Phi-4 working

🎉 All AI endpoints working correctly!
```

---

## Step 8: Update Environment Variables

### For Local Development

Add to `.env.local`:

```bash
# Azure AI Foundry (loaded from Key Vault in production)
AZURE_CLAUDE_ENDPOINT=https://careerate-ai-workspace-xxxxxx.eastus2.inference.ml.azure.com/score
AZURE_CLAUDE_API_KEY=your-local-dev-key
AZURE_CLAUDE_DEPLOYMENT_NAME=claude-35-sonnet-careerate

AZURE_GPT5_ENDPOINT=https://careerate-openai.openai.azure.com/
AZURE_GPT5_API_KEY=your-local-dev-key
AZURE_GPT5_DEPLOYMENT_NAME=gpt-5-careerate

AZURE_PHI4_ENDPOINT=https://careerate-ai-workspace-xxxxxx.eastus2.inference.ml.azure.com/score
AZURE_PHI4_API_KEY=your-local-dev-key
AZURE_PHI4_DEPLOYMENT_NAME=phi-4-careerate
```

### For Production (Azure Container Apps)

Environment variables are loaded from Key Vault automatically via `secretsLoader.ts`.

---

## Cost Estimates

### Per-Model Pricing (October 2025)

| Model | Input (per 1M tokens) | Output (per 1M tokens) | Typical Cost/Day (1000 deploys) |
|-------|----------------------|------------------------|----------------------------------|
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | ~$50 |
| **GPT-5** | $2.50 | $10.00 | ~$40 |
| **Phi-4** | $0.40 | $1.60 | ~$8 |

**Total Estimated Cost**: ~$100/day for 1000 deployments (~$3000/month)

### Cost Optimization Strategies

1. **Primary model routing**: Use Phi-4 for simple tasks, Claude for complex
2. **Caching**: Store common responses (framework detection, etc.)
3. **Prompt optimization**: Minimize token usage with concise prompts
4. **User quotas**: Free tier limited to 10 deployments/month

---

## Monitoring & Alerting

### Set Up Application Insights

```bash
# Create Application Insights for AI monitoring
az monitor app-insights component create \
  --app careerate-ai-insights \
  --location eastus2 \
  --resource-group Careerate \
  --application-type web

# Get instrumentation key
az monitor app-insights component show \
  --app careerate-ai-insights \
  --resource-group Careerate \
  --query instrumentationKey
```

### Store Instrumentation Key

```bash
az keyvault secret set \
  --vault-name careeeratesecretsvault \
  --name "APPINSIGHTS-INSTRUMENTATIONKEY" \
  --value "your-instrumentation-key"
```

---

## Troubleshooting

### Issue: "Quota exceeded"

**Solution**: Increase TPM quota in Azure AI Foundry or enable auto-scaling.

### Issue: "Content filter triggered"

**Solution**: Review prompt content, adjust filter sensitivity if false positive.

### Issue: "Endpoint not responding"

**Solution**: 
1. Check endpoint status in Azure Portal
2. Verify API key is correct
3. Check for regional outages

### Issue: "High latency (>5 seconds)"

**Solution**:
1. Use streaming responses
2. Deploy models closer to users (multi-region)
3. Implement request queuing

---

## Next Steps

After completing Azure AI Foundry setup:

1. ✅ All 3 model endpoints deployed
2. ✅ Credentials stored in Key Vault
3. ✅ Content filters configured
4. ✅ Rate limits and budgets set
5. 🔜 Initialize Semantic Kernel (Phase 3 next)
6. 🔜 Create agent orchestrator
7. 🔜 Test multi-agent workflow

---

## Checklist

- [ ] Azure AI Foundry workspace created
- [ ] Claude 3.5 Sonnet endpoint deployed
- [ ] GPT-5 endpoint deployed
- [ ] Phi-4 endpoint deployed
- [ ] All credentials stored in Key Vault
- [ ] Content filters applied
- [ ] Rate limits configured
- [ ] Budget alerts set up
- [ ] Test script executed successfully
- [ ] Monitoring configured

---

**Document Version**: 1.0  
**Last Updated**: October 11, 2025  
**Next Review**: After Semantic Kernel integration

