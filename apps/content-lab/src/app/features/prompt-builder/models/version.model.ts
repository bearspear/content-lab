/**
 * Version Management Models
 * Defines interfaces for prompt versioning and history
 */

import { Prompt } from './prompt.model';

/**
 * Prompt version snapshot
 */
export interface PromptVersion {
  id: string;
  promptId: string;
  version: number;
  snapshot: Prompt;
  changeDescription?: string;
  createdAt: Date;
  createdBy?: string;
  tags?: string[];
  metadata?: VersionMetadata;
}

/**
 * Version metadata
 */
export interface VersionMetadata {
  tokenCount?: number;
  messageCount?: number;
  characterCount?: number;
  isAutoSave?: boolean;
  source?: 'manual' | 'auto' | 'template' | 'import';
}

/**
 * Version comparison result
 */
export interface VersionComparison {
  oldVersion: PromptVersion;
  newVersion: PromptVersion;
  diff: VersionDiff;
  timestamp: Date;
}

/**
 * Differences between versions
 */
export interface VersionDiff {
  name?: PropertyDiff<string>;
  description?: PropertyDiff<string>;
  messages?: MessageDiff[];
  metadata?: PropertyDiff<any>;
  summary: DiffSummary;
}

/**
 * Property-level difference
 */
export interface PropertyDiff<T> {
  old: T;
  new: T;
  changed: boolean;
}

/**
 * Message-level difference
 */
export interface MessageDiff {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  oldIndex?: number;
  newIndex?: number;
  oldMessage?: any;
  newMessage?: any;
  contentDiff?: {
    old: string;
    new: string;
    changes: TextChange[];
  };
}

/**
 * Text-level changes
 */
export interface TextChange {
  type: 'insert' | 'delete' | 'equal';
  value: string;
  position: number;
}

/**
 * Diff summary statistics
 */
export interface DiffSummary {
  totalChanges: number;
  messagesAdded: number;
  messagesRemoved: number;
  messagesModified: number;
  metadataChanged: boolean;
}

/**
 * Version history options
 */
export interface VersionHistoryOptions {
  limit?: number;
  offset?: number;
  includeAutoSaves?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Version restore result
 */
export interface VersionRestoreResult {
  success: boolean;
  restoredVersion: PromptVersion;
  currentPrompt: Prompt;
  message?: string;
}
