/**
 * Version History Component
 * Displays version history timeline with restore and compare capabilities
 */

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VersionManagementService } from '../services/version-management.service';
import {
  PromptVersion,
  VersionHistoryOptions,
  VersionRestoreResult
} from '../models/version.model';
import { Prompt } from '../models/prompt.model';

@Component({
  selector: 'app-version-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './version-history.component.html',
  styleUrls: ['./version-history.component.scss']
})
export class VersionHistoryComponent implements OnInit, OnChanges {
  @Input() prompt!: Prompt;
  @Output() versionRestored = new EventEmitter<Prompt>();
  @Output() compareVersions = new EventEmitter<{ oldVersion: PromptVersion, newVersion: PromptVersion }>();
  @Output() close = new EventEmitter<void>();

  versions: PromptVersion[] = [];
  filteredVersions: PromptVersion[] = [];

  // Filters
  showAutoSaves = true;
  searchQuery = '';
  limitResults = 50;

  // Selection for comparison
  selectedVersions: PromptVersion[] = [];
  comparisonMode = false;

  // UI state
  expandedVersionId: string | null = null;
  editingTagsForVersion: string | null = null;
  newTagInput: string = '';

  constructor(private versionService: VersionManagementService) {}

  ngOnInit(): void {
    if (this.prompt) {
      this.loadVersionHistory();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['prompt'] && this.prompt) {
      this.loadVersionHistory();
    }
  }

  /**
   * Load version history for the current prompt
   */
  loadVersionHistory(): void {
    const options: VersionHistoryOptions = {
      includeAutoSaves: this.showAutoSaves,
      limit: this.limitResults
    };

    this.versions = this.versionService.getVersionHistory(this.prompt.id, options);
    this.applyFilters();
  }

  /**
   * Apply search and filter
   */
  applyFilters(): void {
    this.filteredVersions = this.versions.filter(version => {
      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matchesDescription = version.changeDescription?.toLowerCase().includes(query);
        const matchesTags = version.tags?.some(tag => tag.toLowerCase().includes(query));
        const matchesVersion = `v${version.version}`.includes(query);

        if (!matchesDescription && !matchesTags && !matchesVersion) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Toggle auto-save visibility
   */
  toggleAutoSaves(): void {
    this.showAutoSaves = !this.showAutoSaves;
    this.loadVersionHistory();
  }

  /**
   * Handle search input
   */
  onSearchChange(): void {
    this.applyFilters();
  }

  /**
   * Restore a version
   */
  restoreVersion(version: PromptVersion): void {
    if (confirm(`Are you sure you want to restore version ${version.version}? This will create a new version based on this snapshot.`)) {
      const result: VersionRestoreResult = this.versionService.restoreVersion(version.id);
      if (result.success) {
        this.versionRestored.emit(result.currentPrompt);
        this.loadVersionHistory(); // Refresh to show new restoration version
      } else {
        alert(result.message || 'Failed to restore version');
      }
    }
  }

  /**
   * Toggle comparison mode
   */
  toggleComparisonMode(): void {
    this.comparisonMode = !this.comparisonMode;
    this.selectedVersions = [];
  }

  /**
   * Select version for comparison
   */
  selectVersionForComparison(version: PromptVersion): void {
    if (!this.comparisonMode) return;

    const index = this.selectedVersions.findIndex(v => v.id === version.id);
    if (index >= 0) {
      // Deselect
      this.selectedVersions.splice(index, 1);
    } else {
      // Select (max 2)
      if (this.selectedVersions.length < 2) {
        this.selectedVersions.push(version);
      } else {
        // Replace oldest selection
        this.selectedVersions.shift();
        this.selectedVersions.push(version);
      }
    }
  }

  /**
   * Check if version is selected for comparison
   */
  isVersionSelected(version: PromptVersion): boolean {
    return this.selectedVersions.some(v => v.id === version.id);
  }

  /**
   * Compare selected versions
   */
  compareSelected(): void {
    if (this.selectedVersions.length === 2) {
      // Sort by version number to ensure old -> new comparison
      const [v1, v2] = this.selectedVersions.sort((a, b) => a.version - b.version);
      this.compareVersions.emit({ oldVersion: v1, newVersion: v2 });
    }
  }

  /**
   * Toggle version details
   */
  toggleVersionDetails(versionId: string): void {
    this.expandedVersionId = this.expandedVersionId === versionId ? null : versionId;
  }

  /**
   * Check if version details are expanded
   */
  isVersionExpanded(versionId: string): boolean {
    return this.expandedVersionId === versionId;
  }

  /**
   * Delete a version
   */
  deleteVersion(version: PromptVersion, event: Event): void {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete version ${version.version}?`)) {
      const success = this.versionService.deleteVersion(version.id);
      if (success) {
        this.loadVersionHistory();
      }
    }
  }

  /**
   * Export version history
   */
  exportHistory(): void {
    this.versionService.downloadVersionHistory(this.prompt.id, this.prompt.name);
  }

  /**
   * Import version history
   */
  importHistory(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const content = e.target.result;
          const result = this.versionService.importVersionHistory(content, this.prompt.id);

          if (result && result.length > 0) {
            alert(`Successfully imported ${result.length} version(s)`);
            this.loadVersionHistory();
          } else {
            alert('Failed to import version history. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  /**
   * Format date for display
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
   * Get time ago string
   */
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return this.formatDate(date);
  }

  /**
   * Get version badge class
   */
  getVersionBadgeClass(version: PromptVersion): string {
    if (version.metadata?.isAutoSave) return 'badge-auto';
    return 'badge-manual';
  }

  /**
   * Get version icon
   */
  getVersionIcon(version: PromptVersion): string {
    if (version.metadata?.isAutoSave) return '🔄';
    return '📌';
  }

  /**
   * Toggle tag editing for a version
   */
  toggleTagEditing(versionId: string): void {
    this.editingTagsForVersion = this.editingTagsForVersion === versionId ? null : versionId;
    this.newTagInput = '';
  }

  /**
   * Add tag to version
   */
  addTag(version: PromptVersion, event: Event): void {
    event.stopPropagation();
    const tag = this.newTagInput.trim();

    if (tag && tag.length > 0) {
      const currentTags = version.tags || [];

      // Check for duplicates
      if (currentTags.includes(tag)) {
        alert('Tag already exists');
        return;
      }

      const newTags = [...currentTags, tag];
      const success = this.versionService.tagVersion(version.id, newTags);

      if (success) {
        this.newTagInput = '';
        this.loadVersionHistory();
      }
    }
  }

  /**
   * Remove tag from version
   */
  removeTag(version: PromptVersion, tagToRemove: string, event: Event): void {
    event.stopPropagation();
    const currentTags = version.tags || [];
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    const success = this.versionService.tagVersion(version.id, newTags);

    if (success) {
      this.loadVersionHistory();
    }
  }

  /**
   * Handle Enter key in tag input
   */
  onTagInputKeydown(version: PromptVersion, event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag(version, event);
    }
  }

  /**
   * Close the history panel
   */
  closePanel(): void {
    this.close.emit();
  }
}
