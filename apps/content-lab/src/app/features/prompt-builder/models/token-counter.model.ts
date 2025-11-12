/**
 * Token Counter Models
 * Defines interfaces for token counting and cost estimation
 */

/**
 * Supported LLM providers and their models
 */
export enum LLMProvider {
  Anthropic = 'anthropic',
  OpenAI = 'openai',
  Google = 'google',
  Cohere = 'cohere'
}

/**
 * Model configuration with pricing information
 */
export interface ModelConfig {
  id: string;
  name: string;
  provider: LLMProvider;
  maxTokens: number;
  pricing: {
    input: number;  // Cost per 1M tokens
    output: number; // Cost per 1M tokens
  };
  contextWindow: number;
  description?: string;
}

/**
 * Token count result
 */
export interface TokenCount {
  totalTokens: number;
  totalCharacters: number;
  messageBreakdown: MessageTokenCount[];
  estimatedCost?: number;
}

/**
 * Token count for individual message
 */
export interface MessageTokenCount {
  messageId: string;
  role: string;
  contentTokens: number;
  totalTokens: number;
  characterCount: number;
}

/**
 * Cost estimation result
 */
export interface CostEstimation {
  model: ModelConfig;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  costBreakdown?: {
    perMessage: Array<{
      messageId: string;
      role: string;
      tokens: number;
      cost: number;
    }>;
  };
}

/**
 * Token counting options
 */
export interface TokenCountOptions {
  model?: ModelConfig;
  includeSystemMessage?: boolean;
}

/**
 * Predefined model configurations
 */
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  // Anthropic Claude Models
  'claude-3-5-sonnet-20241022': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: LLMProvider.Anthropic,
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: {
      input: 3.00,  // $3 per 1M tokens
      output: 15.00 // $15 per 1M tokens
    },
    description: 'Most intelligent model with excellent performance'
  },
  'claude-3-5-haiku-20241022': {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: LLMProvider.Anthropic,
    maxTokens: 8192,
    contextWindow: 200000,
    pricing: {
      input: 1.00,  // $1 per 1M tokens
      output: 5.00  // $5 per 1M tokens
    },
    description: 'Fast and cost-effective model'
  },
  'claude-3-opus-20240229': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: LLMProvider.Anthropic,
    maxTokens: 4096,
    contextWindow: 200000,
    pricing: {
      input: 15.00, // $15 per 1M tokens
      output: 75.00 // $75 per 1M tokens
    },
    description: 'Most powerful model for complex tasks'
  },

  // OpenAI GPT Models
  'gpt-4-turbo-preview': {
    id: 'gpt-4-turbo-preview',
    name: 'GPT-4 Turbo',
    provider: LLMProvider.OpenAI,
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: {
      input: 10.00,
      output: 30.00
    },
    description: 'Latest GPT-4 Turbo with improved performance'
  },
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: LLMProvider.OpenAI,
    maxTokens: 8192,
    contextWindow: 8192,
    pricing: {
      input: 30.00,
      output: 60.00
    },
    description: 'Original GPT-4 model'
  },
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: LLMProvider.OpenAI,
    maxTokens: 4096,
    contextWindow: 16385,
    pricing: {
      input: 0.50,
      output: 1.50
    },
    description: 'Fast and cost-effective model'
  },

  // Google Gemini Models
  'gemini-pro': {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: LLMProvider.Google,
    maxTokens: 8192,
    contextWindow: 32768,
    pricing: {
      input: 0.50,
      output: 1.50
    },
    description: 'Google\'s advanced AI model'
  },
  'gemini-pro-vision': {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: LLMProvider.Google,
    maxTokens: 8192,
    contextWindow: 32768,
    pricing: {
      input: 0.50,
      output: 1.50
    },
    description: 'Multimodal model with vision capabilities'
  },

  // Cohere Models
  'command': {
    id: 'command',
    name: 'Command',
    provider: LLMProvider.Cohere,
    maxTokens: 4096,
    contextWindow: 4096,
    pricing: {
      input: 1.00,
      output: 2.00
    },
    description: 'Cohere\'s flagship model'
  },
  'command-light': {
    id: 'command-light',
    name: 'Command Light',
    provider: LLMProvider.Cohere,
    maxTokens: 4096,
    contextWindow: 4096,
    pricing: {
      input: 0.30,
      output: 0.60
    },
    description: 'Faster, lighter version of Command'
  }
};

/**
 * Default model for token counting
 */
export const DEFAULT_MODEL = MODEL_CONFIGS['claude-3-5-sonnet-20241022'];
