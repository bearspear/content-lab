import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { parse as parseYAML } from 'yaml';
import { MarkdownService } from './markdown.service';
import { ThemeService } from './theme.service';
import { firstValueFrom } from 'rxjs';

// Interfaces
export interface EpubMetadata {
  title: string;
  author: string;
  publisher?: string;
  language: string;
  isbn?: string;
  description?: string;
  date?: string;
  cover?: string;
}

export interface EpubChapter {
  id: string;
  title: string;
  content: string;
  htmlContent: string;
  level: number; // 1 = H1, 2 = H2, etc.
  order: number;
  partId?: string; // Reference to part this chapter belongs to
}

export interface EpubPart {
  id: string;
  title: string;
  order: number;
}

export interface TocItem {
  id: string;
  title: string;
  href: string;
  level: number;
  children?: TocItem[];
}

export interface EpubImage {
  id: string;
  originalSrc: string;
  epubPath: string;
  data?: Blob | string;
  mimeType: string;
}

export interface EpubStructure {
  metadata: EpubMetadata;
  cover?: string;  // Cover image
  coverContent?: string; // Custom cover page HTML content
  chapters: EpubChapter[];
  parts: EpubPart[];
  toc: TocItem[];
  images: EpubImage[];
}

export interface EpubOptions {
  includeCover: boolean;
  includeToc: boolean;
  tocDepth: 1 | 2 | 3;
  fontEmbedding: boolean;
  hyphenation: boolean;
  textAlign: 'left' | 'justify';
  theme: 'light' | 'sepia' | 'dark';
}

@Injectable({
  providedIn: 'root'
})
export class EpubExportService {
  private readonly fontFiles = [
    { path: 'assets/fonts/literata/Literata-Regular.ttf', zipPath: 'OEBPS/fonts/literata/Literata-Regular.ttf', id: 'font-literata-regular' },
    { path: 'assets/fonts/literata/Literata-Italic.ttf', zipPath: 'OEBPS/fonts/literata/Literata-Italic.ttf', id: 'font-literata-italic' },
    { path: 'assets/fonts/literata/Literata-Bold.ttf', zipPath: 'OEBPS/fonts/literata/Literata-Bold.ttf', id: 'font-literata-bold' },
    { path: 'assets/fonts/literata/Literata-BoldItalic.ttf', zipPath: 'OEBPS/fonts/literata/Literata-BoldItalic.ttf', id: 'font-literata-bolditalic' },
    { path: 'assets/fonts/inter/Inter-Regular.ttf', zipPath: 'OEBPS/fonts/inter/Inter-Regular.ttf', id: 'font-inter-regular' },
    { path: 'assets/fonts/inter/Inter-SemiBold.ttf', zipPath: 'OEBPS/fonts/inter/Inter-SemiBold.ttf', id: 'font-inter-semibold' },
    { path: 'assets/fonts/inter/Inter-Bold.ttf', zipPath: 'OEBPS/fonts/inter/Inter-Bold.ttf', id: 'font-inter-bold' },
    { path: 'assets/fonts/source-code-pro/SourceCodePro-Regular.ttf', zipPath: 'OEBPS/fonts/source-code-pro/SourceCodePro-Regular.ttf', id: 'font-sourcecodepro-regular' }
  ];

  constructor(
    private markdownService: MarkdownService,
    private themeService: ThemeService,
    private http: HttpClient
  ) {}

  /**
   * Parse markdown into EPUB structure
   */
  parseMarkdownToEpub(markdown: string): EpubStructure {
    // Step 1: Extract metadata
    const metadata = this.parseMetadata(markdown);

    // Step 2: Remove metadata from content
    let contentWithoutMetadata = this.removeMetadata(markdown);

    // Step 3: Extract custom cover content if present
    const { coverHtml, markdownWithoutCover } = this.extractCoverContent(contentWithoutMetadata);

    // Step 4: Extract parts and mark them in the markdown
    const { parts, markedMarkdown } = this.extractParts(markdownWithoutCover);

    // Step 5: Process other EPUB special markers
    const processedMarkdown = this.processEpubMarkers(markedMarkdown);

    // Step 6: Split into chapters (will track current part)
    const chapters = this.splitIntoChapters(processedMarkdown);

    // Step 7: Generate table of contents
    const toc = this.generateToc(chapters, parts);

    // Step 8: Extract images from all chapters
    const images = this.extractImages(chapters);

    return {
      metadata,
      cover: metadata.cover,
      coverContent: coverHtml,
      chapters,
      parts,
      toc,
      images
    };
  }

  /**
   * Generate EPUB file
   */
  async generateEpub(
    structure: EpubStructure,
    options: EpubOptions,
    filename: string = 'book.epub'
  ): Promise<void> {
    const zip = new JSZip();

    // 1. Add mimetype (must be first, uncompressed)
    zip.file('mimetype', 'application/epub+zip', {
      compression: 'STORE'
    });

    // 2. Create META-INF/container.xml
    zip.file('META-INF/container.xml', this.createContainerXml());

    // 3. Create content.opf (manifest, metadata, spine)
    zip.file('OEBPS/content.opf', this.createContentOpf(structure, options));

    // 4. Create navigation files
    zip.file('OEBPS/nav.xhtml', this.createNavXhtml(structure.toc, structure.metadata));
    zip.file('OEBPS/toc.ncx', this.createTocNcx(structure.toc, structure.metadata));

    // 5. Add CSS
    zip.file('OEBPS/styles/book.css', this.generateEpubCss(options));

    // 5b. Add KaTeX CSS for math rendering
    try {
      const katexCss = await firstValueFrom(
        this.http.get('assets/css/katex.min.css', { responseType: 'text' })
      );
      zip.file('OEBPS/styles/katex.min.css', katexCss);
    } catch (error) {
      console.warn('KaTeX CSS not found. Math rendering may not work properly.');
    }

    // 5c. Add Highlight.js CSS for syntax highlighting
    try {
      // Choose highlight.js theme based on EPUB theme
      const hljsTheme = options.theme === 'dark' ? 'highlight-github-dark.min.css' : 'highlight-github.min.css';
      const hljsCss = await firstValueFrom(
        this.http.get(`assets/css/${hljsTheme}`, { responseType: 'text' })
      );
      zip.file('OEBPS/styles/highlight.min.css', hljsCss);
    } catch (error) {
      console.warn('Highlight.js CSS not found. Syntax highlighting may not work properly.');
    }

    // 6. Add cover if exists
    if (options.includeCover && (structure.cover || structure.coverContent)) {
      // Handle cover image if present
      if (structure.cover && structure.cover.startsWith('data:')) {
        const base64Data = structure.cover.split(',')[1];
        zip.file('OEBPS/images/cover.jpg', base64Data, { base64: true });
      }
      // Create cover page (will use custom content or image)
      zip.file('OEBPS/text/cover.xhtml', this.createCoverXhtml(structure.coverContent, structure.cover));
    }

    // 6a. Add title page and copyright page
    zip.file('OEBPS/text/titlepage.xhtml', this.createTitlePage(structure.metadata));
    zip.file('OEBPS/text/copyright.xhtml', this.createCopyrightPage(structure.metadata));

    // 6b. Fetch and add embedded images
    if (structure.images.length > 0) {
      await this.addImagesToZip(zip, structure.images);
    }

    // 7. Add chapter XHTML files (with updated image paths)
    structure.chapters.forEach((chapter, i) => {
      const xhtml = this.createChapterXhtml(chapter, options, structure.images);
      const chapterNum = String(i + 1).padStart(3, '0');
      zip.file(`OEBPS/text/chapter-${chapterNum}.xhtml`, xhtml);
    });

    // 8. Add fonts if font embedding is enabled
    if (options.fontEmbedding) {
      await this.addFontsToZip(zip);
    }

    // 9. Generate and download
    const blob = await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/epub+zip',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    saveAs(blob, filename);
  }

  /**
   * Fetch and add font files to the EPUB ZIP
   */
  private async addFontsToZip(zip: JSZip): Promise<void> {
    const fetchPromises = this.fontFiles.map(async (font) => {
      try {
        const blob = await firstValueFrom(
          this.http.get(font.path, { responseType: 'blob' })
        );
        zip.file(font.zipPath, blob);
        console.log(`Added font: ${font.path}`);
      } catch (error) {
        console.warn(`Font not found: ${font.path}. Falling back to system fonts.`);
      }
    });

    await Promise.all(fetchPromises);
  }

  /**
   * Parse YAML front matter metadata
   */
  private parseMetadata(markdown: string): EpubMetadata {
    const yamlMatch = markdown.match(/^---\n([\s\S]*?)\n---/);

    if (yamlMatch) {
      try {
        const parsed = parseYAML(yamlMatch[1]);
        return {
          title: parsed.title || 'Untitled Book',
          author: parsed.author || 'Unknown Author',
          publisher: parsed.publisher,
          language: parsed.language || 'en',
          isbn: parsed.isbn,
          description: parsed.description,
          date: parsed.date || new Date().toISOString().split('T')[0],
          cover: parsed.cover
        };
      } catch (error) {
        console.error('Failed to parse YAML metadata:', error);
      }
    }

    // Default metadata
    return {
      title: 'Untitled Book',
      author: 'Unknown Author',
      language: 'en',
      date: new Date().toISOString().split('T')[0]
    };
  }

  /**
   * Remove YAML front matter from markdown
   */
  private removeMetadata(markdown: string): string {
    return markdown.replace(/^---\n[\s\S]*?\n---\n/, '');
  }

  /**
   * Process special EPUB markers in markdown
   */
  private processEpubMarkers(markdown: string): string {
    let processed = markdown;

    // Convert EPUB:PAGEBREAK markers to HTML divs with CSS class
    processed = processed.replace(/<!--\s*EPUB:PAGEBREAK\s*-->/gi, '<div class="page-break-before"></div>');

    // EPUB:PART markers are handled separately in extractParts()

    return processed;
  }

  /**
   * Extract EPUB:PART markers from markdown
   */
  private extractParts(markdown: string): { parts: EpubPart[]; markedMarkdown: string } {
    const parts: EpubPart[] = [];
    const partRegex = /<!--\s*EPUB:PART\s+title="([^"]+)"\s*-->/gi;
    let match;
    let partIndex = 0;

    // Find all part markers
    while ((match = partRegex.exec(markdown)) !== null) {
      partIndex++;
      parts.push({
        id: `part-${String(partIndex).padStart(3, '0')}`,
        title: match[1],
        order: partIndex
      });
    }

    // Replace part markers with special markers that include part ID
    let markedMarkdown = markdown;
    partIndex = 0;
    markedMarkdown = markedMarkdown.replace(partRegex, (_match, _title) => {
      partIndex++;
      const partId = `part-${String(partIndex).padStart(3, '0')}`;
      return `<!-- EPUB_PART_MARKER:${partId} -->`;
    });

    return { parts, markedMarkdown };
  }

  /**
   * Extract EPUB:COVER content from markdown
   */
  private extractCoverContent(markdown: string): { coverHtml?: string; markdownWithoutCover: string } {
    const coverRegex = /<!--\s*EPUB:COVER\s*-->([\s\S]*?)<!--\s*\/EPUB:COVER\s*-->/i;
    const match = markdown.match(coverRegex);

    if (match) {
      const coverMarkdown = match[1].trim();
      const coverHtml = this.markdownService.convertToHtml(coverMarkdown);
      const markdownWithoutCover = markdown.replace(coverRegex, '').trim();

      return { coverHtml, markdownWithoutCover };
    }

    return { markdownWithoutCover: markdown };
  }

  /**
   * Split markdown into chapters based on H1 headings
   */
  private splitIntoChapters(markdown: string): EpubChapter[] {
    const chapters: EpubChapter[] = [];
    let currentPartId: string | undefined;

    // Split by H1 headings (# at start of line)
    const sections = markdown.split(/^# /gm).filter(Boolean);

    sections.forEach((section, index) => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      let content = lines.slice(1).join('\n').trim();

      // Check if this section starts with a part marker
      const partMarkerMatch = content.match(/^<!--\s*EPUB_PART_MARKER:([^>]+)\s*-->/);
      if (partMarkerMatch) {
        currentPartId = partMarkerMatch[1];
        // Remove the part marker from content
        content = content.replace(/^<!--\s*EPUB_PART_MARKER:[^>]+\s*-->/, '').trim();
      }

      // Convert markdown to HTML
      const htmlContent = this.markdownService.convertToHtml(`# ${title}\n\n${content}`);

      chapters.push({
        id: `chapter-${String(index + 1).padStart(3, '0')}`,
        title: title,
        content: content,
        htmlContent: htmlContent,
        level: 1,
        order: index + 1,
        partId: currentPartId
      });
    });

    return chapters;
  }

  /**
   * Generate table of contents from chapters and parts
   */
  private generateToc(chapters: EpubChapter[], parts: EpubPart[] = []): TocItem[] {
    const tocItems: TocItem[] = [];

    if (parts.length === 0) {
      // No parts, just list chapters
      return chapters.map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        href: `text/${chapter.id}.xhtml`,
        level: chapter.level
      }));
    }

    // Group chapters by parts
    parts.forEach(part => {
      const partChapters = chapters.filter(ch => ch.partId === part.id);

      if (partChapters.length > 0) {
        // Add part as a TOC item with children
        tocItems.push({
          id: part.id,
          title: part.title,
          href: `text/${partChapters[0].id}.xhtml`, // Link to first chapter of part
          level: 0,
          children: partChapters.map(chapter => ({
            id: chapter.id,
            title: chapter.title,
            href: `text/${chapter.id}.xhtml`,
            level: 1
          }))
        });
      }
    });

    // Add chapters without parts at the end
    const chaptersWithoutPart = chapters.filter(ch => !ch.partId);
    chaptersWithoutPart.forEach(chapter => {
      tocItems.push({
        id: chapter.id,
        title: chapter.title,
        href: `text/${chapter.id}.xhtml`,
        level: 1
      });
    });

    return tocItems;
  }

  /**
   * Create container.xml
   */
  private createContainerXml(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  }

  /**
   * Create content.opf (OPF Package Document)
   */
  private createContentOpf(structure: EpubStructure, options: EpubOptions): string {
    const metadata = structure.metadata;
    const uuid = `urn:uuid:${this.generateUUID()}`;

    // Manifest items
    const manifestItems = [
      '<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>',
      '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
      '<item id="css" href="styles/book.css" media-type="text/css"/>',
      '<item id="katex-css" href="styles/katex.min.css" media-type="text/css"/>',
      '<item id="highlight-css" href="styles/highlight.min.css" media-type="text/css"/>'
    ];

    // Add cover if exists
    if (structure.cover) {
      manifestItems.push(
        '<item id="cover-image" href="images/cover.jpg" media-type="image/jpeg" properties="cover-image"/>',
        '<item id="cover" href="text/cover.xhtml" media-type="application/xhtml+xml"/>'
      );
    }

    // Add title page and copyright page
    manifestItems.push(
      '<item id="titlepage" href="text/titlepage.xhtml" media-type="application/xhtml+xml"/>',
      '<item id="copyright" href="text/copyright.xhtml" media-type="application/xhtml+xml"/>'
    );

    // Add fonts if font embedding is enabled
    if (options.fontEmbedding) {
      this.fontFiles.forEach(font => {
        manifestItems.push(
          `<item id="${font.id}" href="fonts/${font.zipPath.replace('OEBPS/fonts/', '')}" media-type="font/ttf"/>`
        );
      });
    }

    // Add embedded images
    structure.images.forEach(image => {
      manifestItems.push(
        `<item id="${image.id}" href="${image.epubPath}" media-type="${image.mimeType}"/>`
      );
    });

    // Add chapters
    structure.chapters.forEach(chapter => {
      manifestItems.push(
        `<item id="${chapter.id}" href="text/${chapter.id}.xhtml" media-type="application/xhtml+xml"/>`
      );
    });

    // Spine items (reading order)
    const spineItems = [];
    if (structure.cover) {
      spineItems.push('<itemref idref="cover"/>');
    }
    spineItems.push('<itemref idref="titlepage"/>');
    spineItems.push('<itemref idref="copyright"/>');
    structure.chapters.forEach(chapter => {
      spineItems.push(`<itemref idref="${chapter.id}"/>`);
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uuid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uuid">${uuid}</dc:identifier>
    <dc:title>${this.escapeXml(metadata.title)}</dc:title>
    <dc:creator>${this.escapeXml(metadata.author)}</dc:creator>
    <dc:language>${metadata.language}</dc:language>
    <dc:date>${metadata.date}</dc:date>
    ${metadata.publisher ? `<dc:publisher>${this.escapeXml(metadata.publisher)}</dc:publisher>` : ''}
    ${metadata.isbn ? `<dc:identifier opf:scheme="ISBN">${metadata.isbn}</dc:identifier>` : ''}
    ${metadata.description ? `<dc:description>${this.escapeXml(metadata.description)}</dc:description>` : ''}
    <meta property="dcterms:modified">${new Date().toISOString().split('.')[0]}Z</meta>
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${spineItems.join('\n    ')}
  </spine>
</package>`;
  }

  /**
   * Create nav.xhtml (EPUB3 navigation document)
   */
  private createNavXhtml(toc: TocItem[], metadata: EpubMetadata): string {
    const renderTocItem = (item: TocItem): string => {
      if (item.children && item.children.length > 0) {
        // Part with chapters
        const childItems = item.children.map(child =>
          `        <li><a href="${child.href}">${this.escapeXml(child.title)}</a></li>`
        ).join('\n');
        return `      <li>
        <span class="part-title">${this.escapeXml(item.title)}</span>
        <ol>
${childItems}
        </ol>
      </li>`;
      } else {
        // Regular chapter
        return `      <li><a href="${item.href}">${this.escapeXml(item.title)}</a></li>`;
      }
    };

    const tocItems = toc.map(renderTocItem).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
  <title>${this.escapeXml(metadata.title)}</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="styles/book.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${tocItems}
    </ol>
  </nav>
</body>
</html>`;
  }

  /**
   * Create toc.ncx (EPUB2 compatibility navigation)
   */
  private createTocNcx(toc: TocItem[], metadata: EpubMetadata): string {
    let playOrder = 0;

    const renderNavPoint = (item: TocItem): string => {
      playOrder++;
      const currentOrder = playOrder;

      if (item.children && item.children.length > 0) {
        // Part with chapters
        const childPoints = item.children.map(child => {
          playOrder++;
          return `
      <navPoint id="navPoint-${playOrder}" playOrder="${playOrder}">
        <navLabel>
          <text>${this.escapeXml(child.title)}</text>
        </navLabel>
        <content src="${child.href}"/>
      </navPoint>`;
        }).join('');

        return `
    <navPoint id="navPoint-${currentOrder}" playOrder="${currentOrder}">
      <navLabel>
        <text>${this.escapeXml(item.title)}</text>
      </navLabel>
      <content src="${item.href}"/>${childPoints}
    </navPoint>`;
      } else {
        // Regular chapter
        return `
    <navPoint id="navPoint-${currentOrder}" playOrder="${currentOrder}">
      <navLabel>
        <text>${this.escapeXml(item.title)}</text>
      </navLabel>
      <content src="${item.href}"/>
    </navPoint>`;
      }
    };

    const navPoints = toc.map(renderNavPoint).join('');
    const depth = toc.some(item => item.children && item.children.length > 0) ? '2' : '1';

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${this.generateUUID()}"/>
    <meta name="dtb:depth" content="${depth}"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${this.escapeXml(metadata.title)}</text>
  </docTitle>
  <navMap>${navPoints}
  </navMap>
</ncx>`;
  }

  /**
   * Create cover.xhtml
   */
  private createCoverXhtml(customContent?: string, coverImage?: string): string {
    let bodyContent: string;

    if (customContent) {
      // Use custom HTML content for cover
      bodyContent = `  <div class="custom-cover">
    ${this.htmlToXhtml(customContent)}
  </div>`;
    } else if (coverImage) {
      // Use cover image
      bodyContent = `  <div class="cover-image">
    <img src="../images/cover.jpg" alt="Cover"/>
  </div>`;
    } else {
      // Fallback to simple text
      bodyContent = `  <div class="cover-fallback">
    <h1>Book Cover</h1>
  </div>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Cover</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="../styles/book.css"/>
  <style>
    body { margin: 0; padding: 0; text-align: center; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .cover-image img { max-width: 100%; max-height: 100vh; }
    .custom-cover { padding: 2em; max-width: 600px; }
    .custom-cover h1 { font-size: 3em; margin-bottom: 0.5em; }
    .custom-cover h2 { font-size: 1.5em; font-weight: 400; margin: 1em 0; }
  </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
  }

  /**
   * Create title page XHTML
   */
  private createTitlePage(metadata: EpubMetadata): string {
    // Extract subtitle from description if present (common pattern)
    const subtitle = metadata.description?.split('\n')[0] || '';

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Title Page</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="../styles/book.css"/>
  <style>
    body {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      margin: 0;
      padding: 2em;
    }
    .titlepage-content {
      max-width: 600px;
    }
    .titlepage-title {
      font-size: 3em;
      font-weight: 700;
      margin: 0 0 0.5em 0;
      line-height: 1.1;
      letter-spacing: -0.03em;
    }
    .titlepage-subtitle {
      font-size: 1.5em;
      font-weight: 400;
      margin: 0 0 2em 0;
      opacity: 0.8;
      font-style: italic;
    }
    .titlepage-author {
      font-size: 1.25em;
      font-weight: 600;
      margin: 2em 0;
    }
    .titlepage-publisher {
      position: absolute;
      bottom: 3em;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 1em;
      font-weight: 500;
      opacity: 0.7;
    }
  </style>
</head>
<body>
  <div class="titlepage-content">
    <h1 class="titlepage-title">${this.escapeXml(metadata.title)}</h1>
    ${subtitle ? `<p class="titlepage-subtitle">${this.escapeXml(subtitle)}</p>` : ''}
    <p class="titlepage-author">${this.escapeXml(metadata.author)}</p>
  </div>
  ${metadata.publisher ? `<div class="titlepage-publisher">${this.escapeXml(metadata.publisher)}</div>` : ''}
</body>
</html>`;
  }

  /**
   * Create copyright page XHTML
   */
  private createCopyrightPage(metadata: EpubMetadata): string {
    const year = metadata.date ? new Date(metadata.date).getFullYear() : new Date().getFullYear();

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>Copyright</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="../styles/book.css"/>
  <style>
    body {
      padding: 3em 2em;
      font-size: 0.9em;
      line-height: 1.8;
    }
    .copyright-content {
      max-width: 500px;
      margin: 0 auto;
    }
    .copyright-content p {
      margin: 1em 0;
      text-indent: 0;
    }
    .copyright-notice {
      font-weight: 600;
      margin-top: 0;
    }
    .rights-statement {
      margin-top: 2em;
      font-size: 0.95em;
    }
    .metadata-item {
      margin: 0.5em 0;
    }
    .metadata-label {
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="copyright-content">
    <p class="copyright-notice">Copyright © ${year} ${this.escapeXml(metadata.author)}</p>

    ${metadata.publisher ? `<p class="metadata-item"><span class="metadata-label">Published by:</span> ${this.escapeXml(metadata.publisher)}</p>` : ''}

    ${metadata.isbn ? `<p class="metadata-item"><span class="metadata-label">ISBN:</span> ${metadata.isbn}</p>` : ''}

    <p class="metadata-item"><span class="metadata-label">Publication Date:</span> ${metadata.date || new Date().toISOString().split('T')[0]}</p>

    ${metadata.description && metadata.description.split('\n').length > 1 ? `<p class="metadata-item"><span class="metadata-label">Edition:</span> ${this.escapeXml(metadata.description.split('\n')[1] || 'First Edition')}</p>` : '<p class="metadata-item"><span class="metadata-label">Edition:</span> First Edition</p>'}

    <p class="rights-statement">
      All rights reserved. No part of this publication may be reproduced,
      distributed, or transmitted in any form or by any means, including
      photocopying, recording, or other electronic or mechanical methods,
      without the prior written permission of the publisher, except in the
      case of brief quotations embodied in critical reviews and certain
      other noncommercial uses permitted by copyright law.
    </p>

    ${metadata.publisher ? `<p style="margin-top: 2em; font-size: 0.9em;">${this.escapeXml(metadata.publisher)}</p>` : ''}
  </div>
</body>
</html>`;
  }

  /**
   * Create chapter XHTML
   */
  private createChapterXhtml(chapter: EpubChapter, options: EpubOptions, images: EpubImage[] = []): string {
    // Convert HTML to XHTML-compliant format
    let xhtmlContent = this.htmlToXhtml(chapter.htmlContent);

    // Update image paths to EPUB locations
    xhtmlContent = this.updateImagePaths(xhtmlContent, images);

    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${this.escapeXml(chapter.title)}</title>
  <meta charset="UTF-8"/>
  <link rel="stylesheet" type="text/css" href="../styles/highlight.min.css"/>
  <link rel="stylesheet" type="text/css" href="../styles/katex.min.css"/>
  <link rel="stylesheet" type="text/css" href="../styles/book.css"/>
</head>
<body>
  ${xhtmlContent}
</body>
</html>`;
  }

  /**
   * Generate EPUB-optimized CSS with theme support
   */
  private generateEpubCss(options: EpubOptions): string {
    const textAlign = options.textAlign === 'justify' ? 'justify' : 'left';
    const hyphens = options.hyphenation ? 'auto' : 'none';
    const theme = options.theme || 'light';

    // Theme-specific colors
    const themes = {
      light: {
        bodyBg: '#ffffff',
        bodyColor: '#2c2925',
        headingColor: '#1a1816',
        linkColor: '#0066cc',
        linkHover: '#0052a3',
        codeColor: '#d73a49',
        codeBg: '#f6f6f6',
        preBg: '#f8f8f8',
        preBorder: '#e5e5e5',
        blockquoteBorder: '#e7e5e4',
        blockquoteColor: '#59534e',
        tableBorder: '#e0e0e0',
        tableBg: '#f5f3f0',
        hrColor: '#e7e5e4'
      },
      sepia: {
        bodyBg: '#f4ecd8',
        bodyColor: '#5c4c3d',
        headingColor: '#3d2e21',
        linkColor: '#8b5a2b',
        linkHover: '#704820',
        codeColor: '#a0522d',
        codeBg: '#ede1c7',
        preBg: '#ede1c7',
        preBorder: '#d4c4a8',
        blockquoteBorder: '#c9b896',
        blockquoteColor: '#6d5d4d',
        tableBorder: '#d4c4a8',
        tableBg: '#ede1c7',
        hrColor: '#d4c4a8'
      },
      dark: {
        bodyBg: '#1a1a1a',
        bodyColor: '#e0e0e0',
        headingColor: '#ffffff',
        linkColor: '#58a6ff',
        linkHover: '#79c0ff',
        codeColor: '#f97583',
        codeBg: '#2d2d2d',
        preBg: '#0d1117',
        preBorder: '#444444',
        blockquoteBorder: '#444444',
        blockquoteColor: '#b0b0b0',
        tableBorder: '#444444',
        tableBg: '#2d2d2d',
        hrColor: '#444444'
      }
    };

    const colors = themes[theme];

    // Generate @font-face declarations if font embedding is enabled
    const fontFaces = options.fontEmbedding ? `
/* ===== EMBEDDED FONTS ===== */

/* Literata - Body Text */
@font-face {
  font-family: 'Literata';
  src: url('../fonts/literata/Literata-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Literata';
  src: url('../fonts/literata/Literata-Italic.ttf') format('truetype');
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}

@font-face {
  font-family: 'Literata';
  src: url('../fonts/literata/Literata-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Literata';
  src: url('../fonts/literata/Literata-BoldItalic.ttf') format('truetype');
  font-weight: 700;
  font-style: italic;
  font-display: swap;
}

/* Inter - Headings */
@font-face {
  font-family: 'Inter';
  src: url('../fonts/inter/Inter-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/inter/Inter-SemiBold.ttf') format('truetype');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('../fonts/inter/Inter-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Source Code Pro - Code */
@font-face {
  font-family: 'Source Code Pro';
  src: url('../fonts/source-code-pro/SourceCodePro-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
` : '/* Font embedding disabled - using system font stacks */';

    return `/* EPUB Book Styles - Professional Typography */
/* Theme: ${theme} */

${fontFaces}

/* ===== BASE STYLES ===== */
* {
  box-sizing: border-box;
}

body {
  font-family: Literata, Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif;
  font-size: 1em;
  line-height: 1.65;
  text-align: ${textAlign};
  hyphens: ${hyphens};
  -webkit-hyphens: ${hyphens};
  -moz-hyphens: ${hyphens};
  margin: 1.5em 2em;
  padding: 0;
  background-color: ${colors.bodyBg};
  color: ${colors.bodyColor};
  font-feature-settings: "kern" 1, "liga" 1, "calt" 1;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== HEADINGS ===== */
h1, h2, h3, h4, h5, h6 {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', system-ui, sans-serif;
  font-weight: 600;
  line-height: 1.25;
  page-break-after: avoid;
  page-break-inside: avoid;
  color: ${colors.headingColor};
  letter-spacing: -0.02em;
}

h1 {
  font-size: 2.25em;
  font-weight: 700;
  page-break-before: always;
  margin: 0 0 1em 0;
  text-align: center;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

h2 {
  font-size: 1.75em;
  margin-top: 2em;
  margin-bottom: 0.75em;
  font-weight: 600;
}

h3 {
  font-size: 1.375em;
  margin-top: 1.75em;
  margin-bottom: 0.5em;
}

h4 {
  font-size: 1.125em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

h5 {
  font-size: 1em;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

h6 {
  font-size: 0.875em;
  margin-top: 1.25em;
  margin-bottom: 0.5em;
  font-weight: 600;
  font-style: italic;
}

/* ===== PARAGRAPHS ===== */
p {
  margin: 0 0 1em 0;
  text-indent: 1.5em;
  orphans: 2;
  widows: 2;
}

/* First paragraph after heading - no indent */
h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p {
  text-indent: 0;
}

/* First paragraph in blockquote - no indent */
blockquote p:first-child {
  text-indent: 0;
}

/* ===== LINKS ===== */
a {
  color: ${colors.linkColor};
  text-decoration: none;
  font-weight: 500;
}

a:hover {
  color: ${colors.linkHover};
  text-decoration: underline;
}

/* ===== EMPHASIS ===== */
strong, b {
  font-weight: 700;
}

em, i {
  font-style: italic;
}

/* ===== CODE ===== */
code {
  font-family: 'Source Code Pro', 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  font-size: 0.875em;
  background-color: ${colors.codeBg};
  color: ${colors.codeColor};
  padding: 0.125em 0.375em;
  border-radius: 3px;
  font-weight: 400;
  letter-spacing: -0.01em;
}

pre {
  background-color: ${colors.preBg};
  padding: 1.25em;
  border-radius: 6px;
  border: 1px solid ${colors.preBorder};
  overflow-x: auto;
  page-break-inside: avoid;
  margin: 1.5em 0;
  line-height: 1.5;
}

pre code {
  background: none;
  color: inherit;
  padding: 0;
  font-size: 0.8125em;
  border-radius: 0;
}

/* ===== BLOCKQUOTES ===== */
blockquote {
  margin: 1.5em 2.5em;
  padding-left: 1.25em;
  border-left: 4px solid ${colors.blockquoteBorder};
  font-style: italic;
  color: ${colors.blockquoteColor};
  font-size: 0.975em;
  line-height: 1.7;
}

blockquote p {
  margin-bottom: 0.75em;
}

blockquote cite {
  display: block;
  text-align: right;
  font-style: normal;
  font-size: 0.875em;
  margin-top: 0.75em;
}

/* ===== LISTS ===== */
ul, ol {
  margin: 1em 0;
  padding-left: 2.5em;
  line-height: 1.7;
}

li {
  margin: 0.5em 0;
}

li > p {
  margin-bottom: 0.5em;
  text-indent: 0;
}

ul ul, ul ol, ol ul, ol ol {
  margin: 0.5em 0;
}

/* ===== IMAGES ===== */
img {
  max-width: 100%;
  height: auto;
  page-break-inside: avoid;
  display: block;
  margin: 1.5em auto;
  border-radius: 4px;
}

figure {
  margin: 1.5em 0;
  page-break-inside: avoid;
  text-align: center;
}

figcaption {
  font-size: 0.875em;
  font-style: italic;
  color: ${colors.blockquoteColor};
  margin-top: 0.75em;
  text-align: center;
}

/* ===== TABLES ===== */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5em 0;
  page-break-inside: avoid;
  font-size: 0.9em;
}

th, td {
  padding: 0.75em 1em;
  border: 1px solid ${colors.tableBorder};
  text-align: left;
  vertical-align: top;
}

th {
  background-color: ${colors.tableBg};
  font-weight: 600;
  font-family: Inter, -apple-system, system-ui, sans-serif;
}

thead tr {
  page-break-after: avoid;
}

/* ===== HORIZONTAL RULE ===== */
hr {
  border: none;
  border-top: 2px solid ${colors.hrColor};
  margin: 2.5em 0;
  page-break-after: avoid;
}

/* ===== DEFINITIONS ===== */
dl {
  margin: 1em 0;
}

dt {
  font-weight: 600;
  margin-top: 1em;
}

dd {
  margin-left: 2em;
  margin-bottom: 0.5em;
}

/* ===== NAVIGATION/TOC STYLES ===== */
nav#toc {
  margin: 2em 0;
}

nav#toc h1 {
  font-size: 1.75em;
  text-align: left;
  page-break-before: auto;
  margin-bottom: 1em;
}

nav#toc ol {
  list-style-type: none;
  padding-left: 0;
  line-height: 1.8;
}

nav#toc li {
  margin: 0.75em 0;
  padding-left: 1em;
  text-indent: -1em;
}

nav#toc a {
  color: ${colors.bodyColor};
  text-decoration: none;
  font-weight: 500;
}

nav#toc a:hover {
  color: ${colors.linkColor};
  text-decoration: underline;
}

/* ===== SUPERSCRIPT & SUBSCRIPT ===== */
sup, sub {
  font-size: 0.75em;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sup {
  top: -0.5em;
}

sub {
  bottom: -0.25em;
}

/* ===== SMALL CAPS ===== */
.small-caps {
  font-variant: small-caps;
  letter-spacing: 0.05em;
}

/* ===== PRINT/PAGE BREAK UTILITIES ===== */
.page-break-before {
  page-break-before: always;
}

.page-break-after {
  page-break-after: always;
}

.no-break {
  page-break-inside: avoid;
}

/* ===== ACCESSIBILITY ===== */
abbr[title] {
  text-decoration: underline dotted;
  cursor: help;
}

/* ===== CHAPTER NUMBERS ===== */
.chapter-number {
  display: block;
  font-size: 0.75em;
  font-weight: 400;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 0.5em;
  opacity: 0.7;
}

/* ===== KATEX ACCESSIBILITY ===== */
/* Hide screenreader-only content */
.katex .katex-html .sr-only {
  display: none !important;
}

/* Hide any annotation or semantics fallback */
.katex annotation,
.katex semantics > annotation {
  display: none !important;
}`;
  }

  /**
   * Generate UUID v4
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Escape XML special characters
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Convert HTML to XHTML-compliant format
   * EPUB requires valid XHTML, so all self-closing tags must be properly formatted
   */
  private htmlToXhtml(html: string): string {
    return html
      // Fix self-closing br tags
      .replace(/<br\s*>/gi, '<br />')
      .replace(/<br\s+\/>/gi, '<br />')

      // Fix self-closing hr tags
      .replace(/<hr\s*>/gi, '<hr />')
      .replace(/<hr\s+\/>/gi, '<hr />')

      // Fix img tags - make sure they're self-closing
      .replace(/<img\s+([^>]*?)\s*>/gi, '<img $1 />')
      .replace(/<img\s+([^>]*?)\s+\/>/gi, '<img $1 />')

      // Fix input tags
      .replace(/<input\s+([^>]*?)\s*>/gi, '<input $1 />')

      // Fix meta tags
      .replace(/<meta\s+([^>]*?)\s*>/gi, '<meta $1 />')

      // Fix link tags
      .replace(/<link\s+([^>]*?)\s*>/gi, '<link $1 />')

      // Fix area tags
      .replace(/<area\s+([^>]*?)\s*>/gi, '<area $1 />')

      // Fix base tags
      .replace(/<base\s+([^>]*?)\s*>/gi, '<base $1 />')

      // Fix col tags
      .replace(/<col\s+([^>]*?)\s*>/gi, '<col $1 />')

      // Fix embed tags
      .replace(/<embed\s+([^>]*?)\s*>/gi, '<embed $1 />')

      // Fix source tags
      .replace(/<source\s+([^>]*?)\s*>/gi, '<source $1 />')

      // Fix track tags
      .replace(/<track\s+([^>]*?)\s*>/gi, '<track $1 />')

      // Fix wbr tags
      .replace(/<wbr\s*>/gi, '<wbr />');
  }

  /**
   * Extract all images from chapter HTML content
   */
  private extractImages(chapters: EpubChapter[]): EpubImage[] {
    const images: EpubImage[] = [];
    const imageMap = new Map<string, number>(); // Track unique images

    chapters.forEach(chapter => {
      // Match all img tags and extract src attributes
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;

      while ((match = imgRegex.exec(chapter.htmlContent)) !== null) {
        const src = match[1];

        // Skip if already processed
        if (imageMap.has(src)) {
          continue;
        }

        const imageIndex = images.length + 1;
        imageMap.set(src, imageIndex);

        // Determine file extension and MIME type
        const { extension, mimeType } = this.getMimeTypeFromSrc(src);
        const imageId = `image-${String(imageIndex).padStart(3, '0')}`;
        const epubPath = `images/${imageId}.${extension}`;

        images.push({
          id: imageId,
          originalSrc: src,
          epubPath: epubPath,
          mimeType: mimeType
        });
      }
    });

    return images;
  }

  /**
   * Fetch images and add them to the EPUB ZIP
   */
  private async addImagesToZip(zip: JSZip, images: EpubImage[]): Promise<void> {
    const fetchPromises = images.map(async (image) => {
      try {
        if (image.originalSrc.startsWith('data:')) {
          // Handle base64 data URIs
          const base64Data = image.originalSrc.split(',')[1];
          zip.file(`OEBPS/${image.epubPath}`, base64Data, { base64: true });
          console.log(`Added base64 image: ${image.id}`);
        } else if (image.originalSrc.startsWith('http://') || image.originalSrc.startsWith('https://')) {
          // Fetch external URLs
          try {
            const blob = await firstValueFrom(
              this.http.get(image.originalSrc, { responseType: 'blob' })
            );
            zip.file(`OEBPS/${image.epubPath}`, blob);
            console.log(`Added external image: ${image.originalSrc}`);
          } catch (error) {
            console.warn(`Failed to fetch external image: ${image.originalSrc}`, error);
          }
        } else {
          // Try to fetch from assets (relative path)
          try {
            const blob = await firstValueFrom(
              this.http.get(image.originalSrc, { responseType: 'blob' })
            );
            zip.file(`OEBPS/${image.epubPath}`, blob);
            console.log(`Added local image: ${image.originalSrc}`);
          } catch (error) {
            console.warn(`Image not found: ${image.originalSrc}`);
          }
        }
      } catch (error) {
        console.error(`Error processing image ${image.originalSrc}:`, error);
      }
    });

    await Promise.all(fetchPromises);
  }

  /**
   * Update image src attributes in HTML to point to EPUB locations
   */
  private updateImagePaths(html: string, images: EpubImage[]): string {
    let updatedHtml = html;

    images.forEach(image => {
      // Escape special regex characters in the original src
      const escapedSrc = image.originalSrc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const srcRegex = new RegExp(`src=["']${escapedSrc}["']`, 'g');

      // Update to relative path from text/ directory to images/ directory
      updatedHtml = updatedHtml.replace(srcRegex, `src="../${image.epubPath}"`);
    });

    return updatedHtml;
  }

  /**
   * Determine MIME type and file extension from image src
   */
  private getMimeTypeFromSrc(src: string): { extension: string; mimeType: string } {
    // Handle data URIs
    if (src.startsWith('data:')) {
      const mimeMatch = src.match(/data:([^;]+);/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        const extension = mimeType.split('/')[1] || 'jpg';
        return { extension, mimeType };
      }
    }

    // Determine from file extension
    const urlPath = src.split('?')[0]; // Remove query params
    const ext = urlPath.split('.').pop()?.toLowerCase() || 'jpg';

    const mimeTypes: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'webp': 'image/webp',
      'bmp': 'image/bmp'
    };

    return {
      extension: ext === 'jpg' ? 'jpg' : ext,
      mimeType: mimeTypes[ext] || 'image/jpeg'
    };
  }
}
