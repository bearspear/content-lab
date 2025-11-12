/**
 * Token Counter Service
 * Provides token counting and cost estimation for LLM prompts
 */

import { Injectable } from '@angular/core';
import {
  ModelConfig,
  TokenCount,
  MessageTokenCount,
  CostEstimation,
  MODEL_CONFIGS,
  LLMProvider
} from '../models/token-counter.model';
import { Message } from '../models/message.model';
import { Prompt } from '../models/prompt.model';

@Injectable({
  providedIn: 'root'
})
export class TokenCounterService {

  /**
   * Get model configuration by ID
   */
  getModelConfig(modelId: string): ModelConfig | undefined {
    return MODEL_CONFIGS[modelId];
  }

  /**
   * Get all available models
   */
  getAllModels(): ModelConfig[] {
    return Object.values(MODEL_CONFIGS);
  }

  /**
   * Get models filtered by provider
   */
  getModelsByProvider(provider: LLMProvider): ModelConfig[] {
    return this.getAllModels().filter(model => model.provider === provider);
  }

  /**
   * Count tokens for a single message
   * Uses a simple approximation: ~4 characters per token
   * This is a rough estimate - actual tokenization varies by model
   */
  countMessageTokens(message: Message): MessageTokenCount {
    const contentTokens = this.estimateTokens(message.content);

    // Add overhead for message structure (role, formatting, etc.)
    // Typical overhead: ~4 tokens per message
    const overhead = 4;

    return {
      messageId: message.id,
      role: message.role,
      contentTokens: contentTokens,
      totalTokens: contentTokens + overhead,
      characterCount: message.content.length
    };
  }

  /**
   * Count tokens for entire prompt
   */
  countPromptTokens(prompt: Prompt): TokenCount {
    const messageTokens = prompt.messages.map(m => this.countMessageTokens(m));
    const totalTokens = messageTokens.reduce((sum, mt) => sum + mt.totalTokens, 0);
    const totalCharacters = messageTokens.reduce((sum, mt) => sum + mt.characterCount, 0);

    return {
      totalTokens,
      messageBreakdown: messageTokens,
      totalCharacters,
      estimatedCost: undefined // Will be calculated separately with model selection
    };
  }

  /**
   * Estimate cost for a prompt using a specific model
   */
  estimateCost(
    prompt: Prompt,
    modelId: string,
    expectedOutputTokens: number = 1000
  ): CostEstimation | null {
    const model = this.getModelConfig(modelId);
    if (!model) {
      console.error(`[TokenCounterService] Model not found: ${modelId}`);
      return null;
    }

    const tokenCount = this.countPromptTokens(prompt);
    const inputTokens = tokenCount.totalTokens;

    // Calculate costs (pricing is per 1M tokens)
    const inputCost = (inputTokens / 1_000_000) * model.pricing.input;
    const outputCost = (expectedOutputTokens / 1_000_000) * model.pricing.output;
    const totalCost = inputCost + outputCost;

    return {
      model: model,
      inputTokens: inputTokens,
      outputTokens: expectedOutputTokens,
      totalTokens: inputTokens + expectedOutputTokens,
      inputCost: inputCost,
      outputCost: outputCost,
      totalCost: totalCost,
      costBreakdown: {
        perMessage: prompt.messages.map(message => {
          const msgTokens = this.countMessageTokens(message);
          return {
            messageId: message.id,
            role: message.role,
            tokens: msgTokens.totalTokens,
            cost: (msgTokens.totalTokens / 1_000_000) * model.pricing.input
          };
        })
      }
    };
  }

  /**
   * Compare costs across multiple models
   */
  compareCostsAcrossModels(
    prompt: Prompt,
    modelIds: string[],
    expectedOutputTokens: number = 1000
  ): CostEstimation[] {
    return modelIds
      .map(modelId => this.estimateCost(prompt, modelId, expectedOutputTokens))
      .filter((estimation): estimation is CostEstimation => estimation !== null);
  }

  /**
   * Check if prompt fits within model's context window
   */
  fitsInContextWindow(prompt: Prompt, modelId: string, outputTokens: number = 1000): boolean {
    const model = this.getModelConfig(modelId);
    if (!model) return false;

    const tokenCount = this.countPromptTokens(prompt);
    const totalRequired = tokenCount.totalTokens + outputTokens;

    return totalRequired <= model.contextWindow;
  }

  /**
   * Get recommended models for a prompt based on token count
   */
  getRecommendedModels(prompt: Prompt, maxCostPerRequest: number = 1.0): ModelConfig[] {
    const allModels = this.getAllModels();
    const tokenCount = this.countPromptTokens(prompt);

    return allModels
      .filter(model => {
        // Must fit in context window with room for output
        const fitsInWindow = tokenCount.totalTokens + 1000 <= model.contextWindow;

        // Estimate cost (assuming 1000 output tokens)
        const estimatedCost = this.estimateCost(prompt, model.id, 1000);
        const withinBudget = estimatedCost ? estimatedCost.totalCost <= maxCostPerRequest : false;

        return fitsInWindow && withinBudget;
      })
      .sort((a, b) => {
        // Sort by cost (cheapest first)
        const costA = this.estimateCost(prompt, a.id, 1000);
        const costB = this.estimateCost(prompt, b.id, 1000);
        if (!costA || !costB) return 0;
        return costA.totalCost - costB.totalCost;
      });
  }

  /**
   * Format cost as currency string
   */
  formatCost(cost: number): string {
    if (cost < 0.01) {
      return `$${(cost * 1000).toFixed(4)}k`; // Show in thousandths of a cent
    }
    return `$${cost.toFixed(4)}`;
  }

  /**
   * Format token count with thousands separator
   */
  formatTokenCount(tokens: number): string {
    return tokens.toLocaleString();
  }

  /**
   * Simple token estimation based on character count
   * Average: ~4 characters per token (varies by model and language)
   * This is a rough approximation - actual tokenization is model-specific
   */
  private estimateTokens(text: string): number {
    if (!text || text.length === 0) return 0;

    // Base estimate: 4 characters per token
    const baseEstimate = Math.ceil(text.length / 4);

    // Adjust for common patterns:
    // - Whitespace doesn't count as much
    // - Special characters may take more tokens
    const whitespaceCount = (text.match(/\s/g) || []).length;
    const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;

    // Reduce estimate slightly for whitespace-heavy text
    const whitespaceAdjustment = Math.floor(whitespaceCount * 0.1);

    // Increase estimate slightly for special character-heavy text
    const specialCharAdjustment = Math.floor(specialCharCount * 0.05);

    return Math.max(1, baseEstimate - whitespaceAdjustment + specialCharAdjustment);
  }

  /**
   * Get usage warnings for a prompt
   */
  getUsageWarnings(prompt: Prompt, modelId: string, outputTokens: number = 1000): string[] {
    const warnings: string[] = [];
    const model = this.getModelConfig(modelId);

    if (!model) {
      warnings.push('Selected model not found');
      return warnings;
    }

    const tokenCount = this.countPromptTokens(prompt);
    const totalRequired = tokenCount.totalTokens + outputTokens;
    const contextUsagePercent = (totalRequired / model.contextWindow) * 100;

    // Warn if using more than 80% of context window
    if (contextUsagePercent > 80) {
      warnings.push(`Using ${contextUsagePercent.toFixed(1)}% of context window - may limit response length`);
    }

    // Warn if exceeding context window
    if (!this.fitsInContextWindow(prompt, modelId, outputTokens)) {
      warnings.push(`Prompt exceeds ${model.name} context window (${this.formatTokenCount(model.contextWindow)} tokens)`);
    }

    // Warn about potentially high costs
    const costEstimate = this.estimateCost(prompt, modelId, outputTokens);
    if (costEstimate && costEstimate.totalCost > 1.0) {
      warnings.push(`Estimated cost is high: ${this.formatCost(costEstimate.totalCost)} per request`);
    }

    // Warn about very long prompts
    if (tokenCount.totalTokens > 10000) {
      warnings.push(`Large prompt (${this.formatTokenCount(tokenCount.totalTokens)} tokens) - consider breaking into smaller requests`);
    }

    return warnings;
  }
}
