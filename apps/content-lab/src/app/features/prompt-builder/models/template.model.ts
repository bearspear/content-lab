/**
 * Template Models for Prompt Builder
 * Defines template structure, categories, and variable interpolation
 */

/**
 * Template categories for organizing prompts
 */
export enum TemplateCategory {
  RoleBased = 'Role-Based',
  TaskSpecific = 'Task-Specific',
  FewShot = 'Few-Shot Examples',
  ChainOfThought = 'Chain-of-Thought',
  StructuredOutput = 'Structured Output',
  ConstitutionalAI = 'Constitutional AI'
}

/**
 * Variable definition for template interpolation
 */
export interface TemplateVariable {
  name: string;
  label: string;
  description: string;
  defaultValue?: string;
  required?: boolean;
  type?: 'text' | 'textarea' | 'number' | 'select';
  options?: string[]; // For select type
}

/**
 * Example for few-shot templates
 */
export interface TemplateExample {
  input: string;
  output: string;
}

/**
 * Prompt template definition
 */
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  tags: string[];
  systemPrompt?: string;
  userPrompt: string;
  variables?: TemplateVariable[];
  examples?: TemplateExample[];
  isFavorite?: boolean;
  metadata?: {
    author?: string;
    version?: string;
    created?: string;
    updated?: string;
    usageNotes?: string;
  };
}

/**
 * Template interpolation result
 */
export interface InterpolatedTemplate {
  systemPrompt?: string;
  userPrompt: string;
  variables: Record<string, string>;
}
