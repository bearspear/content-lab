/**
 * Version Diff Component
 * Displays side-by-side comparison of two versions
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VersionManagementService } from '../services/version-management.service';
import {
  VersionComparison,
  VersionDiff,
  MessageDiff,
  PropertyDiff
} from '../models/version.model';
import { PromptVersion } from '../models/version.model';

@Component({
  selector: 'app-version-diff',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './version-diff.component.html',
  styleUrls: ['./version-diff.component.scss']
})
export class VersionDiffComponent implements OnInit, OnChanges {
  @Input() oldVersion!: PromptVersion;
  @Input() newVersion!: PromptVersion;
  @Output() close = new EventEmitter<void>();

  comparison: VersionComparison | null = null;
  diff: VersionDiff | null = null;

  constructor(private versionService: VersionManagementService) {}

  ngOnInit(): void {
    if (this.oldVersion && this.newVersion) {
      this.loadComparison();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['oldVersion'] || changes['newVersion']) && this.oldVersion && this.newVersion) {
      this.loadComparison();
    }
  }

  /**
   * Load comparison between versions
   */
  loadComparison(): void {
    this.comparison = this.versionService.compareVersions(this.oldVersion.id, this.newVersion.id);
    if (this.comparison) {
      this.diff = this.comparison.diff;
    }
  }

  /**
   * Close the diff view
   */
  closeView(): void {
    this.close.emit();
  }

  /**
   * Format date
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  /**
   * Get diff type color
   */
  getDiffTypeClass(type: string): string {
    switch (type) {
      case 'added': return 'diff-added';
      case 'removed': return 'diff-removed';
      case 'modified': return 'diff-modified';
      case 'unchanged': return 'diff-unchanged';
      default: return '';
    }
  }

  /**
   * Get diff icon
   */
  getDiffIcon(type: string): string {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '-';
      case 'modified': return '~';
      case 'unchanged': return '=';
      default: return '';
    }
  }

  /**
   * Check if there are any changes
   */
  hasChanges(): boolean {
    return this.diff ? this.diff.summary.totalChanges > 0 : false;
  }

  /**
   * Check if property has changed
   */
  hasPropertyChanged(property?: PropertyDiff<any>): boolean {
    return property ? property.changed : false;
  }

  /**
   * Get message diff summary
   */
  getMessageDiffSummary(messageDiff: MessageDiff): string {
    switch (messageDiff.type) {
      case 'added':
        return `Message #${(messageDiff.newIndex || 0) + 1} was added`;
      case 'removed':
        return `Message #${(messageDiff.oldIndex || 0) + 1} was removed`;
      case 'modified':
        return `Message #${(messageDiff.newIndex || 0) + 1} was modified`;
      case 'unchanged':
        return `Message #${(messageDiff.newIndex || 0) + 1} is unchanged`;
      default:
        return '';
    }
  }
}
