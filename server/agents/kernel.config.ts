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
      // Load Claude 3.5 Sonnet configuration
      const claudeEndpoint = await keyVaultService.getSecret('AZURE-CLAUDE-ENDPOINT');
      const claudeApiKey = await keyVaultService.getSecret('AZURE-CLAUDE-API-KEY');
      
      if (claudeEndpoint && claudeApiKey) {
        this.models.set('claude-35-sonnet', {
          endpoint: claudeEndpoint,
          apiKey: claudeApiKey,
          modelId: 'claude-3-5-sonnet-20241022'
        });
        agentLogger.info('✓ Claude 3.5 Sonnet configured');
      } else {
        agentLogger.warn('⚠ Claude 3.5 Sonnet credentials not found in Key Vault');
      }

      // Load GPT-5 configuration
      const gpt5Endpoint = await keyVaultService.getSecret('AZURE-GPT5-ENDPOINT');
      const gpt5ApiKey = await keyVaultService.getSecret('AZURE-GPT5-API-KEY');
      const gpt5Deployment = await keyVaultService.getSecret('AZURE-GPT5-DEPLOYMENT-NAME');
      
      if (gpt5Endpoint && gpt5ApiKey && gpt5Deployment) {
        this.models.set('gpt-5', {
          endpoint: gpt5Endpoint,
          apiKey: gpt5ApiKey,
          deployment: gpt5Deployment
        });
        agentLogger.info('✓ GPT-5 configured');
      } else {
        agentLogger.warn('⚠ GPT-5 credentials not found in Key Vault');
      }

      // Load Phi-4 configuration
      const phi4Endpoint = await keyVaultService.getSecret('AZURE-PHI4-ENDPOINT');
      const phi4ApiKey = await keyVaultService.getSecret('AZURE-PHI4-API-KEY');
      
      if (phi4Endpoint && phi4ApiKey) {
        this.models.set('phi-4', {
          endpoint: phi4Endpoint,
          apiKey: phi4ApiKey,
          modelId: 'phi-4-reasoning-14b'
        });
        agentLogger.info('✓ Phi-4 configured');
      } else {
        agentLogger.warn('⚠ Phi-4 credentials not found in Key Vault');
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
      return 'claude-35-sonnet'; // Best for complex reasoning
    
    case 'code-generation':
    case 'natural-language':
    case 'chat':
    case 'documentation':
      return 'gpt-5'; // Best for code and NLU
    
    case 'cost-optimization':
    case 'simple-tasks':
    case 'quick-decisions':
      return 'phi-4'; // Efficient for simpler tasks
    
    default:
      agentLogger.warn(`Unknown task type: ${taskType}, defaulting to claude-35-sonnet`);
      return 'claude-35-sonnet'; // Default to most capable
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
  outputTokens: number
): number {
  // Pricing per 1M tokens (in dollars)
  const pricing: Record<string, { input: number; output: number }> = {
    'claude-35-sonnet': { input: 3.00, output: 15.00 },
    'gpt-5': { input: 2.50, output: 10.00 },
    'phi-4': { input: 0.40, output: 1.60 }
  };

  const model = pricing[modelId] || pricing['claude-35-sonnet'];
  
  const inputCost = (inputTokens / 1_000_000) * model.input;
  const outputCost = (outputTokens / 1_000_000) * model.output;
  
  // Return cost in cents
  return Math.ceil((inputCost + outputCost) * 100);
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

