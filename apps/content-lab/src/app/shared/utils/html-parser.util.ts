import { JsonExportContent } from '../../core/models';

/**
 * Convert HTML to JSON structured format
 */
export function parseHtmlToJson(html: string, theme: string): JsonExportContent {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // Find the first H1 as title
  const h1Element = temp.querySelector('h1');
  const title = h1Element ? h1Element.textContent?.trim() || 'Untitled' : 'Untitled';

  // Parse the content
  const content = parseElementChildren(temp);

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      theme: theme,
      converter: 'Markdown to HTML Converter'
    },
    title: title,
    content: content
  };
}

/**
 * Parse all children of an element
 */
function parseElementChildren(element: Element): any[] {
  const result: any[] = [];

  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    const parsed = parseElement(child);
    if (parsed) {
      result.push(parsed);
    }
  }

  return result;
}

/**
 * Parse a single HTML element into structured data
 */
function parseElement(element: Element): any | null {
  const tagName = element.tagName.toLowerCase();

  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return {
        type: 'heading',
        level: parseInt(tagName.charAt(1)),
        content: element.textContent?.trim() || ''
      };

    case 'p':
      const pContent = parseInlineContent(element);
      return pContent.length > 0 ? {
        type: 'paragraph',
        content: pContent
      } : null;

    case 'pre':
      const codeElement = element.querySelector('code');
      const language = codeElement?.className.match(/language-(\w+)/)?.[1] || '';
      return {
        type: 'code',
        language: language,
        content: codeElement?.textContent || element.textContent || ''
      };

    case 'ul':
      return {
        type: 'list',
        ordered: false,
        items: parseListItems(element)
      };

    case 'ol':
      return {
        type: 'list',
        ordered: true,
        items: parseListItems(element)
      };

    case 'blockquote':
      return {
        type: 'blockquote',
        content: parseElementChildren(element)
      };

    case 'table':
      return parseTable(element);

    case 'hr':
      return {
        type: 'divider'
      };

    case 'div':
      // Handle special divs like math-block or footnotes
      if (element.classList.contains('math-block')) {
        return {
          type: 'math',
          displayMode: true,
          content: element.textContent?.trim() || ''
        };
      } else if (element.classList.contains('footnotes')) {
        return {
          type: 'footnotes',
          content: parseElementChildren(element)
        };
      }
      // For other divs, parse children
      const divChildren = parseElementChildren(element);
      return divChildren.length > 0 ? { type: 'container', content: divChildren } : null;

    default:
      // For unknown elements, try to parse children
      const children = parseElementChildren(element);
      if (children.length > 0) {
        return { type: tagName, content: children };
      }
      return null;
  }
}

/**
 * Parse inline content (text, links, bold, italic, code, etc.)
 */
function parseInlineContent(element: Element): any[] {
  const result: any[] = [];
  const nodes = element.childNodes;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        result.push({ type: 'text', content: text });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as Element;
      const tagName = elem.tagName.toLowerCase();

      switch (tagName) {
        case 'strong':
        case 'b':
          result.push({
            type: 'bold',
            content: elem.textContent?.trim() || ''
          });
          break;

        case 'em':
        case 'i':
          result.push({
            type: 'italic',
            content: elem.textContent?.trim() || ''
          });
          break;

        case 'code':
          result.push({
            type: 'inlineCode',
            content: elem.textContent?.trim() || ''
          });
          break;

        case 'a':
          result.push({
            type: 'link',
            url: elem.getAttribute('href') || '',
            text: elem.textContent?.trim() || ''
          });
          break;

        case 'img':
          result.push({
            type: 'image',
            src: elem.getAttribute('src') || '',
            alt: elem.getAttribute('alt') || ''
          });
          break;

        case 'sup':
          // Handle footnote references
          const link = elem.querySelector('a');
          if (link && link.classList.contains('footnote-ref')) {
            result.push({
              type: 'footnoteRef',
              id: link.getAttribute('href')?.substring(1) || '',
              text: elem.textContent?.trim() || ''
            });
          }
          break;

        default:
          const text = elem.textContent?.trim();
          if (text) {
            result.push({ type: 'text', content: text });
          }
      }
    }
  }

  return result;
}

/**
 * Parse list items, including nested lists
 */
function parseListItems(listElement: Element): any[] {
  const items: any[] = [];
  const liElements = listElement.querySelectorAll(':scope > li');

  liElements.forEach(li => {
    // Check if this list item contains a nested list
    const nestedList = li.querySelector('ul, ol');

    if (nestedList) {
      // Get the text before the nested list
      const textContent: any[] = [];
      for (let i = 0; i < li.childNodes.length; i++) {
        const node = li.childNodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          if (text) {
            textContent.push({ type: 'text', content: text });
          }
        } else if (node !== nestedList) {
          const elem = node as Element;
          if (elem.tagName && elem.tagName.toLowerCase() !== 'ul' && elem.tagName.toLowerCase() !== 'ol') {
            const text = elem.textContent?.trim();
            if (text) {
              textContent.push({ type: 'text', content: text });
            }
          }
        }
      }

      items.push({
        type: 'listItem',
        content: textContent,
        nested: parseElement(nestedList)
      });
    } else {
      items.push({
        type: 'listItem',
        content: parseInlineContent(li)
      });
    }
  });

  return items;
}

/**
 * Parse table structure
 */
function parseTable(tableElement: Element): any {
  const rows: any[] = [];
  const thead = tableElement.querySelector('thead');
  const tbody = tableElement.querySelector('tbody');

  // Parse header rows
  if (thead) {
    const headerRows = thead.querySelectorAll('tr');
    headerRows.forEach(tr => {
      const cells: any[] = [];
      tr.querySelectorAll('th, td').forEach(cell => {
        cells.push({
          type: cell.tagName.toLowerCase() === 'th' ? 'header' : 'cell',
          content: cell.textContent?.trim() || ''
        });
      });
      rows.push({ type: 'row', cells });
    });
  }

  // Parse body rows
  const bodyRows = tbody ? tbody.querySelectorAll('tr') : tableElement.querySelectorAll('tr');
  bodyRows.forEach(tr => {
    const cells: any[] = [];
    tr.querySelectorAll('th, td').forEach(cell => {
      cells.push({
        type: cell.tagName.toLowerCase() === 'th' ? 'header' : 'cell',
        content: cell.textContent?.trim() || ''
      });
    });
    if (cells.length > 0) {
      rows.push({ type: 'row', cells });
    }
  });

  return {
    type: 'table',
    rows: rows
  };
}
