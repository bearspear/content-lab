/**
 * Version Management Service
 * Handles prompt versioning, history, and comparison
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  PromptVersion,
  VersionMetadata,
  VersionComparison,
  VersionDiff,
  PropertyDiff,
  MessageDiff,
  TextChange,
  DiffSummary,
  VersionHistoryOptions,
  VersionRestoreResult
} from '../models/version.model';
import { Prompt } from '../models/prompt.model';
import { Message, MessageRole } from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class VersionManagementService {
  // Version storage - In a real app, this would be in a backend database
  private versions: Map<string, PromptVersion[]> = new Map();
  private versionHistorySubject = new BehaviorSubject<PromptVersion[]>([]);

  /**
   * Get version history for a prompt
   */
  getVersionHistory(promptId: string, options?: VersionHistoryOptions): PromptVersion[] {
    let versions = this.versions.get(promptId) || [];

    // Apply filters
    if (options) {
      if (options.includeAutoSaves === false) {
        versions = versions.filter(v => !v.metadata?.isAutoSave);
      }

      if (options.startDate) {
        versions = versions.filter(v => v.createdAt >= options.startDate!);
      }

      if (options.endDate) {
        versions = versions.filter(v => v.createdAt <= options.endDate!);
      }

      // Apply pagination
      if (options.offset !== undefined) {
        versions = versions.slice(options.offset);
      }

      if (options.limit !== undefined) {
        versions = versions.slice(0, options.limit);
      }
    }

    return versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get version history as observable
   */
  getVersionHistory$(promptId: string): Observable<PromptVersion[]> {
    const versions = this.getVersionHistory(promptId);
    this.versionHistorySubject.next(versions);
    return this.versionHistorySubject.asObservable();
  }

  /**
   * Create a new version snapshot
   */
  createVersion(
    prompt: Prompt,
    changeDescription?: string,
    isAutoSave: boolean = false
  ): PromptVersion {
    const versions = this.versions.get(prompt.id) || [];
    const versionNumber = versions.length + 1;

    // Calculate metadata
    const metadata: VersionMetadata = {
      tokenCount: this.calculateTokenCount(prompt),
      messageCount: prompt.messages.length,
      characterCount: this.calculateCharacterCount(prompt),
      isAutoSave: isAutoSave,
      source: 'manual'
    };

    const version: PromptVersion = {
      id: this.generateId(),
      promptId: prompt.id,
      version: versionNumber,
      snapshot: JSON.parse(JSON.stringify(prompt)), // Deep clone
      changeDescription: changeDescription,
      createdAt: new Date(),
      createdBy: 'user', // In a real app, this would be the current user
      tags: prompt.metadata.tags,
      metadata: metadata
    };

    versions.push(version);
    this.versions.set(prompt.id, versions);
    this.versionHistorySubject.next(versions);

    console.log(`[VersionManagement] Created version ${versionNumber} for prompt ${prompt.id}`);
    return version;
  }

  /**
   * Get a specific version by ID
   */
  getVersion(versionId: string): PromptVersion | undefined {
    for (const versions of this.versions.values()) {
      const version = versions.find(v => v.id === versionId);
      if (version) return version;
    }
    return undefined;
  }

  /**
   * Get latest version for a prompt
   */
  getLatestVersion(promptId: string): PromptVersion | undefined {
    const versions = this.getVersionHistory(promptId);
    return versions[0]; // Already sorted by date descending
  }

  /**
   * Restore a previous version
   */
  restoreVersion(versionId: string): VersionRestoreResult {
    const version = this.getVersion(versionId);
    if (!version) {
      return {
        success: false,
        restoredVersion: {} as PromptVersion,
        currentPrompt: {} as Prompt,
        message: 'Version not found'
      };
    }

    // Create a new prompt from the snapshot
    const restoredPrompt: Prompt = {
      ...version.snapshot,
      updatedAt: new Date()
    };

    // Create a new version for the restoration
    this.createVersion(
      restoredPrompt,
      `Restored from version ${version.version}`,
      false
    );

    return {
      success: true,
      restoredVersion: version,
      currentPrompt: restoredPrompt,
      message: `Successfully restored version ${version.version}`
    };
  }

  /**
   * Compare two versions
   */
  compareVersions(oldVersionId: string, newVersionId: string): VersionComparison | null {
    const oldVersion = this.getVersion(oldVersionId);
    const newVersion = this.getVersion(newVersionId);

    if (!oldVersion || !newVersion) {
      console.error('[VersionManagement] One or both versions not found');
      return null;
    }

    const diff = this.generateDiff(oldVersion.snapshot, newVersion.snapshot);

    return {
      oldVersion,
      newVersion,
      diff,
      timestamp: new Date()
    };
  }

  /**
   * Generate diff between two prompts
   */
  generateDiff(oldPrompt: Prompt, newPrompt: Prompt): VersionDiff {
    const diff: VersionDiff = {
      summary: {
        totalChanges: 0,
        messagesAdded: 0,
        messagesRemoved: 0,
        messagesModified: 0,
        metadataChanged: false
      }
    };

    // Compare name
    if (oldPrompt.name !== newPrompt.name) {
      diff.name = {
        old: oldPrompt.name,
        new: newPrompt.name,
        changed: true
      };
      diff.summary.totalChanges++;
    }

    // Compare description
    if (oldPrompt.description !== newPrompt.description) {
      diff.description = {
        old: oldPrompt.description || '',
        new: newPrompt.description || '',
        changed: true
      };
      diff.summary.totalChanges++;
    }

    // Compare messages
    diff.messages = this.compareMessages(oldPrompt.messages, newPrompt.messages);
    diff.summary.messagesAdded = diff.messages.filter(m => m.type === 'added').length;
    diff.summary.messagesRemoved = diff.messages.filter(m => m.type === 'removed').length;
    diff.summary.messagesModified = diff.messages.filter(m => m.type === 'modified').length;
    diff.summary.totalChanges += diff.summary.messagesAdded + diff.summary.messagesRemoved + diff.summary.messagesModified;

    // Compare metadata
    const metadataChanged = JSON.stringify(oldPrompt.metadata) !== JSON.stringify(newPrompt.metadata);
    if (metadataChanged) {
      diff.metadata = {
        old: oldPrompt.metadata,
        new: newPrompt.metadata,
        changed: true
      };
      diff.summary.metadataChanged = true;
      diff.summary.totalChanges++;
    }

    return diff;
  }

  /**
   * Compare message arrays
   */
  private compareMessages(oldMessages: Message[], newMessages: Message[]): MessageDiff[] {
    const diffs: MessageDiff[] = [];
    const maxLength = Math.max(oldMessages.length, newMessages.length);

    for (let i = 0; i < maxLength; i++) {
      const oldMsg = oldMessages[i];
      const newMsg = newMessages[i];

      if (!oldMsg && newMsg) {
        // Message was added
        diffs.push({
          type: 'added',
          newIndex: i,
          newMessage: newMsg
        });
      } else if (oldMsg && !newMsg) {
        // Message was removed
        diffs.push({
          type: 'removed',
          oldIndex: i,
          oldMessage: oldMsg
        });
      } else if (oldMsg && newMsg) {
        // Check if message was modified
        if (oldMsg.role !== newMsg.role || oldMsg.content !== newMsg.content) {
          const contentDiff = oldMsg.content !== newMsg.content
            ? this.generateTextDiff(oldMsg.content, newMsg.content)
            : undefined;

          diffs.push({
            type: 'modified',
            oldIndex: i,
            newIndex: i,
            oldMessage: oldMsg,
            newMessage: newMsg,
            contentDiff: contentDiff ? {
              old: oldMsg.content,
              new: newMsg.content,
              changes: contentDiff
            } : undefined
          });
        } else {
          // Message unchanged
          diffs.push({
            type: 'unchanged',
            oldIndex: i,
            newIndex: i,
            oldMessage: oldMsg,
            newMessage: newMsg
          });
        }
      }
    }

    return diffs;
  }

  /**
   * Generate character-level diff for text
   * Simple implementation - can be enhanced with better diff algorithms
   */
  private generateTextDiff(oldText: string, newText: string): TextChange[] {
    const changes: TextChange[] = [];

    // Simple word-level diff
    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);

    let position = 0;

    // Find common prefix
    let commonPrefixLength = 0;
    while (
      commonPrefixLength < oldWords.length &&
      commonPrefixLength < newWords.length &&
      oldWords[commonPrefixLength] === newWords[commonPrefixLength]
    ) {
      const word = oldWords[commonPrefixLength];
      changes.push({
        type: 'equal',
        value: word + ' ',
        position: position
      });
      position += word.length + 1;
      commonPrefixLength++;
    }

    // Find common suffix
    let commonSuffixLength = 0;
    while (
      commonSuffixLength < oldWords.length - commonPrefixLength &&
      commonSuffixLength < newWords.length - commonPrefixLength &&
      oldWords[oldWords.length - 1 - commonSuffixLength] === newWords[newWords.length - 1 - commonSuffixLength]
    ) {
      commonSuffixLength++;
    }

    // Handle middle changes
    const oldMiddle = oldWords.slice(commonPrefixLength, oldWords.length - commonSuffixLength);
    const newMiddle = newWords.slice(commonPrefixLength, newWords.length - commonSuffixLength);

    if (oldMiddle.length > 0) {
      changes.push({
        type: 'delete',
        value: oldMiddle.join(' '),
        position: position
      });
    }

    if (newMiddle.length > 0) {
      changes.push({
        type: 'insert',
        value: newMiddle.join(' '),
        position: position
      });
      position += newMiddle.join(' ').length;
    }

    // Add suffix
    const suffixWords = oldWords.slice(oldWords.length - commonSuffixLength);
    for (const word of suffixWords) {
      changes.push({
        type: 'equal',
        value: ' ' + word,
        position: position
      });
      position += word.length + 1;
    }

    return changes;
  }

  /**
   * Delete a version
   */
  deleteVersion(versionId: string): boolean {
    for (const [promptId, versions] of this.versions.entries()) {
      const index = versions.findIndex(v => v.id === versionId);
      if (index !== -1) {
        versions.splice(index, 1);
        this.versions.set(promptId, versions);
        this.versionHistorySubject.next(versions);
        console.log(`[VersionManagement] Deleted version ${versionId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Delete all versions for a prompt
   */
  deleteAllVersions(promptId: string): void {
    this.versions.delete(promptId);
    this.versionHistorySubject.next([]);
    console.log(`[VersionManagement] Deleted all versions for prompt ${promptId}`);
  }

  /**
   * Tag a version
   */
  tagVersion(versionId: string, tags: string[]): boolean {
    const version = this.getVersion(versionId);
    if (version) {
      version.tags = tags;
      return true;
    }
    return false;
  }

  /**
   * Add change description to a version
   */
  updateChangeDescription(versionId: string, description: string): boolean {
    const version = this.getVersion(versionId);
    if (version) {
      version.changeDescription = description;
      return true;
    }
    return false;
  }

  /**
   * Calculate token count for a prompt (simple approximation)
   */
  private calculateTokenCount(prompt: Prompt): number {
    const totalChars = prompt.messages.reduce((sum, m) => sum + m.content.length, 0);
    return Math.ceil(totalChars / 4); // ~4 chars per token
  }

  /**
   * Calculate total character count
   */
  private calculateCharacterCount(prompt: Prompt): number {
    return prompt.messages.reduce((sum, m) => sum + m.content.length, 0);
  }

  /**
   * Generate a simple unique ID
   */
  private generateId(): string {
    return `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export version history as JSON
   */
  exportVersionHistory(promptId: string): string {
    const versions = this.getVersionHistory(promptId);
    return JSON.stringify(versions, null, 2);
  }

  /**
   * Download version history as a JSON file
   */
  downloadVersionHistory(promptId: string, promptName?: string): void {
    const json = this.exportVersionHistory(promptId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const fileName = promptName
      ? `${promptName.replace(/[^a-z0-9]/gi, '_')}_versions.json`
      : `prompt_versions_${promptId}.json`;
    link.download = fileName;

    link.click();
    window.URL.revokeObjectURL(url);
    console.log(`[VersionManagement] Downloaded version history for prompt ${promptId}`);
  }

  /**
   * Import version history from JSON
   * Returns imported versions or null if validation fails
   */
  importVersionHistory(jsonString: string, promptId: string): PromptVersion[] | null {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate that it's an array
      if (!Array.isArray(parsed)) {
        console.error('[VersionManagement] Import failed: Not an array');
        return null;
      }

      // Validate each version object
      const validatedVersions: PromptVersion[] = [];
      for (const item of parsed) {
        if (!this.isValidVersionObject(item)) {
          console.error('[VersionManagement] Import failed: Invalid version object', item);
          return null;
        }

        // Convert date strings back to Date objects
        const version: PromptVersion = {
          ...item,
          createdAt: new Date(item.createdAt),
          snapshot: {
            ...item.snapshot,
            createdAt: new Date(item.snapshot.createdAt),
            updatedAt: new Date(item.snapshot.updatedAt)
          }
        };

        validatedVersions.push(version);
      }

      // Merge with existing versions (keeping higher version numbers)
      const existingVersions = this.versions.get(promptId) || [];
      const maxExistingVersion = existingVersions.length > 0
        ? Math.max(...existingVersions.map(v => v.version))
        : 0;

      // Renumber imported versions to avoid conflicts
      const renumberedVersions = validatedVersions.map((v, index) => ({
        ...v,
        id: this.generateId(), // Generate new IDs
        promptId: promptId, // Ensure correct prompt ID
        version: maxExistingVersion + index + 1
      }));

      // Add to version storage
      const allVersions = [...existingVersions, ...renumberedVersions];
      this.versions.set(promptId, allVersions);
      this.versionHistorySubject.next(allVersions);

      console.log(`[VersionManagement] Imported ${renumberedVersions.length} versions for prompt ${promptId}`);
      return renumberedVersions;
    } catch (error) {
      console.error('[VersionManagement] Import failed:', error);
      return null;
    }
  }

  /**
   * Validate version object structure
   */
  private isValidVersionObject(obj: any): boolean {
    return (
      obj &&
      typeof obj.id === 'string' &&
      typeof obj.promptId === 'string' &&
      typeof obj.version === 'number' &&
      obj.snapshot &&
      typeof obj.snapshot === 'object' &&
      obj.createdAt
    );
  }

  /**
   * Get version count for a prompt
   */
  getVersionCount(promptId: string): number {
    return (this.versions.get(promptId) || []).length;
  }

  /**
   * Check if auto-save should be triggered
   * Returns true if enough changes have occurred
   */
  shouldAutoSave(oldPrompt: Prompt, newPrompt: Prompt): boolean {
    const diff = this.generateDiff(oldPrompt, newPrompt);
    // Auto-save if there are 3 or more changes, or if messages were added/removed
    return diff.summary.totalChanges >= 3 ||
           diff.summary.messagesAdded > 0 ||
           diff.summary.messagesRemoved > 0;
  }
}
