import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateManagerService } from '@content-lab/core';
import { StatefulComponent } from '@content-lab/core';
import { ResetButtonComponent } from '@content-lab/ui-components';
import { Message, MessageRole } from './models/message.model';
import { Prompt, PromptMetadata } from './models/prompt.model';

interface PromptBuilderState {
  currentPrompt: Prompt;
}

@Component({
  selector: 'app-prompt-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
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

  constructor(stateManager: StateManagerService) {
    super(stateManager);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    console.log('[PromptBuilder] Component initialized');
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
}
