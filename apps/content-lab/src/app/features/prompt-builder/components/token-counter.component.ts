/**
 * Token Counter Component
 * Displays token counts and cost estimates for prompts
 */

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TokenCounterService } from '../services/token-counter.service';
import {
  ModelConfig,
  TokenCount,
  CostEstimation,
  LLMProvider
} from '../models/token-counter.model';
import { Prompt } from '../models/prompt.model';

@Component({
  selector: 'app-token-counter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './token-counter.component.html',
  styleUrls: ['./token-counter.component.scss']
})
export class TokenCounterComponent implements OnChanges {
  @Input() prompt!: Prompt;

  // Model selection
  selectedModelId: string = 'claude-3-5-sonnet-20241022'; // Default to Claude 3.5 Sonnet
  expectedOutputTokens: number = 1000;
  availableModels: ModelConfig[] = [];
  selectedModel?: ModelConfig;

  // Token counting
  tokenCount?: TokenCount;
  costEstimation?: CostEstimation | null;
  warnings: string[] = [];

  // UI state
  showModelComparison = false;
  comparisonModels: CostEstimation[] = [];
  expandedMessageId: string | null = null;

  // Expose LLMProvider enum to template
  LLMProvider = LLMProvider;

  constructor(private tokenCounterService: TokenCounterService) {
    this.availableModels = this.tokenCounterService.getAllModels();
    this.selectedModel = this.tokenCounterService.getModelConfig(this.selectedModelId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prompt'] && this.prompt) {
      this.updateTokenCount();
    }
  }

  /**
   * Update token count and cost estimation
   */
  updateTokenCount(): void {
    this.tokenCount = this.tokenCounterService.countPromptTokens(this.prompt);
    this.costEstimation = this.tokenCounterService.estimateCost(
      this.prompt,
      this.selectedModelId,
      this.expectedOutputTokens
    );
    this.warnings = this.tokenCounterService.getUsageWarnings(
      this.prompt,
      this.selectedModelId,
      this.expectedOutputTokens
    );
  }

  /**
   * Handle model selection change
   */
  onModelChange(): void {
    this.selectedModel = this.tokenCounterService.getModelConfig(this.selectedModelId);
    this.updateTokenCount();
  }

  /**
   * Handle expected output tokens change
   */
  onOutputTokensChange(): void {
    this.updateTokenCount();
  }

  /**
   * Toggle model comparison view
   */
  toggleModelComparison(): void {
    this.showModelComparison = !this.showModelComparison;
    if (this.showModelComparison) {
      this.loadModelComparison();
    }
  }

  /**
   * Load comparison data for multiple models
   */
  loadModelComparison(): void {
    const modelIds = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'gpt-4-turbo-preview',
      'gpt-4o-mini',
      'gemini-1.5-pro'
    ];

    this.comparisonModels = this.tokenCounterService.compareCostsAcrossModels(
      this.prompt,
      modelIds,
      this.expectedOutputTokens
    );
  }

  /**
   * Toggle message breakdown
   */
  toggleMessageBreakdown(messageId: string): void {
    this.expandedMessageId = this.expandedMessageId === messageId ? null : messageId;
  }

  /**
   * Check if message breakdown is expanded
   */
  isMessageExpanded(messageId: string): boolean {
    return this.expandedMessageId === messageId;
  }

  /**
   * Get color class for context usage percentage
   */
  getContextUsageColor(percent: number): string {
    if (percent < 50) return 'usage-low';
    if (percent < 80) return 'usage-medium';
    return 'usage-high';
  }

  /**
   * Calculate context window usage percentage
   */
  getContextUsagePercent(): number {
    if (!this.selectedModel || !this.tokenCount) return 0;
    const totalRequired = this.tokenCount.totalTokens + this.expectedOutputTokens;
    return (totalRequired / this.selectedModel.contextWindow) * 100;
  }

  /**
   * Format cost
   */
  formatCost(cost: number): string {
    return this.tokenCounterService.formatCost(cost);
  }

  /**
   * Format token count
   */
  formatTokens(tokens: number): string {
    return this.tokenCounterService.formatTokenCount(tokens);
  }

  /**
   * Get models by provider
   */
  getModelsByProvider(provider: LLMProvider): ModelConfig[] {
    return this.tokenCounterService.getModelsByProvider(provider);
  }

  /**
   * Get provider display name
   */
  getProviderDisplayName(provider: LLMProvider): string {
    const names: Record<LLMProvider, string> = {
      [LLMProvider.Anthropic]: 'Anthropic (Claude)',
      [LLMProvider.OpenAI]: 'OpenAI (GPT)',
      [LLMProvider.Google]: 'Google (Gemini)',
      [LLMProvider.Cohere]: 'Cohere'
    };
    return names[provider];
  }

  /**
   * Get recommended models
   */
  getRecommendedModels(): ModelConfig[] {
    return this.tokenCounterService.getRecommendedModels(this.prompt, 1.0);
  }
}
