import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateManagerService } from '@content-lab/core';
import { StatefulComponent } from '@content-lab/core';
import { ResetButtonComponent } from '@content-lab/ui-components';
import { Message, MessageRole } from './models/message.model';
import { Prompt, PromptMetadata } from './models/prompt.model';
import { PromptTemplate, InterpolatedTemplate } from './models/template.model';
import { PromptVersion } from './models/version.model';
import { TemplateService } from './services/template.service';
import { VersionManagementService } from './services/version-management.service';
import { TemplateBrowserComponent } from './components/template-browser.component';
import { TemplateVariablesComponent } from './components/template-variables.component';
import { TokenCounterComponent } from './components/token-counter.component';
import { VersionHistoryComponent } from './components/version-history.component';
import { VersionDiffComponent } from './components/version-diff.component';

interface PromptBuilderState {
  currentPrompt: Prompt;
}

@Component({
  selector: 'app-prompt-builder',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ResetButtonComponent,
    TemplateBrowserComponent,
    TemplateVariablesComponent,
    TokenCounterComponent,
    VersionHistoryComponent,
    VersionDiffComponent
  ],
  templateUrl: './prompt-builder.component.html',
  styleUrl: './prompt-builder.component.scss'
})
export class PromptBuilderComponent extends StatefulComponent<PromptBuilderState> implements OnInit, OnDestroy {
  protected readonly TOOL_ID = 'prompt-builder';

  // Expose MessageRole enum to template
  readonly MessageRole = MessageRole;

  // Current working prompt
  currentPrompt!: Prompt;

  // Available message roles for dropdown
  messageRoles = [
    { value: MessageRole.System, label: 'System', icon: '⚙️' },
    { value: MessageRole.User, label: 'User', icon: '👤' },
    { value: MessageRole.Assistant, label: 'Assistant', icon: '🤖' }
  ];

  // Template functionality
  showTemplateBrowser = false;
  showTemplateVariables = false;
  selectedTemplate: PromptTemplate | null = null;

  // Version management functionality
  showVersionHistory = false;
  showVersionDiff = false;
  versionForComparison: { oldVersion: PromptVersion | null; newVersion: PromptVersion | null } = {
    oldVersion: null,
    newVersion: null
  };
  lastSavedPromptSnapshot: Prompt | null = null;

  constructor(
    stateManager: StateManagerService,
    private templateService: TemplateService,
    private versionService: VersionManagementService
  ) {
    super(stateManager);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('[PromptBuilder] Component initialized');

    // Create initial version
    this.createInitialVersion();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    console.log('[PromptBuilder] Component destroyed');
  }

  protected getDefaultState(): PromptBuilderState {
    return {
      currentPrompt: this.createDefaultPrompt()
    };
  }

  protected applyState(state: PromptBuilderState): void {
    this.currentPrompt = state.currentPrompt;
  }

  protected getCurrentState(): PromptBuilderState {
    return {
      currentPrompt: this.currentPrompt
    };
  }

  /**
   * Called by ResetButtonComponent
   */
  resetToDefault(): void {
    this.onReset();
  }

  /**
   * Create a new empty prompt with defaults
   */
  private createDefaultPrompt(): Prompt {
    return {
      id: this.generateId(),
      name: 'Untitled Prompt',
      description: '',
      messages: [
        {
          id: this.generateId(),
          role: MessageRole.System,
          content: 'You are a helpful assistant.',
          order: 0
        }
      ],
      metadata: {
        tags: [],
        version: '1.0.0'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Add a new message to the prompt
   */
  addMessage(role: MessageRole): void {
    const newMessage: Message = {
      id: this.generateId(),
      role: role,
      content: '',
      order: this.currentPrompt.messages.length
    };

    this.currentPrompt.messages.push(newMessage);
    this.currentPrompt.updatedAt = new Date();
    this.saveState();
  }

  /**
   * Remove a message from the prompt
   */
  removeMessage(messageId: string): void {
    const index = this.currentPrompt.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
      this.currentPrompt.messages.splice(index, 1);
      // Reorder remaining messages
      this.currentPrompt.messages.forEach((m, i) => m.order = i);
      this.currentPrompt.updatedAt = new Date();
      this.saveState();
    }
  }

  /**
   * Move a message up in the order
   */
  moveMessageUp(index: number): void {
    if (index > 0) {
      const temp = this.currentPrompt.messages[index];
      this.currentPrompt.messages[index] = this.currentPrompt.messages[index - 1];
      this.currentPrompt.messages[index - 1] = temp;
      // Update order
      this.currentPrompt.messages.forEach((m, i) => m.order = i);
      this.currentPrompt.updatedAt = new Date();
      this.saveState();
    }
  }

  /**
   * Move a message down in the order
   */
  moveMessageDown(index: number): void {
    if (index < this.currentPrompt.messages.length - 1) {
      const temp = this.currentPrompt.messages[index];
      this.currentPrompt.messages[index] = this.currentPrompt.messages[index + 1];
      this.currentPrompt.messages[index + 1] = temp;
      // Update order
      this.currentPrompt.messages.forEach((m, i) => m.order = i);
      this.currentPrompt.updatedAt = new Date();
      this.saveState();
    }
  }

  /**
   * Update message content (called on blur or change)
   */
  updateMessage(): void {
    this.currentPrompt.updatedAt = new Date();
    this.saveState();
  }

  /**
   * Export prompt as JSON
   */
  exportAsJSON(): void {
    const json = JSON.stringify(this.currentPrompt, null, 2);
    this.downloadFile(json, `${this.currentPrompt.name}.json`, 'application/json');
  }

  /**
   * Export prompt as API format (simplified)
   */
  exportAsAPIFormat(): void {
    const apiFormat = {
      model: 'claude-3-5-sonnet-20241022',
      messages: this.currentPrompt.messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      max_tokens: 1024
    };
    const json = JSON.stringify(apiFormat, null, 2);
    this.downloadFile(json, `${this.currentPrompt.name}-api.json`, 'application/json');
  }

  /**
   * Export prompt as plain text
   */
  exportAsText(): void {
    const text = this.currentPrompt.messages
      .map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`)
      .join('\n');
    this.downloadFile(text, `${this.currentPrompt.name}.txt`, 'text/plain');
  }

  /**
   * Calculate total character count
   */
  getTotalCharacterCount(): number {
    return this.currentPrompt.messages.reduce((sum, m) => sum + m.content.length, 0);
  }

  /**
   * Get role badge color
   */
  getRoleColor(role: MessageRole): string {
    switch (role) {
      case MessageRole.System: return 'badge-system';
      case MessageRole.User: return 'badge-user';
      case MessageRole.Assistant: return 'badge-assistant';
      default: return '';
    }
  }

  /**
   * Helper to download a file
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Generate a simple unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ========================================
  // Template Functionality (Phase 2)
  // ========================================

  /**
   * Open the template browser
   */
  openTemplateBrowser(): void {
    this.showTemplateBrowser = true;
    console.log('[PromptBuilder] Opening template browser');
  }

  /**
   * Close the template browser
   */
  closeTemplateBrowser(): void {
    this.showTemplateBrowser = false;
    this.selectedTemplate = null;
  }

  /**
   * Handle template selection from browser
   */
  onTemplateSelected(template: PromptTemplate): void {
    console.log('[PromptBuilder] Template selected:', template.name);
    this.selectedTemplate = template;
    this.showTemplateBrowser = false;

    // If template has variables, show variable form
    if (template.variables && template.variables.length > 0) {
      this.showTemplateVariables = true;
    } else {
      // Apply template directly if no variables
      this.applyTemplateWithoutVariables(template);
    }
  }

  /**
   * Apply template after variables are filled
   */
  onTemplateApplied(interpolatedTemplate: InterpolatedTemplate): void {
    console.log('[PromptBuilder] Applying template with variables');

    // Clear existing messages
    this.currentPrompt.messages = [];

    // Add system message if template has one
    if (interpolatedTemplate.systemPrompt) {
      this.currentPrompt.messages.push({
        id: this.generateId(),
        role: MessageRole.System,
        content: interpolatedTemplate.systemPrompt,
        order: 0
      });
    }

    // Add user message
    this.currentPrompt.messages.push({
      id: this.generateId(),
      role: MessageRole.User,
      content: interpolatedTemplate.userPrompt,
      order: this.currentPrompt.messages.length
    });

    // Update prompt metadata
    if (this.selectedTemplate) {
      this.currentPrompt.name = this.selectedTemplate.name;
      this.currentPrompt.description = this.selectedTemplate.description;
      if (this.selectedTemplate.tags) {
        this.currentPrompt.metadata.tags = [...this.selectedTemplate.tags];
      }
    }

    this.currentPrompt.updatedAt = new Date();
    this.saveState();

    // Close variable form
    this.showTemplateVariables = false;
    this.selectedTemplate = null;
  }

  /**
   * Apply template without variables (direct application)
   */
  private applyTemplateWithoutVariables(template: PromptTemplate): void {
    console.log('[PromptBuilder] Applying template without variables');

    // Clear existing messages
    this.currentPrompt.messages = [];

    // Add system message if template has one
    if (template.systemPrompt) {
      this.currentPrompt.messages.push({
        id: this.generateId(),
        role: MessageRole.System,
        content: template.systemPrompt,
        order: 0
      });
    }

    // Add user message
    this.currentPrompt.messages.push({
      id: this.generateId(),
      role: MessageRole.User,
      content: template.userPrompt,
      order: this.currentPrompt.messages.length
    });

    // Update prompt metadata
    this.currentPrompt.name = template.name;
    this.currentPrompt.description = template.description;
    if (template.tags) {
      this.currentPrompt.metadata.tags = [...template.tags];
    }

    this.currentPrompt.updatedAt = new Date();
    this.saveState();
  }

  /**
   * Close template variables form
   */
  closeTemplateVariables(): void {
    this.showTemplateVariables = false;
    this.selectedTemplate = null;
  }

  // ========================================
  // Version Management Functionality (Phase 3)
  // ========================================

  /**
   * Create initial version on component load
   */
  private createInitialVersion(): void {
    this.versionService.createVersion(this.currentPrompt, 'Initial version', false);
    this.lastSavedPromptSnapshot = JSON.parse(JSON.stringify(this.currentPrompt));
  }

  /**
   * Create a new manual version
   */
  createManualVersion(): void {
    const description = prompt('Enter a description for this version (optional):');
    this.versionService.createVersion(this.currentPrompt, description || 'Manual save', false);
    this.lastSavedPromptSnapshot = JSON.parse(JSON.stringify(this.currentPrompt));
    console.log('[PromptBuilder] Manual version created');
  }

  /**
   * Open version history panel
   */
  openVersionHistory(): void {
    this.showVersionHistory = true;
  }

  /**
   * Close version history panel
   */
  closeVersionHistory(): void {
    this.showVersionHistory = false;
  }

  /**
   * Handle version restoration
   */
  onVersionRestored(prompt: Prompt): void {
    this.currentPrompt = prompt;
    this.saveState();
    this.lastSavedPromptSnapshot = JSON.parse(JSON.stringify(prompt));
    console.log('[PromptBuilder] Version restored');
  }

  /**
   * Handle version comparison request
   */
  onCompareVersions(versions: { oldVersion: PromptVersion; newVersion: PromptVersion }): void {
    this.versionForComparison = versions;
    this.showVersionHistory = false;
    this.showVersionDiff = true;
  }

  /**
   * Close version diff view
   */
  closeVersionDiff(): void {
    this.showVersionDiff = false;
    this.versionForComparison = {
      oldVersion: null,
      newVersion: null
    };
  }

  /**
   * Get version count for display
   */
  getVersionCount(): number {
    return this.versionService.getVersionCount(this.currentPrompt.id);
  }
}
