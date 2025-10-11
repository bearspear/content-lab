import { Injectable } from '@angular/core';
import { marked } from 'marked';
import hljs from 'highlight.js';
import * as katex from 'katex';

@Injectable({
  providedIn: 'root'
})
export class MarkdownService {
  constructor() {
    this.configureMarked();
  }

  /**
   * Configure marked.js with custom renderers for syntax highlighting,
   * math equations, and footnotes
   */
  private configureMarked(): void {
    const renderer = new marked.Renderer();

    // Override code rendering for syntax highlighting
    renderer.code = (code: string, language: string | undefined): string => {
      if (language && hljs.getLanguage(language)) {
        try {
          const highlighted = hljs.highlight(code, { language }).value;
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
        } catch (err) {
          console.error('Highlighting error:', err);
        }
      }
      return `<pre><code class="hljs">${this.escapeHtml(code)}</code></pre>`;
    };

    // Override paragraph rendering to handle inline math
    const originalParagraph = renderer.paragraph.bind(renderer);
    renderer.paragraph = (text: string): string => {
      // Handle inline math: $...$
      text = text.replace(/\$([^$]+)\$/g, (match, math) => {
        try {
          return katex.renderToString(math, { throwOnError: false });
        } catch (e) {
          return match;
        }
      });
      return originalParagraph(text);
    };

    // Handle block-level math: $$...$$
    const originalBlockquote = renderer.blockquote.bind(renderer);
    renderer.blockquote = (quote: string): string => {
      // Check if this is a math block
      const mathMatch = quote.match(/^\s*\$\$([\s\S]+)\$\$/);
      if (mathMatch) {
        try {
          return `<div class="math-block">${katex.renderToString(mathMatch[1], {
            throwOnError: false,
            displayMode: true
          })}</div>`;
        } catch (e) {
          return originalBlockquote(quote);
        }
      }
      return originalBlockquote(quote);
    };

    // Support footnotes rendering
    renderer.link = (href: string, title: string | null | undefined, text: string): string => {
      // Handle footnote references
      if (href.startsWith('#fn-')) {
        return `<sup><a href="${href}" class="footnote-ref" id="fnref-${href.slice(4)}">${text}</a></sup>`;
      }
      // Handle footnote definitions
      if (href.startsWith('#fnref-')) {
        return `<a href="${href}" class="footnote-backref">↩</a>`;
      }
      const titleAttr = title ? ` title="${this.escapeHtml(title)}"` : '';
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    marked.setOptions({
      renderer: renderer,
      gfm: true,
      breaks: true,
      pedantic: false
    });
  }

  /**
   * Convert markdown text to HTML
   */
  convertToHtml(markdown: string): string {
    if (!markdown.trim()) {
      return '<p class="empty-message">No content to display. Upload a markdown file to get started.</p>';
    }

    try {
      // Convert markdown to HTML
      let html = marked.parse(markdown) as string;

      // Handle math blocks ($$...$$) in the markdown
      html = html.replace(/```math\n([\s\S]+?)```/g, (match, math) => {
        try {
          return `<div class="math-block">${katex.renderToString(math.trim(), {
            throwOnError: false,
            displayMode: true
          })}</div>`;
        } catch (e) {
          return `<pre class="math-error">${match}</pre>`;
        }
      });

      // Process footnotes
      html = this.processFootnotes(html);

      return html;
    } catch (error) {
      console.error('Markdown conversion error:', error);
      return `<div class="error">Error converting markdown: ${error}</div>`;
    }
  }

  /**
   * Process and render footnotes in the HTML
   */
  private processFootnotes(html: string): string {
    const footnotes: { id: string; content: string }[] = [];

    // Extract footnote definitions [^1]: content
    html = html.replace(/\[(\^[\w]+)\]:\s*(.+)/g, (match, id, content) => {
      footnotes.push({ id: id.slice(1), content });
      return '';
    });

    // Replace footnote references [^1]
    html = html.replace(/\[(\^[\w]+)\]/g, (match, id) => {
      const fnId = id.slice(1);
      return `<sup><a href="#fn-${fnId}" class="footnote-ref" id="fnref-${fnId}">[${fnId}]</a></sup>`;
    });

    // Add footnotes section if any exist
    if (footnotes.length > 0) {
      let footnotesHtml = '<hr class="footnotes-separator"><div class="footnotes"><ol>';
      footnotes.forEach(fn => {
        footnotesHtml += `<li id="fn-${fn.id}">${fn.content} <a href="#fnref-${fn.id}" class="footnote-backref">↩</a></li>`;
      });
      footnotesHtml += '</ol></div>';
      html += footnotesHtml;
    }

    return html;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get sample markdown content for demonstration
   */
  getSampleMarkdown(): string {
    return `# Markdown to HTML Converter

Welcome to the **Markdown to HTML Converter**! This tool supports:

## Features

1. **Standard Markdown** - All GFM (GitHub Flavored Markdown) features
2. **Syntax Highlighting** - Beautiful code blocks
3. **Math Equations** - Using KaTeX for LaTeX rendering
4. **Footnotes** - Academic-style references
5. **Multiple Themes** - Choose from various style presets

## Code Example

\`\`\`typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // Output: 55
\`\`\`

## Math Equations

Inline math: The formula $E = mc^2$ is Einstein's famous equation.

Block math (use \`\`\` blocks with "math" language):

\`\`\`math
\\\\sum_{i=1}^{n} i = \\\\frac{n(n+1)}{2}
\`\`\`

## Tables

| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✓ | H1-H6 |
| Lists | ✓ | Ordered & Unordered |
| Code | ✓ | Inline and blocks |
| Math | ✓ | KaTeX rendering |

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

---

> **Tip**: Try uploading your own markdown file or drag and drop it into the upload area!

## Links and Images

- [GitHub](https://github.com)
- [Markdown Guide](https://www.markdownguide.org)

*Try changing the theme using the dropdown above!*
`;
  }
}
