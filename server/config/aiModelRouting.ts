// AI Model Routing Configuration
// Optimized task-based routing to specialized AI models

export interface ModelConfig {
  name: string;
  provider: 'azure-openai' | 'azure-ai-services' | 'anthropic';
  endpoint: string;
  key: string;
  deploymentName?: string;
  specialization: string[];
  priority: number;
  fallback?: string;
}

export interface ModelRoutingConfig {
  models: Record<string, ModelConfig>;
  routing: Record<string, string[]>;
}

// Model Configuration
export const AI_MODELS: Record<string, ModelConfig> = {
  'phi-4-reasoning': {
    name: 'Phi-4 Reasoning',
    provider: 'azure-ai-services',
    endpoint: process.env.PHI_4_ENDPOINT || '',
    key: process.env.PHI_4_KEY || '',
    deploymentName: process.env.PHI_4_DEPLOYMENT || 'Careerate-phi-4-reasoning',
    specialization: [
      'complex_reasoning',
      'architectural_analysis',
      'cost_optimization',
      'security_audits',
      'deployment_planning',
      'infrastructure_analysis',
      'performance_optimization'
    ],
    priority: 1,
    fallback: 'gpt-4.1'
  },

  'gpt-4o': {
    name: 'GPT-4o',
    provider: 'azure-openai',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    key: process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY || '',
    deploymentName: process.env.GPT_4O_DEPLOYMENT || 'gpt-4o-deployment',
    specialization: [
      'code_generation',
      'api_integration',
      'general_deployment',
      'troubleshooting',
      'full_stack_development',
      'code_analysis'
    ],
    priority: 2,
    fallback: 'gpt-4.1'
  },

  'gpt-4.1': {
    name: 'GPT-4.1',
    provider: 'azure-openai',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    key: process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY || '',
    deploymentName: process.env.GPT_41_DEPLOYMENT || 'gpt-4-1-deployment',
    specialization: [
      'general_purpose',
      'task_coordination',
      'agent_orchestration',
      'system_design',
      'documentation',
      'testing_strategy'
    ],
    priority: 3,
    fallback: 'gpt-4o-mini'
  },

  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'azure-openai',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    key: process.env.AZURE_OPENAI_KEY || process.env.OPENAI_API_KEY || '',
    deploymentName: process.env.GPT_4O_MINI_DEPLOYMENT || 'gpt-4o-mini-deployment',
    specialization: [
      'cost_effective_tasks',
      'simple_deployments',
      'basic_automation',
      'routine_tasks',
      'simple_queries',
      'lightweight_processing'
    ],
    priority: 4,
    fallback: undefined
  },

  'claude-4.5': {
    name: 'Claude 4.5',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com',
    key: process.env.ANTHROPIC_API_KEY || '',
    deploymentName: 'claude-4.5-sonnet-latest',
    specialization: [
      'creative_solutions',
      'complex_instructions',
      'user_communication',
      'documentation_writing',
      'creative_problem_solving',
      'complex_requirement_parsing'
    ],
    priority: 5,
    fallback: 'gpt-4o'
  }
};

// Task-based routing configuration
export const TASK_ROUTING: Record<string, string[]> = {
  // Complex reasoning and analysis tasks
  'architectural_analysis': ['phi-4-reasoning', 'gpt-4.1', 'gpt-4o'],
  'cost_optimization': ['phi-4-reasoning', 'gpt-4.1'],
  'security_audit': ['phi-4-reasoning', 'gpt-4o', 'gpt-4.1'],
  'deployment_planning': ['phi-4-reasoning', 'gpt-4o', 'gpt-4.1'],
  'performance_optimization': ['phi-4-reasoning', 'gpt-4o'],
  'infrastructure_analysis': ['phi-4-reasoning', 'gpt-4.1'],

  // Code generation and development tasks
  'code_generation': ['gpt-4o', 'gpt-4.1', 'gpt-4o-mini'],
  'api_integration': ['gpt-4o', 'gpt-4.1'],
  'full_stack_development': ['gpt-4o', 'gpt-4.1'],
  'code_refactoring': ['gpt-4o', 'gpt-4.1'],
  'bug_fixing': ['gpt-4o', 'gpt-4.1', 'gpt-4o-mini'],
  'code_review': ['gpt-4o', 'phi-4-reasoning'],

  // General purpose and coordination
  'general_query': ['gpt-4.1', 'gpt-4o-mini'],
  'task_coordination': ['gpt-4.1', 'gpt-4o'],
  'agent_orchestration': ['gpt-4.1', 'gpt-4o'],
  'system_design': ['phi-4-reasoning', 'gpt-4.1', 'gpt-4o'],
  'documentation': ['claude-4.5', 'gpt-4.1', 'gpt-4o-mini'],
  'testing_strategy': ['gpt-4.1', 'gpt-4o'],

  // Creative and communication tasks
  'creative_writing': ['claude-4.5', 'gpt-4o'],
  'user_communication': ['claude-4.5', 'gpt-4.1'],
  'complex_instructions': ['claude-4.5', 'phi-4-reasoning'],
  'requirement_parsing': ['claude-4.5', 'gpt-4.1'],

  // Cost-effective tasks
  'simple_deployment': ['gpt-4o-mini', 'gpt-4.1'],
  'basic_automation': ['gpt-4o-mini', 'gpt-4.1'],
  'routine_tasks': ['gpt-4o-mini', 'gpt-4.1'],
  'simple_query': ['gpt-4o-mini', 'gpt-4.1']
};

// Agent personality to task type mapping
export const AGENT_TASK_MAPPING: Record<string, string> = {
  'cara': 'task_coordination',           // Cara: Orchestrator
  'codesmith': 'code_generation',        // CodeSmith: Developer
  'architect': 'architectural_analysis',  // Architect: System Design
  'guardian': 'security_audit',          // Guardian: Security
  'deployer': 'deployment_planning'      // Deployer: DevOps
};

// Get the best model for a given task type
export function getModelForTask(taskType: string): ModelConfig {
  const modelNames = TASK_ROUTING[taskType] || ['gpt-4.1'];

  // Find the first available model
  for (const modelName of modelNames) {
    const model = AI_MODELS[modelName];
    if (model && model.key && model.endpoint) {
      return model;
    }
  }

  // Default fallback
  return AI_MODELS['gpt-4.1'] || AI_MODELS['gpt-4o-mini'];
}

// Get model for a specific agent
export function getModelForAgent(agentType: string): ModelConfig {
  const taskType = AGENT_TASK_MAPPING[agentType] || 'general_query';
  return getModelForTask(taskType);
}

// Get all available models
export function getAvailableModels(): ModelConfig[] {
  return Object.values(AI_MODELS).filter(model => model.key && model.endpoint);
}

// Model status check
export function checkModelAvailability(): Record<string, boolean> {
  const status: Record<string, boolean> = {};

  for (const [name, model] of Object.entries(AI_MODELS)) {
    status[name] = !!(model.key && model.endpoint);
  }

  return status;
}

// Export configuration object
export const MODEL_ROUTING_CONFIG: ModelRoutingConfig = {
  models: AI_MODELS,
  routing: TASK_ROUTING
};

export default MODEL_ROUTING_CONFIG;
