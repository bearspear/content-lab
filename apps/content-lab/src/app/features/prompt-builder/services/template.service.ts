/**
 * Template Service
 * Manages prompt templates, filtering, search, and variable interpolation
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PromptTemplate, TemplateCategory, InterpolatedTemplate } from '../models/template.model';
import { DEFAULT_TEMPLATES } from '../data/default-templates';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private templates$ = new BehaviorSubject<PromptTemplate[]>(DEFAULT_TEMPLATES);
  private selectedTemplate$ = new BehaviorSubject<PromptTemplate | null>(null);

  constructor() {
    console.log(`[TemplateService] Loaded ${DEFAULT_TEMPLATES.length} templates`);
  }

  /**
   * Get all templates as observable
   */
  getTemplates(): Observable<PromptTemplate[]> {
    return this.templates$.asObservable();
  }

  /**
   * Get all templates (synchronous)
   */
  getAllTemplates(): PromptTemplate[] {
    return this.templates$.value;
  }

  /**
   * Get currently selected template
   */
  getSelectedTemplate(): Observable<PromptTemplate | null> {
    return this.selectedTemplate$.asObservable();
  }

  /**
   * Set the selected template
   */
  selectTemplate(template: PromptTemplate | null): void {
    this.selectedTemplate$.next(template);
    console.log('[TemplateService] Selected template:', template?.name || 'None');
  }

  /**
   * Get a template by ID
   */
  getTemplateById(id: string): PromptTemplate | undefined {
    return this.templates$.value.find(t => t.id === id);
  }

  /**
   * Filter templates by category
   */
  getTemplatesByCategory(category: TemplateCategory): PromptTemplate[] {
    return this.templates$.value.filter(t => t.category === category);
  }

  /**
   * Get all unique categories
   */
  getCategories(): TemplateCategory[] {
    return Object.values(TemplateCategory);
  }

  /**
   * Get count of templates per category
   */
  getCategoryCounts(): Map<TemplateCategory, number> {
    const counts = new Map<TemplateCategory, number>();

    this.getCategories().forEach(category => {
      const count = this.templates$.value.filter(t => t.category === category).length;
      counts.set(category, count);
    });

    return counts;
  }

  /**
   * Search templates by keyword
   * Searches in name, description, and tags
   */
  searchTemplates(query: string): PromptTemplate[] {
    if (!query || query.trim() === '') {
      return this.templates$.value;
    }

    const lowerQuery = query.toLowerCase();

    return this.templates$.value.filter(template => {
      // Search in name
      if (template.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in description
      if (template.description.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in tags
      if (template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))) {
        return true;
      }

      // Search in category
      if (template.category.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      return false;
    });
  }

  /**
   * Filter and search templates
   */
  filterTemplates(category?: TemplateCategory, searchQuery?: string): PromptTemplate[] {
    let filtered = this.templates$.value;

    // Apply category filter
    if (category) {
      filtered = filtered.filter(t => t.category === category);
    }

    // Apply search filter
    if (searchQuery && searchQuery.trim() !== '') {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(template => {
        return (
          template.name.toLowerCase().includes(lowerQuery) ||
          template.description.toLowerCase().includes(lowerQuery) ||
          template.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
          template.category.toLowerCase().includes(lowerQuery)
        );
      });
    }

    return filtered;
  }

  /**
   * Interpolate variables in a template
   * Replaces {{variable}} with actual values
   */
  interpolateTemplate(
    template: PromptTemplate,
    variables: Record<string, string>
  ): InterpolatedTemplate {
    const interpolate = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return variables[varName] !== undefined ? variables[varName] : match;
      });
    };

    return {
      systemPrompt: template.systemPrompt ? interpolate(template.systemPrompt) : undefined,
      userPrompt: interpolate(template.userPrompt),
      variables: { ...variables }
    };
  }

  /**
   * Extract variable names from template text
   * Finds all {{variable}} patterns
   */
  extractVariables(text: string): string[] {
    const regex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  /**
   * Validate that all required variables are provided
   */
  validateVariables(
    template: PromptTemplate,
    variables: Record<string, string>
  ): { valid: boolean; missing: string[] } {
    const missing: string[] = [];

    if (template.variables) {
      template.variables.forEach(varDef => {
        if (varDef.required && !variables[varDef.name]) {
          missing.push(varDef.name);
        }
      });
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Get default values for template variables
   */
  getDefaultVariables(template: PromptTemplate): Record<string, string> {
    const defaults: Record<string, string> = {};

    if (template.variables) {
      template.variables.forEach(varDef => {
        if (varDef.defaultValue) {
          defaults[varDef.name] = varDef.defaultValue;
        }
      });
    }

    return defaults;
  }

  /**
   * Add a custom template
   * (Future enhancement: persist to local storage)
   */
  addCustomTemplate(template: PromptTemplate): void {
    const current = this.templates$.value;
    this.templates$.next([...current, template]);
    console.log('[TemplateService] Added custom template:', template.name);
  }

  /**
   * Remove a custom template
   * (Future enhancement: only allow removing custom templates)
   */
  removeTemplate(templateId: string): void {
    const current = this.templates$.value;
    const filtered = current.filter(t => t.id !== templateId);
    this.templates$.next(filtered);
    console.log('[TemplateService] Removed template:', templateId);
  }

  /**
   * Export a template as JSON
   */
  exportTemplate(template: PromptTemplate): string {
    return JSON.stringify(template, null, 2);
  }

  /**
   * Import a template from JSON
   */
  importTemplate(json: string): PromptTemplate {
    return JSON.parse(json) as PromptTemplate;
  }

  /**
   * Get templates with examples (few-shot templates)
   */
  getTemplatesWithExamples(): PromptTemplate[] {
    return this.templates$.value.filter(t => t.examples && t.examples.length > 0);
  }

  /**
   * Get templates by tag
   */
  getTemplatesByTag(tag: string): PromptTemplate[] {
    return this.templates$.value.filter(t =>
      t.tags.some(t => t.toLowerCase() === tag.toLowerCase())
    );
  }

  /**
   * Get all unique tags across templates
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    this.templates$.value.forEach(template => {
      template.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Toggle favorite status for a template
   */
  toggleFavorite(templateId: string): boolean {
    const template = this.getTemplateById(templateId);
    if (template) {
      template.isFavorite = !template.isFavorite;
      this.templates$.next([...this.templates$.value]); // Trigger update
      console.log('[TemplateService] Toggled favorite for:', template.name, template.isFavorite);
      return template.isFavorite;
    }
    return false;
  }

  /**
   * Set favorite status for a template
   */
  setFavorite(templateId: string, isFavorite: boolean): void {
    const template = this.getTemplateById(templateId);
    if (template) {
      template.isFavorite = isFavorite;
      this.templates$.next([...this.templates$.value]); // Trigger update
      console.log('[TemplateService] Set favorite for:', template.name, isFavorite);
    }
  }

  /**
   * Get all favorite templates
   */
  getFavoriteTemplates(): PromptTemplate[] {
    return this.templates$.value.filter(t => t.isFavorite === true);
  }

  /**
   * Check if a template is favorited
   */
  isFavorite(templateId: string): boolean {
    const template = this.getTemplateById(templateId);
    return template?.isFavorite === true;
  }
}
