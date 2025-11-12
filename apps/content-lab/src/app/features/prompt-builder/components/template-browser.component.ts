/**
 * Template Browser Component
 * Displays and allows browsing/searching of prompt templates
 */

import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TemplateService } from '../services/template.service';
import { PromptTemplate, TemplateCategory } from '../models/template.model';

@Component({
  selector: 'app-template-browser',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template-browser.component.html',
  styleUrls: ['./template-browser.component.scss']
})
export class TemplateBrowserComponent implements OnInit {
  @Output() templateSelected = new EventEmitter<PromptTemplate>();
  @Output() closeModal = new EventEmitter<void>();

  templates: PromptTemplate[] = [];
  filteredTemplates: PromptTemplate[] = [];
  categories = Object.values(TemplateCategory);
  selectedCategory: TemplateCategory | 'all' | 'favorites' = 'all';
  searchQuery = '';
  selectedTemplate: PromptTemplate | null = null;

  // Expose TemplateCategory enum to template
  TemplateCategory = TemplateCategory;

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  /**
   * Load all templates
   */
  loadTemplates(): void {
    this.templates = this.templateService.getAllTemplates();
    this.applyFilters();
  }

  /**
   * Apply category and search filters
   */
  applyFilters(): void {
    if (this.selectedCategory === 'favorites') {
      this.filteredTemplates = this.templateService.getFavoriteTemplates();
      // Apply search filter to favorites
      if (this.searchQuery && this.searchQuery.trim() !== '') {
        const lowerQuery = this.searchQuery.toLowerCase();
        this.filteredTemplates = this.filteredTemplates.filter(template => {
          return (
            template.name.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        });
      }
    } else {
      const category = this.selectedCategory === 'all' ? undefined : this.selectedCategory;
      this.filteredTemplates = this.templateService.filterTemplates(category, this.searchQuery);
    }
  }

  /**
   * Handle category filter change
   */
  onCategoryChange(category: TemplateCategory | 'all' | 'favorites'): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  /**
   * Handle search query change
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Select a template for preview
   */
  previewTemplate(template: PromptTemplate): void {
    this.selectedTemplate = template;
  }

  /**
   * Use the selected template
   */
  useTemplate(template: PromptTemplate): void {
    this.templateSelected.emit(template);
    // Note: Don't emit closeModal here - onTemplateSelected handles closing
  }

  /**
   * Close the browser without selecting
   */
  close(): void {
    this.closeModal.emit();
  }

  /**
   * Clear preview
   */
  clearPreview(): void {
    this.selectedTemplate = null;
  }

  /**
   * Get count for a category
   */
  getCategoryCount(category: TemplateCategory | 'all' | 'favorites'): number {
    if (category === 'all') {
      return this.templates.length;
    }
    if (category === 'favorites') {
      return this.templateService.getFavoriteTemplates().length;
    }
    return this.templates.filter(t => t.category === category).length;
  }

  /**
   * Toggle favorite status for a template
   */
  toggleFavorite(template: PromptTemplate, event: Event): void {
    event.stopPropagation();
    this.templateService.toggleFavorite(template.id);
    this.applyFilters(); // Refresh filtered list
  }

  /**
   * Check if a template is favorited
   */
  isFavorite(template: PromptTemplate): boolean {
    return template.isFavorite === true;
  }

  /**
   * Get icon for category (simple emoji-based icons)
   */
  getCategoryIcon(category: TemplateCategory): string {
    const icons: Record<TemplateCategory, string> = {
      [TemplateCategory.RoleBased]: '👤',
      [TemplateCategory.TaskSpecific]: '⚙️',
      [TemplateCategory.FewShot]: '📚',
      [TemplateCategory.ChainOfThought]: '🧠',
      [TemplateCategory.StructuredOutput]: '📋',
      [TemplateCategory.ConstitutionalAI]: '⚖️'
    };
    return icons[category] || '📄';
  }

  /**
   * Format variables for display
   */
  getVariableNames(template: PromptTemplate): string {
    if (!template.variables || template.variables.length === 0) {
      return 'None';
    }
    return template.variables.map(v => v.name).join(', ');
  }

  /**
   * Check if template has examples
   */
  hasExamples(template: PromptTemplate): boolean {
    return !!template.examples && template.examples.length > 0;
  }
}
