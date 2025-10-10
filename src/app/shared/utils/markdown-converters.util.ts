/**
 * Convert markdown text to AsciiDoc format
 */
export function convertMarkdownToAsciiDoc(markdown: string): string {
  let asciidoc = markdown;

  // Convert headers (reverse order to handle longer sequences first)
  asciidoc = asciidoc.replace(/^######\s+(.+)$/gm, '====== $1');
  asciidoc = asciidoc.replace(/^#####\s+(.+)$/gm, '===== $1');
  asciidoc = asciidoc.replace(/^####\s+(.+)$/gm, '==== $1');
  asciidoc = asciidoc.replace(/^###\s+(.+)$/gm, '=== $1');
  asciidoc = asciidoc.replace(/^##\s+(.+)$/gm, '== $1');
  asciidoc = asciidoc.replace(/^#\s+(.+)$/gm, '= $1');

  // Convert code blocks with language
  asciidoc = asciidoc.replace(/```(\w+)\n([\s\S]*?)```/g, (_match, lang, code) => {
    return `[source,${lang}]\n----\n${code.trim()}\n----`;
  });

  // Convert code blocks without language
  asciidoc = asciidoc.replace(/```\n([\s\S]*?)```/g, (_match, code) => {
    return `----\n${code.trim()}\n----`;
  });

  // Convert inline code
  asciidoc = asciidoc.replace(/`([^`]+)`/g, '`$1`');

  // Convert bold and italic (order matters!)
  // Bold + Italic: ***text*** or ___text___
  asciidoc = asciidoc.replace(/\*\*\*(.+?)\*\*\*/g, '*_$1_*');
  asciidoc = asciidoc.replace(/___(.+?)___/g, '*_$1_*');

  // Bold: **text** or __text__
  asciidoc = asciidoc.replace(/\*\*(.+?)\*\*/g, '*$1*');
  asciidoc = asciidoc.replace(/__(.+?)__/g, '*$1*');

  // Italic: *text* or _text_
  asciidoc = asciidoc.replace(/\*(.+?)\*/g, '_$1_');
  asciidoc = asciidoc.replace(/_(.+?)_/g, '_$1_');

  // Convert links: [text](url) to link:url[text]
  asciidoc = asciidoc.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 'link:$2[$1]');

  // Convert images: ![alt](url) to image::url[alt]
  asciidoc = asciidoc.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, 'image::$2[$1]');

  // Convert unordered lists (*, -, +)
  asciidoc = asciidoc.replace(/^[\*\-\+]\s+(.+)$/gm, '* $1');

  // Convert ordered lists
  asciidoc = asciidoc.replace(/^\d+\.\s+(.+)$/gm, '. $1');

  // Convert blockquotes
  asciidoc = asciidoc.replace(/^>\s+(.+)$/gm, '____\n$1\n____');

  // Convert horizontal rules
  asciidoc = asciidoc.replace(/^(\-{3,}|_{3,}|\*{3,})$/gm, "'''");

  // Convert tables
  asciidoc = asciidoc.replace(/^\|(.+)\|$/gm, (match) => {
    // Check if this is a separator line
    if (/^[\|\-\s:]+$/.test(match)) {
      return ''; // Remove separator lines
    }
    return match;
  });

  // Add table delimiters
  const lines = asciidoc.split('\n');
  let inTable = false;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    const isSeparator = /^\|[\-\s:]+\|$/.test(line.trim());

    if (isTableRow && !isSeparator) {
      if (!inTable) {
        result.push('[options="header"]');
        result.push('|===');
        inTable = true;
      }
      result.push(line);
    } else if (isSeparator) {
      // Skip separator lines
      continue;
    } else {
      if (inTable) {
        result.push('|===');
        result.push('');
        inTable = false;
      }
      result.push(line);
    }
  }

  if (inTable) {
    result.push('|===');
  }

  asciidoc = result.join('\n');

  // Convert math blocks (if using $$...$$ notation)
  asciidoc = asciidoc.replace(/\$\$([^\$]+)\$\$/g, '[latexmath]\n++++\n$1\n++++');

  // Convert inline math
  asciidoc = asciidoc.replace(/\$([^\$]+)\$/g, 'latexmath:[$1]');

  // Convert footnotes [^1] to footnote:[text]
  // First collect footnote definitions
  const footnotes: { [key: string]: string } = {};
  asciidoc = asciidoc.replace(/^\[\^(\w+)\]:\s*(.+)$/gm, (_match, id, content) => {
    footnotes[id] = content;
    return '';
  });

  // Replace footnote references
  asciidoc = asciidoc.replace(/\[\^(\w+)\]/g, (match, id) => {
    const content = footnotes[id];
    return content ? `footnote:[${content}]` : match;
  });

  // Clean up multiple blank lines
  asciidoc = asciidoc.replace(/\n{3,}/g, '\n\n');

  return asciidoc.trim();
}

/**
 * Convert HTML to plain text by stripping all tags
 */
export function convertHtmlToPlainText(html: string): string {
  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Remove script and style elements
  const scripts = temp.getElementsByTagName('script');
  const styles = temp.getElementsByTagName('style');

  for (let i = scripts.length - 1; i >= 0; i--) {
    scripts[i].remove();
  }

  for (let i = styles.length - 1; i >= 0; i--) {
    styles[i].remove();
  }

  // Get text content and clean it up
  let text = temp.textContent || temp.innerText || '';

  // Clean up excessive whitespace
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n'); // Multiple blank lines to double
  text = text.replace(/[ \t]+/g, ' '); // Multiple spaces to single space
  text = text.trim();

  return text;
}
