/**
 * Semantic Kernel Configuration
 * 
 * Initializes Microsoft Semantic Kernel with Azure AI Foundry models
 * Provides model selection strategy and logging
 */

import { keyVaultService } from '../services/azureKeyVaultService';
import winston from 'winston';

// Logger for agent actions
export const agentLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/agent-error.log', 
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/agent-combined.log',
      maxsize: 10485760,
      maxFiles: 10
    }),
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({ 
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : [])
  ]
});

/**
 * AI Model Configuration
 */
export interface AIModelConfig {
  endpoint: string;
  apiKey: string;
  deployment?: string;
  modelId?: string;
}

/**
 * Semantic Kernel Instance (Placeholder)
 * 
 * Note: Actual Semantic Kernel initialization requires the NPM package
 * For now, this is a mock implementation that demonstrates the structure
 */
export class KernelConfig {
  private models: Map<string, AIModelConfig> = new Map();
  private initialized: boolean = false;

  /**
   * Initialize kernel with AI models from Azure Key Vault
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      agentLogger.info('Kernel already initialized');
      return;
    }

    agentLogger.info('Initializing Semantic Kernel...');

    try {
      // Load Claude Sonnet 4.5 configuration (best for complex agents/coding)
      const claudeSonnetEndpoint = await keyVaultService.getSecret('AZURE-CLAUDE-ENDPOINT');
      const claudeSonnetApiKey = await keyVaultService.getSecret('AZURE-CLAUDE-API-KEY');

      if (claudeSonnetEndpoint && claudeSonnetApiKey) {
        this.models.set('claude-sonnet-45', {
          endpoint: claudeSonnetEndpoint,
          apiKey: claudeSonnetApiKey,
          modelId: 'claude-sonnet-4-5-20251015'
        });
        agentLogger.info('✓ Claude Sonnet 4.5 configured ($3/$15 per M tokens)');
      } else {
        agentLogger.warn('⚠ Claude Sonnet 4.5 credentials not found in Key Vault');
      }

      // Load Claude Haiku 4.5 configuration (fast, cheap, near-frontier)
      const claudeHaikuEndpoint = await keyVaultService.getSecret('AZURE-CLAUDE-HAIKU-ENDPOINT');
      const claudeHaikuApiKey = await keyVaultService.getSecret('AZURE-CLAUDE-HAIKU-API-KEY');

      if (claudeHaikuEndpoint && claudeHaikuApiKey) {
        this.models.set('claude-haiku-45', {
          endpoint: claudeHaikuEndpoint,
          apiKey: claudeHaikuApiKey,
          modelId: 'claude-haiku-4-5-20251015'
        });
        agentLogger.info('✓ Claude Haiku 4.5 configured ($1/$5 per M tokens - cheapest!)');
      } else {
        agentLogger.warn('⚠ Claude Haiku 4.5 credentials not found in Key Vault');
      }

      // Load GPT-5 configuration (flagship reasoning model)
      const gpt5Endpoint = await keyVaultService.getSecret('AZURE-GPT5-ENDPOINT');
      const gpt5ApiKey = await keyVaultService.getSecret('AZURE-GPT5-API-KEY');
      const gpt5Deployment = await keyVaultService.getSecret('AZURE-GPT5-DEPLOYMENT-NAME');

      if (gpt5Endpoint && gpt5ApiKey && gpt5Deployment) {
        this.models.set('gpt-5', {
          endpoint: gpt5Endpoint,
          apiKey: gpt5ApiKey,
          deployment: gpt5Deployment,
          modelId: 'gpt-5' // Flagship model
        });
        agentLogger.info('✓ GPT-5 configured (flagship)');
      } else {
        agentLogger.warn('⚠ GPT-5 credentials not found in Key Vault');
      }

      // Load GPT-5 Mini configuration (faster, cheaper)
      const gpt5MiniEndpoint = await keyVaultService.getSecret('AZURE-GPT5-MINI-ENDPOINT');
      const gpt5MiniApiKey = await keyVaultService.getSecret('AZURE-GPT5-MINI-API-KEY');
      const gpt5MiniDeployment = await keyVaultService.getSecret('AZURE-GPT5-MINI-DEPLOYMENT-NAME');

      if (gpt5MiniEndpoint && gpt5MiniApiKey && gpt5MiniDeployment) {
        this.models.set('gpt-5-mini', {
          endpoint: gpt5MiniEndpoint,
          apiKey: gpt5MiniApiKey,
          deployment: gpt5MiniDeployment,
          modelId: 'gpt-5-mini' // 2x faster, 1/3 price
        });
        agentLogger.info('✓ GPT-5 Mini configured (2x faster)');
      } else {
        agentLogger.warn('⚠ GPT-5 Mini credentials not found in Key Vault');
      }

      // Load Phi-4 configuration (cheap reasoning specialist - $0.13/$0.50 per M tokens!)
      const phi4Endpoint = await keyVaultService.getSecret('AZURE-PHI4-ENDPOINT');
      const phi4ApiKey = await keyVaultService.getSecret('AZURE-PHI4-API-KEY');

      if (phi4Endpoint && phi4ApiKey) {
        this.models.set('phi-4', {
          endpoint: phi4Endpoint,
          apiKey: phi4ApiKey,
          modelId: 'phi-4' // 14B params, reasoning specialist
        });
        agentLogger.info('✓ Phi-4 configured ($0.13/$0.50 per M tokens - cheapest reasoning!)');
      } else {
        agentLogger.warn('⚠ Phi-4 credentials not found in Key Vault');
      }

      // Load Phi-4 Mini Flash Reasoning (10x faster, ultra-low latency)
      const phi4MiniEndpoint = await keyVaultService.getSecret('AZURE-PHI4-MINI-ENDPOINT');
      const phi4MiniApiKey = await keyVaultService.getSecret('AZURE-PHI4-MINI-API-KEY');

      if (phi4MiniEndpoint && phi4MiniApiKey) {
        this.models.set('phi-4-mini-flash', {
          endpoint: phi4MiniEndpoint,
          apiKey: phi4MiniApiKey,
          modelId: 'phi-4-mini-flash-reasoning' // 3.8B params, ultra-fast
        });
        agentLogger.info('✓ Phi-4 Mini Flash configured (10x faster!)');
      } else {
        agentLogger.warn('⚠ Phi-4 Mini Flash credentials not found in Key Vault');
      }

      this.initialized = true;
      agentLogger.info(`Semantic Kernel initialized with ${this.models.size} AI services`);
    } catch (error) {
      agentLogger.error('Failed to initialize Semantic Kernel:', error);
      throw error;
    }
  }

  /**
   * Get model configuration
   */
  getModel(modelId: string): AIModelConfig | undefined {
    return this.models.get(modelId);
  }

  /**
   * Check if kernel is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get all available models
   */
  getAvailableModels(): string[] {
    return Array.from(this.models.keys());
  }
}

/**
 * Get appropriate model for task type
 * 
 * @param taskType Type of task to perform
 * @returns Model ID to use
 */
export function selectModelForTask(taskType: string): string {
  switch (taskType) {
    case 'planning':
    case 'reasoning':
    case 'architecture':
    case 'complex-analysis':
    case 'deployment-planning':
      return 'gpt-5'; // Flagship model, best reasoning (with reasoning_effort)

    case 'code-generation':
    case 'complex-coding':
    case 'agent-workflows':
      return 'claude-sonnet-45'; // Best for complex agents/coding ($3/$15)

    case 'monitoring':
    case 'analysis':
    case 'diagnostics':
      return 'claude-haiku-45'; // Fast, cheap, near-frontier ($1/$5)

    case 'cost-optimization':
    case 'simple-reasoning':
    case 'quick-decisions':
    case 'real-time':
      return 'phi-4-mini-flash'; // Ultra-fast, ultra-cheap ($0.13/$0.50)

    case 'healing':
    case 'remediation':
      return 'phi-4'; // Cheap reasoning specialist ($0.13/$0.50)

    default:
      agentLogger.warn(`Unknown task type: ${taskType}, defaulting to gpt-5-mini`);
      return 'gpt-5-mini'; // Default to fast, balanced model
  }
}

/**
 * Estimate cost for AI operation
 * 
 * Based on October 2025 Azure AI Foundry pricing
 * 
 * @param modelId Model identifier
 * @param inputTokens Estimated input tokens
 * @param outputTokens Estimated output tokens
 * @returns Estimated cost in cents
 */
export function estimateAICost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  thinkingTokens: number = 0
): number {
  // Pricing per 1M tokens (in dollars) - Updated October 2025
  const pricing: Record<string, { input: number; output: number; thinking?: number }> = {
    // Claude 4.5 Models
    'claude-sonnet-45': { input: 3.00, output: 15.00 },
    'claude-haiku-45': { input: 1.00, output: 5.00 }, // Cheapest Claude!
    'claude-opus-41': { input: 20.00, output: 80.00, thinking: 10.00 },

    // GPT-5 Models (pricing TBD, using estimates)
    'gpt-5': { input: 5.00, output: 20.00 }, // Flagship reasoning
    'gpt-5-mini': { input: 1.50, output: 6.00 }, // 2x faster, 1/3 price
    'gpt-5-nano': { input: 0.50, output: 2.00 }, // Ultra-compact

    // Phi-4 Models (Cheapest!)
    'phi-4': { input: 0.13, output: 0.50 }, // Reasoning specialist
    'phi-4-mini-flash': { input: 0.10, output: 0.40 } // 10x faster
  };

  const model = pricing[modelId] || pricing['gpt-5-mini']; // Default to balanced model

  const inputCost = (inputTokens / 1_000_000) * model.input;
  const outputCost = (outputTokens / 1_000_000) * model.output;
  const thinkingCost = model.thinking ? (thinkingTokens / 1_000_000) * model.thinking : 0;

  // Return cost in cents
  return Math.ceil((inputCost + outputCost + thinkingCost) * 100);
}

/**
 * Token estimation heuristics
 * 
 * @param text Text to estimate
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  // Rough heuristic: ~4 characters per token on average
  return Math.ceil(text.length / 4);
}

// Singleton instance
export const kernelConfig = new KernelConfig();

