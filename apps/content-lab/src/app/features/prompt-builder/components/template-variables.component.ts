/**
 * Template Variables Component
 * Form for filling in template variables with live interpolation preview
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PromptTemplate, InterpolatedTemplate } from '../models/template.model';
import { TemplateService } from '../services/template.service';

@Component({
  selector: 'app-template-variables',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './template-variables.component.html',
  styleUrls: ['./template-variables.component.scss']
})
export class TemplateVariablesComponent implements OnInit, OnChanges {
  @Input() template: PromptTemplate | null = null;
  @Output() variablesChanged = new EventEmitter<InterpolatedTemplate>();
  @Output() applyTemplate = new EventEmitter<InterpolatedTemplate>();

  variableValues: Record<string, string> = {};
  interpolatedResult: InterpolatedTemplate | null = null;
  showPreview = false;

  constructor(private templateService: TemplateService) {}

  ngOnInit(): void {
    this.initializeVariables();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['template'] && this.template) {
      this.initializeVariables();
    }
  }

  /**
   * Initialize variable values with defaults
   */
  initializeVariables(): void {
    if (!this.template) {
      this.variableValues = {};
      this.interpolatedResult = null;
      return;
    }

    // Get default values from template
    this.variableValues = this.templateService.getDefaultVariables(this.template);

    // Update interpolation
    this.updateInterpolation();
  }

  /**
   * Handle variable value change
   */
  onVariableChange(): void {
    this.updateInterpolation();
  }

  /**
   * Update the interpolated result
   */
  updateInterpolation(): void {
    if (!this.template) {
      return;
    }

    this.interpolatedResult = this.templateService.interpolateTemplate(
      this.template,
      this.variableValues
    );

    this.variablesChanged.emit(this.interpolatedResult);
  }

  /**
   * Apply the template with current variable values
   */
  apply(): void {
    if (!this.interpolatedResult) {
      return;
    }

    // Validate required variables
    if (this.template) {
      const validation = this.templateService.validateVariables(this.template, this.variableValues);
      if (!validation.valid) {
        alert(`Please fill in required variables: ${validation.missing.join(', ')}`);
        return;
      }
    }

    this.applyTemplate.emit(this.interpolatedResult);
  }

  /**
   * Toggle preview visibility
   */
  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  /**
   * Reset all variables to defaults
   */
  resetVariables(): void {
    this.initializeVariables();
  }

  /**
   * Check if all required variables are filled
   */
  isValid(): boolean {
    if (!this.template) {
      return false;
    }

    const validation = this.templateService.validateVariables(this.template, this.variableValues);
    return validation.valid;
  }

  /**
   * Get validation errors
   */
  getValidationErrors(): string[] {
    if (!this.template) {
      return [];
    }

    const validation = this.templateService.validateVariables(this.template, this.variableValues);
    return validation.missing;
  }
}
