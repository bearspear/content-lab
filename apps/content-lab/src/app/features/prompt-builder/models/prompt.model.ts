/**
 * Prompt Model
 * Represents a complete prompt with metadata
 */

import { Message } from './message.model';

export interface Prompt {
  id: string;
  name: string;
  description?: string;
  messages: Message[];
  variables?: Record<string, Variable>;
  metadata: PromptMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptMetadata {
  tags: string[];
  author?: string;
  version: string;
  targetModel?: string;
  estimatedTokens?: number;
}

export interface Variable {
  name: string;
  type: VariableType;
  defaultValue?: any;
  description?: string;
  required: boolean;
}

export enum VariableType {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Array = 'array',
  Object = 'object'
}
