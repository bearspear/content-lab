import { Injectable } from '@angular/core';

export type DiffAlgorithm = 'myers' | 'patience' | 'histogram' | 'minimal';

export interface DiffStatistics {
  addedLines: number;
  deletedLines: number;
  modifiedLines: number;
  totalChanges: number;
  similarity: number; // Percentage
}

export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  ignoreComments?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DiffCheckerService {

  /**
   * Calculate diff statistics between two texts
   */
  calculateStatistics(original: string, modified: string, options: DiffOptions = {}): DiffStatistics {
    const originalLinesArray = this.preprocessText(original, options).split('\n');
    const modifiedLinesArray = this.preprocessText(modified, options).split('\n');

    let addedLinesCount = 0;
    let deletedLinesCount = 0;
    let modifiedLinesCount = 0;
    let unchangedLinesCount = 0;

    // Simple line-based diff
    const originalSet = new Set(originalLinesArray);
    const modifiedSet = new Set(modifiedLinesArray);

    // Count additions
    for (const line of modifiedLinesArray) {
      if (!originalSet.has(line)) {
        addedLinesCount++;
      } else {
        unchangedLinesCount++;
      }
    }

    // Count deletions
    for (const line of originalLinesArray) {
      if (!modifiedSet.has(line)) {
        deletedLinesCount++;
      }
    }

    // Estimate modified lines (lines that changed)
    // This is a simplified calculation
    modifiedLinesCount = Math.min(addedLinesCount, deletedLinesCount);
    addedLinesCount = addedLinesCount - modifiedLinesCount;
    deletedLinesCount = deletedLinesCount - modifiedLinesCount;

    const totalLines = Math.max(originalLinesArray.length, modifiedLinesArray.length);
    const similarity = totalLines > 0
      ? Math.round((unchangedLinesCount / totalLines) * 100)
      : 100;

    return {
      addedLines: addedLinesCount,
      deletedLines: deletedLinesCount,
      modifiedLines: modifiedLinesCount,
      totalChanges: addedLinesCount + deletedLinesCount + modifiedLinesCount,
      similarity
    };
  }

  /**
   * Preprocess text based on options
   */
  private preprocessText(text: string, options: DiffOptions): string {
    let processed = text;

    if (options.ignoreCase) {
      processed = processed.toLowerCase();
    }

    if (options.ignoreWhitespace) {
      // Normalize whitespace but keep line structure
      processed = processed.split('\n').map(line => line.trim()).join('\n');
    }

    return processed;
  }

  /**
   * Generate a unified diff (patch format)
   */
  generateUnifiedDiff(original: string, modified: string): string {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');

    let diff = `--- Original\n+++ Modified\n`;
    diff += `@@ -1,${originalLines.length} +1,${modifiedLines.length} @@\n`;

    // Simple diff generation (in real implementation, use a proper diff library)
    const maxLength = Math.max(originalLines.length, modifiedLines.length);

    for (let i = 0; i < maxLength; i++) {
      const originalLine = originalLines[i];
      const modifiedLine = modifiedLines[i];

      if (originalLine === modifiedLine) {
        diff += ` ${originalLine || ''}\n`;
      } else {
        if (originalLine !== undefined) {
          diff += `-${originalLine}\n`;
        }
        if (modifiedLine !== undefined) {
          diff += `+${modifiedLine}\n`;
        }
      }
    }

    return diff;
  }

  /**
   * Export diff as HTML with syntax highlighting
   */
  exportAsHTML(original: string, modified: string): string {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Diff Comparison</title>
  <style>
    body {
      font-family: 'Courier New', monospace;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      padding: 20px;
      background: #2c3e50;
      color: white;
      border-bottom: 3px solid #3498db;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .diff-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
    .side {
      padding: 20px;
      overflow-x: auto;
    }
    .side h2 {
      margin: 0 0 10px 0;
      font-size: 16px;
      color: #2c3e50;
      padding-bottom: 10px;
      border-bottom: 2px solid #ecf0f1;
    }
    .original {
      border-right: 1px solid #ecf0f1;
      background: #fafafa;
    }
    .modified {
      background: #f9f9f9;
    }
    pre {
      margin: 0;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .line {
      display: block;
      padding: 2px 6px;
      margin: 1px 0;
    }
    .added {
      background: #d4edda;
      color: #155724;
    }
    .deleted {
      background: #f8d7da;
      color: #721c24;
    }
    .unchanged {
      background: transparent;
      color: #333;
    }
    @media print {
      body {
        background: white;
      }
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Diff Comparison</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
    <div class="diff-container">
      <div class="side original">
        <h2>Original</h2>
        <pre>${this.escapeHtml(original)}</pre>
      </div>
      <div class="side modified">
        <h2>Modified</h2>
        <pre>${this.escapeHtml(modified)}</pre>
      </div>
    </div>
  </div>
</body>
</html>`;

    return html;
  }

  /**
   * Export diff as Markdown
   */
  exportAsMarkdown(original: string, modified: string, statistics: DiffStatistics): string {
    let markdown = `# Diff Comparison\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;

    markdown += `## Statistics\n\n`;
    markdown += `- **Lines Added:** ${statistics.addedLines}\n`;
    markdown += `- **Lines Deleted:** ${statistics.deletedLines}\n`;
    markdown += `- **Lines Modified:** ${statistics.modifiedLines}\n`;
    markdown += `- **Total Changes:** ${statistics.totalChanges}\n`;
    markdown += `- **Similarity:** ${statistics.similarity}%\n\n`;

    markdown += `## Unified Diff\n\n`;
    markdown += '```diff\n';
    markdown += this.generateUnifiedDiff(original, modified);
    markdown += '\n```\n';

    return markdown;
  }

  /**
   * Export diff as JSON
   */
  exportAsJSON(original: string, modified: string, statistics: DiffStatistics): string {
    const data = {
      timestamp: new Date().toISOString(),
      statistics,
      original: {
        content: original,
        lines: original.split('\n').length
      },
      modified: {
        content: modified,
        lines: modified.split('\n').length
      },
      diff: this.generateUnifiedDiff(original, modified)
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  }

  /**
   * Calculate similarity percentage using Levenshtein distance
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 100;

    const distance = this.levenshteinDistance(str1, str2);
    return Math.round((1 - distance / maxLength) * 100);
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // deletion
          matrix[i][j - 1] + 1,      // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[len1][len2];
  }
}
