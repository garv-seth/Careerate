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
      // Try Azure AI Foundry Claude first, fallback to standard Anthropic API
      let claudeSonnetEndpoint = await keyVaultService.getSecret('AZURE-CLAUDE-ENDPOINT');
      let claudeSonnetApiKey = await keyVaultService.getSecret('AZURE-CLAUDE-API-KEY');

      // Fallback to standard Anthropic API
      if (!claudeSonnetApiKey) {
        claudeSonnetApiKey = process.env.ANTHROPIC_API_KEY || await keyVaultService.getSecret('ANTHROPIC-API-KEY');
        claudeSonnetEndpoint = 'https://api.anthropic.com'; // Standard Anthropic endpoint
      }

      if (claudeSonnetEndpoint && claudeSonnetApiKey) {
        this.models.set('claude-sonnet-45', {
          endpoint: claudeSonnetEndpoint,
          apiKey: claudeSonnetApiKey,
          modelId: 'claude-sonnet-4-20250514' // Latest Anthropic model
        });
        agentLogger.info('✓ Claude Sonnet configured via Anthropic API');
      } else {
        agentLogger.warn('⚠ Claude credentials not found');
      }

      // Also add Claude Haiku for cheaper operations (using same Anthropic key)
      if (claudeSonnetApiKey) {
        this.models.set('claude-haiku-45', {
          endpoint: claudeSonnetEndpoint || 'https://api.anthropic.com',
          apiKey: claudeSonnetApiKey,
          modelId: 'claude-3-5-haiku-20241022' // Latest Haiku model
        });
        agentLogger.info('✓ Claude Haiku configured (cheaper/faster)');
      }

      // Try Azure OpenAI or standard OpenAI for GPT models
      let openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT || await keyVaultService.getSecret('AZURE-OPENAI-ENDPOINT');
      let openaiApiKey = process.env.AZURE_OPENAI_KEY || await keyVaultService.getSecret('AZURE-OPENAI-KEY');

      // Fallback to standard OpenAI if Azure not available
      if (!openaiApiKey) {
        openaiApiKey = process.env.OPENAI_API_KEY || await keyVaultService.getSecret('OPENAI-API-KEY');
        openaiEndpoint = 'https://api.openai.com/v1';
      }

      if (openaiEndpoint && openaiApiKey) {
        this.models.set('gpt-4o', {
          endpoint: openaiEndpoint,
          apiKey: openaiApiKey,
          modelId: 'gpt-4o' // Latest GPT-4 with vision
        });
        agentLogger.info('✓ GPT-4o configured');
      } else {
        agentLogger.warn('⚠ OpenAI credentials not found');
      }

      // Also add GPT-4o-mini for cheaper operations (using same OpenAI key)
      if (openaiApiKey) {
        this.models.set('gpt-4o-mini', {
          endpoint: openaiEndpoint,
          apiKey: openaiApiKey,
          modelId: 'gpt-4o-mini' // Cheaper, faster GPT-4
        });
        agentLogger.info('✓ GPT-4o-mini configured (cheaper/faster)');
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

