/**
 * Prompt Builder Plugin
 * Demonstrates Phase 4 lifecycle hooks and dependency validation
 */

import { FeaturePlugin, ToolCategory } from '@content-lab/plugin-system';

export const plugin: FeaturePlugin = {
  metadata: {
    id: 'prompt-builder',
    name: 'Prompt Builder',
    description: 'Create and test LLM prompts with multi-turn conversations',
    version: '1.0.0',
    category: ToolCategory.CodeDev,
    route: '/tools/prompt-builder',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 20h9"></path>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
    </svg>`,
    // No dependencies declared - lightweight tool that doesn't require Monaco or other external libs
    dependencies: [],
    badge: 'NEW',
    badgeClass: 'badge-new'
  },

  loadComponent: () => import('./prompt-builder.component')
    .then(m => m.PromptBuilderComponent),

  /**
   * Phase 4 Lifecycle Hook: onInitialize
   * Called once when the plugin is first registered (app startup)
   * Use for: one-time setup, loading configuration, initializing services
   */
  onInitialize: async () => {
    console.log('[PromptBuilder Plugin] 🔧 onInitialize() called - Plugin is being registered');
    console.log('[PromptBuilder Plugin] Loading plugin configuration...');

    // Simulate loading configuration
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log('[PromptBuilder Plugin] ✓ Plugin initialized successfully');
  },

  /**
   * Phase 4 Lifecycle Hook: onActivate
   * Called when user navigates TO this plugin route
   * Use for: starting timers, fetching fresh data, focusing inputs
   */
  onActivate: () => {
    console.log('[PromptBuilder Plugin] 🟢 onActivate() called - User navigated to Prompt Builder');
    console.log('[PromptBuilder Plugin] Plugin is now active and ready for use');

    // In a real implementation, you might:
    // - Start auto-save timer
    // - Fetch latest templates
    // - Resume any paused operations
    // - Update UI state
  },

  /**
   * Phase 4 Lifecycle Hook: onDeactivate
   * Called when user navigates AWAY from this plugin route
   * Use for: pausing operations, saving state, releasing resources
   */
  onDeactivate: () => {
    console.log('[PromptBuilder Plugin] 🟡 onDeactivate() called - User navigated away from Prompt Builder');
    console.log('[PromptBuilder Plugin] Pausing plugin operations...');

    // In a real implementation, you might:
    // - Stop auto-save timer
    // - Save current work
    // - Pause any animations
    // - Release temporary resources
  },

  /**
   * Phase 4 Lifecycle Hook: onDestroy
   * Called when plugin is unregistered or app is destroyed
   * Use for: final cleanup, unsubscribing, clearing caches
   */
  onDestroy: async () => {
    console.log('[PromptBuilder Plugin] 🔴 onDestroy() called - Plugin is being destroyed');
    console.log('[PromptBuilder Plugin] Performing final cleanup...');

    // Simulate cleanup
    await new Promise(resolve => setTimeout(resolve, 50));

    console.log('[PromptBuilder Plugin] ✓ Plugin destroyed successfully');

    // In a real implementation, you might:
    // - Unsubscribe from all observables
    // - Clear cached data
    // - Remove event listeners
    // - Close connections
  },

  // Plugin-specific configuration
  config: {
    // Default settings
    maxMessagesPerPrompt: 50,
    autoSaveInterval: 30000, // 30 seconds
    defaultModel: 'claude-3-5-sonnet-20241022'
  }
};
