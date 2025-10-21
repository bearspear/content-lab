import { Injectable } from '@angular/core';

/**
 * Service for analyzing and transforming markdown content to make it EPUB-ready
 */
@Injectable({
  providedIn: 'root'
})
export class EpubPreparationService {

  /**
   * Main transformation pipeline - applies all selected transformations
   */
  transformMarkdown(markdown: string, options: PrepareOptions): TransformedMarkdown {
    let result = markdown;
    const changes: ChangeDescription[] = [];

    // Step 1: Add/fix YAML front matter
    if (options.addMetadata) {
      const { content, metadata } = this.ensureMetadata(result);
      result = content;
      if (metadata) {
        changes.push({ type: 'metadata', description: 'Added YAML front matter' });
      }
    }

    // Step 2: Fix heading structure
    if (options.fixHeadings) {
      const { content, fixed } = this.fixHeadingStructure(result);
      result = content;
      changes.push(...fixed);
    }

    // Step 3: Add page breaks
    if (options.addPageBreaks) {
      const { content, count } = this.addPageBreaks(result);
      result = content;
      if (count > 0) {
        changes.push({ type: 'pagebreak', description: `Added ${count} page break${count > 1 ? 's' : ''}` });
      }
    }

    // Step 4: Fix code blocks
    if (options.fixCodeBlocks) {
      const { content, fixed } = this.fixCodeBlocks(result);
      result = content;
      changes.push(...fixed);
    }

    // Step 5: Validate images
    if (options.fixImages) {
      const { content, fixed } = this.fixImages(result);
      result = content;
      changes.push(...fixed);
    }

    // Step 6: Cleanup formatting
    if (options.cleanupFormatting) {
      result = this.cleanupFormatting(result);
      changes.push({ type: 'cleanup', description: 'Cleaned up formatting' });
    }

    return { content: result, changes, warnings: [] };
  }

  /**
   * Analyze markdown to identify structure and potential issues
   */
  analyzeMarkdown(markdown: string): EpubAnalysis {
    const lines = markdown.split('\n');
    const headings: HeadingInfo[] = [];
    const issues: Issue[] = [];
    const suggestions: Suggestion[] = [];

    let hasMetadata = markdown.trim().startsWith('---');
    let lineNum = 0;

    // Parse headings
    for (const line of lines) {
      lineNum++;
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2],
          line: lineNum
        });
      }
    }

    // Check for metadata
    if (!hasMetadata) {
      issues.push({
        type: 'warning',
        message: 'No YAML front matter found',
        autoFix: true
      });
      suggestions.push({
        type: 'add-metadata',
        message: 'Add YAML front matter with title, author, and publication info',
        before: markdown.substring(0, 100),
        after: '---\ntitle: "Your Book Title"\nauthor: "Author Name"\n---\n\n' + markdown.substring(0, 100)
      });
    }

    // Check heading structure
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push({
        type: 'warning',
        message: 'No H1 headings found for chapter structure',
        autoFix: true
      });
      suggestions.push({
        type: 'fix-heading',
        message: 'Promote H2 headings to H1 for proper chapter structure',
        before: '## Chapter Title',
        after: '# Chapter Title'
      });
    } else if (h1Count === 1) {
      issues.push({
        type: 'info',
        message: 'Only one chapter found - consider splitting into multiple chapters',
        autoFix: false
      });
    }

    // Check for code blocks without language
    const codeBlockMatches = markdown.matchAll(/```(\w*)\n/g);
    let unlabeledBlocks = 0;
    for (const match of codeBlockMatches) {
      if (!match[1] || match[1].trim() === '') {
        unlabeledBlocks++;
      }
    }

    if (unlabeledBlocks > 0) {
      issues.push({
        type: 'warning',
        message: `${unlabeledBlocks} code block${unlabeledBlocks > 1 ? 's' : ''} without language identifier`,
        autoFix: true
      });
      suggestions.push({
        type: 'add-language',
        message: 'Auto-detect and add language identifiers to code blocks',
        before: '```\nfunction foo() {}',
        after: '```javascript\nfunction foo() {}'
      });
    }

    // Check for images without alt text
    const imageMatches = markdown.matchAll(/!\[([^\]]*)\]\([^)]+\)/g);
    let imagesWithoutAlt = 0;
    for (const match of imageMatches) {
      if (!match[1] || match[1].trim() === '') {
        imagesWithoutAlt++;
      }
    }

    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'warning',
        message: `${imagesWithoutAlt} image${imagesWithoutAlt > 1 ? 's' : ''} without alt text`,
        autoFix: true
      });
    }

    return {
      hasMetadata,
      chapterCount: h1Count,
      headingStructure: headings,
      issues,
      suggestions
    };
  }

  /**
   * Ensure YAML front matter exists and is properly formatted
   */
  private ensureMetadata(markdown: string): { content: string, metadata: boolean } {
    // Check if already has metadata
    if (markdown.trim().startsWith('---')) {
      return { content: markdown, metadata: false };
    }

    // Extract title from first H1
    const titleMatch = markdown.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Untitled Book';

    const today = new Date().toISOString().split('T')[0];

    const frontMatter = `---
title: "${title}"
author: "Unknown Author"
publisher: ""
isbn: ""
language: "en"
date: "${today}"
description: ""
---

`;

    return { content: frontMatter + markdown, metadata: true };
  }

  /**
   * Fix heading structure - promote H2s to H1s if no H1s exist
   */
  private fixHeadingStructure(markdown: string): { content: string, fixed: ChangeDescription[] } {
    const changes: ChangeDescription[] = [];
    let result = markdown;

    // Split into lines
    const lines = result.split('\n');

    // Find all headings
    const headings: { level: number, line: number, text: string }[] = [];
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        headings.push({
          level: match[1].length,
          line: index,
          text: match[2]
        });
      }
    });

    // Check if we have any H1s
    const hasH1 = headings.some(h => h.level === 1);

    if (!hasH1 && headings.length > 0) {
      // Promote all H2s to H1s
      let promoted = 0;
      for (let i = 0; i < headings.length; i++) {
        if (headings[i].level === 2) {
          const lineIndex = headings[i].line;
          lines[lineIndex] = lines[lineIndex].replace(/^##\s+/, '# ');
          promoted++;
        }
      }

      if (promoted > 0) {
        changes.push({
          type: 'heading',
          description: `Promoted ${promoted} H2 heading${promoted > 1 ? 's' : ''} to H1 for chapter structure`
        });
      }

      result = lines.join('\n');
    }

    return { content: result, fixed: changes };
  }

  /**
   * Add page breaks before chapters (H1 headings)
   */
  private addPageBreaks(markdown: string): { content: string, count: number } {
    const lines = markdown.split('\n');
    const newLines: string[] = [];
    let count = 0;
    let firstH1 = true;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is an H1
      if (line.match(/^#\s+/)) {
        if (firstH1) {
          firstH1 = false;
          newLines.push(line);
        } else {
          // Check if previous line is already a page break
          const prevNonEmptyLine = newLines.slice().reverse().find(l => l.trim() !== '');
          if (prevNonEmptyLine !== '<!-- EPUB:PAGEBREAK -->') {
            // Add blank line, page break, blank line
            if (newLines[newLines.length - 1] !== '') {
              newLines.push('');
            }
            newLines.push('<!-- EPUB:PAGEBREAK -->');
            newLines.push('');
            count++;
          }
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }

    return { content: newLines.join('\n'), count };
  }

  /**
   * Detect programming language from code content
   */
  private detectLanguage(code: string): string {
    // JavaScript/TypeScript patterns
    if (code.match(/\b(function|const|let|var|=>|import.*from|export)\b/)) {
      return 'javascript';
    }

    // Python patterns
    if (code.match(/\b(def|class|import|from.*import|print|if __name__|:$)/m)) {
      return 'python';
    }

    // Java patterns
    if (code.match(/\b(public|private|protected|class.*\{|void|static|System\.out)\b/)) {
      return 'java';
    }

    // Rust patterns
    if (code.match(/\b(fn main|let mut|impl|pub fn|use std::)\b/)) {
      return 'rust';
    }

    // Go patterns
    if (code.match(/\b(func|package main|import|:=|go func)\b/)) {
      return 'go';
    }

    // C/C++ patterns
    if (code.match(/\b(#include|int main|printf|cout|std::)\b/)) {
      return 'cpp';
    }

    // C# patterns
    if (code.match(/\b(using System|namespace|class.*:.*\{|Console\.WriteLine)\b/)) {
      return 'csharp';
    }

    // PHP patterns
    if (code.match(/<\?php|function.*\$|\$[a-z_][a-z0-9_]*\s*=/i)) {
      return 'php';
    }

    // Ruby patterns
    if (code.match(/\b(def|end|require|puts|attr_accessor)\b/)) {
      return 'ruby';
    }

    // HTML patterns
    if (code.match(/<\/?[a-z][\s\S]*>/i)) {
      return 'html';
    }

    // CSS patterns
    if (code.match(/[.#][\w-]+\s*\{|:\s*[a-z-]+;/)) {
      return 'css';
    }

    // SQL patterns
    if (code.match(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE TABLE)\b/i)) {
      return 'sql';
    }

    // Shell/Bash patterns
    if (code.match(/^#!/) || code.match(/\b(echo|grep|awk|sed|bash)\b/)) {
      return 'bash';
    }

    // JSON patterns
    if (code.match(/^\s*[\{\[]/) && code.match(/["\w]+\s*:\s*["\w\[\{]/)) {
      return 'json';
    }

    // YAML patterns
    if (code.match(/^[a-z_]+:\s*[^\n]+$/m) && !code.includes('{')) {
      return 'yaml';
    }

    return '';
  }

  /**
   * Fix code blocks by adding language identifiers where missing
   */
  private fixCodeBlocks(markdown: string): { content: string, fixed: ChangeDescription[] } {
    const changes: ChangeDescription[] = [];
    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    let fixed = 0;

    const result = markdown.replace(codeBlockRegex, (match, lang, code) => {
      if (!lang || lang.trim() === '') {
        const detectedLang = this.detectLanguage(code);
        if (detectedLang) {
          fixed++;
          return `\`\`\`${detectedLang}\n${code}\`\`\``;
        }
      }
      return match;
    });

    if (fixed > 0) {
      changes.push({
        type: 'codeblock',
        description: `Added language identifier${fixed > 1 ? 's' : ''} to ${fixed} code block${fixed > 1 ? 's' : ''}`
      });
    }

    return { content: result, fixed: changes };
  }

  /**
   * Fix images by adding alt text where missing
   */
  private fixImages(markdown: string): { content: string, fixed: ChangeDescription[] } {
    const changes: ChangeDescription[] = [];
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    let fixed = 0;

    const result = markdown.replace(imageRegex, (match, alt, url) => {
      if (!alt || alt.trim() === '') {
        fixed++;
        // Generate alt text from filename
        const filename = url.split('/').pop()?.replace(/\.[^.]+$/, '') || 'image';
        const altText = filename.replace(/[-_]/g, ' ');
        return `![${altText}](${url})`;
      }
      return match;
    });

    if (fixed > 0) {
      changes.push({
        type: 'image',
        description: `Added alt text to ${fixed} image${fixed > 1 ? 's' : ''}`
      });
    }

    return { content: result, fixed: changes };
  }

  /**
   * Cleanup general formatting issues
   */
  private cleanupFormatting(markdown: string): string {
    let result = markdown;

    // Remove excessive blank lines (max 2 consecutive)
    result = result.replace(/\n{3,}/g, '\n\n');

    // Remove trailing whitespace from each line
    result = result.split('\n').map(line => line.trimEnd()).join('\n');

    // Ensure blank line before major headings (H1, H2)
    result = result.replace(/([^\n])\n(#{1,2}\s+)/g, '$1\n\n$2');

    // Ensure blank line after major headings
    result = result.replace(/(#{1,2}\s+.+)\n([^\n#])/g, '$1\n\n$2');

    // Ensure blank lines around code blocks
    result = result.replace(/([^\n])\n```/g, '$1\n\n```');
    result = result.replace(/```\n([^\n])/g, '```\n\n$1');

    return result;
  }
}

// ============================================================================
// Type Definitions
// ============================================================================

export interface PrepareOptions {
  addMetadata: boolean;
  fixHeadings: boolean;
  addPageBreaks: boolean;
  fixCodeBlocks: boolean;
  fixImages: boolean;
  cleanupFormatting: boolean;
  addPartMarkers?: boolean;
}

export interface TransformedMarkdown {
  content: string;
  changes: ChangeDescription[];
  warnings: string[];
}

export interface ChangeDescription {
  type: string;
  description: string;
  lineNumber?: number;
}

export interface EpubAnalysis {
  hasMetadata: boolean;
  chapterCount: number;
  headingStructure: HeadingInfo[];
  issues: Issue[];
  suggestions: Suggestion[];
}

export interface HeadingInfo {
  level: number;
  text: string;
  line: number;
}

export interface Issue {
  type: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  autoFix?: boolean;
}

export interface Suggestion {
  type: 'add-metadata' | 'add-pagebreak' | 'fix-heading' | 'add-language';
  message: string;
  before: string;
  after: string;
  line?: number;
}
