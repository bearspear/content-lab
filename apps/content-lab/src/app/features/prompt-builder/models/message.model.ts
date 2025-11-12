/**
 * Message Model
 * Represents a single message in a prompt conversation
 */

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  order: number;
  metadata?: MessageMetadata;
}

export enum MessageRole {
  System = 'system',
  User = 'user',
  Assistant = 'assistant'
}

export interface MessageMetadata {
  tokens?: number;
  hidden?: boolean;
  notes?: string;
}
