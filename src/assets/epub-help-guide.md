# EPUB Publishing Guide

This guide will help you convert your markdown files into professional EPUB e-books.

## Quick Start

1. **Write or load your markdown content** in the editor
2. **Add metadata** (optional but recommended) to the beginning of your file
3. **Click "Publish EPUB"** and configure your options
4. **Download** your e-book and open it in any e-reader

---

## Markdown Metadata (YAML Front Matter)

Add metadata at the very beginning of your markdown file between `---` markers:

```yaml
---
title: "My Book Title"
author: "Your Name"
publisher: "Publisher Name"
isbn: "978-1234567890"
language: "en"
date: "2025-01-15"
description: "Optional subtitle\nFirst Edition"
cover: "data:image/jpeg;base64,..."
---
```

### Metadata Fields

| Field | Required | Description |
|-------|----------|-------------|
| `title` | No | Book title (defaults to "Untitled Book") |
| `author` | No | Author name (defaults to "Unknown Author") |
| `publisher` | No | Publisher name |
| `isbn` | No | ISBN number |
| `language` | No | Language code (defaults to "en") |
| `date` | No | Publication date (defaults to today) |
| `description` | No | First line becomes subtitle, second line becomes edition |
| `cover` | No | Cover image (data URI or URL) |

---

## Chapter Structure

EPUB books are automatically split into chapters based on **H1 headings** (`#`).

### Example:

```markdown
# Chapter 1: The Beginning

This is the first chapter content...

# Chapter 2: The Journey

This is the second chapter content...
```

Each H1 creates a new chapter in your EPUB file.

---

## Special EPUB Markers

Use HTML comments to add special EPUB features:

### 1. Page Breaks

Insert a page break before any content:

```markdown
<!-- EPUB:PAGEBREAK -->

Content starts on a new page...
```

### 2. Book Parts (Sections)

Organize chapters into parts (like "Part I: Introduction", "Part II: Advanced Topics"):

```markdown
<!-- EPUB:PART title="Part I: Foundations" -->

# Chapter 1: Basics

Content...

# Chapter 2: Fundamentals

Content...

<!-- EPUB:PART title="Part II: Advanced Topics" -->

# Chapter 3: Expert Level

Content...
```

**Parts create hierarchical table of contents** with chapters nested under their parts.

### 3. Custom Cover Page

Create a custom cover page with markdown content:

```markdown
<!-- EPUB:COVER -->

# My Amazing Book

## A Journey Through Code

*By John Doe*

Published by Tech Press

<!-- /EPUB:COVER -->
```

The custom cover will be beautifully formatted and appear as the first page of your book.

---

## Images

Include images using standard markdown syntax:

### External Images

```markdown
![Alt text](https://example.com/image.jpg)
```

External images are **automatically downloaded** and embedded in the EPUB.

### Base64 Images

```markdown
![Alt text](data:image/png;base64,iVBORw0KG...)
```

Base64 images are embedded directly.

### Image Tips

- Images are **automatically deduplicated** (same image used multiple times = included once)
- Supported formats: JPG, PNG, GIF, SVG, WebP, BMP
- Images are optimized for e-readers

---

## Math Equations

Write LaTeX math equations that render beautifully in EPUBs.

### Inline Math

Use single dollar signs for inline equations:

```markdown
The famous equation $E = mc^2$ was discovered by Einstein.
```

### Block Math

Use double dollar signs or code blocks for display equations:

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

Or with math code blocks:

````markdown
```math
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```
````

**Math requires KaTeX CSS** which is automatically included in EPUB exports.

---

## Code Blocks

Include syntax-highlighted code in your e-book:

````markdown
```typescript
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
```
````

### Supported Languages

The EPUB generator supports syntax highlighting for:
- JavaScript, TypeScript, Python, Java, C, C++, C#
- Go, Rust, Ruby, PHP, Swift, Kotlin
- HTML, CSS, SQL, Bash, JSON, YAML
- And many more via Highlight.js

**Syntax highlighting CSS** is automatically included based on your theme selection.

---

## Tables

Create tables using markdown syntax:

```markdown
| Feature | Supported | Notes |
|---------|-----------|-------|
| Headers | ✓ | H1-H6 |
| Lists | ✓ | Ordered & Unordered |
| Code | ✓ | Inline and blocks |
| Math | ✓ | KaTeX rendering |
```

Tables are **page-break aware** and won't split awkwardly across pages.

---

## Footnotes

Add academic-style footnotes to your text:

```markdown
Here's a sentence with a footnote[^1].

Another sentence with a footnote[^2].

[^1]: This is the first footnote content.
[^2]: This is the second footnote content.
```

Footnotes are automatically collected and displayed at the end of each chapter.

---

## EPUB Publishing Options

When you click "Publish EPUB", configure these options:

### Book Settings

**Include cover page** (✓ Recommended)
- Generates cover from YAML metadata or `EPUB:COVER` marker
- Creates professional title page and copyright page

**Include table of contents** (✓ Recommended)
- Generates interactive TOC from chapter headings
- Supports hierarchical structure with parts

**TOC Depth**
- Level 1: H1 only
- Level 2: H1 and H2 (recommended)
- Level 3: H1, H2, and H3

### Typography

**Embed custom fonts** (✓ Recommended)
- Embeds Literata (body text), Inter (headings), Source Code Pro (code)
- Ensures consistent typography across all e-readers
- Larger file size but better reading experience

**Text Alignment**
- Left aligned: Traditional web/screen reading
- Justified: Traditional book reading (recommended for novels)

**Enable hyphenation** (✓ Recommended)
- Automatic word hyphenation for better text flow
- Reduces ragged edges in justified text

### Appearance

**Color Theme**
- **Light**: White background, black text (most common)
- **Sepia**: Warm tones, easier on eyes
- **Dark**: Black background, light text

Theme affects:
- Background and text colors
- Syntax highlighting colors (light/dark code theme)
- Link colors
- Border and accent colors

---

## Best Practices

### Structure Your Content

✓ **Start with metadata** for professional results

✓ **Use H1 for chapters** - don't skip heading levels

✓ **Organize with parts** for long books (10+ chapters)

✓ **Add page breaks** before important sections

### Optimize Images

✓ **Use appropriate sizes** - e-readers typically display ~600px wide

✓ **Compress images** before including them

✓ **Provide alt text** for accessibility

### Format Text

✓ **Use proper markdown** - don't rely on manual spacing

✓ **Keep paragraphs short** for better e-reader display

✓ **Use lists** instead of long paragraphs when appropriate

### Code & Math

✓ **Test equations** in the preview before exporting

✓ **Use appropriate code block languages** for proper highlighting

✓ **Keep code lines short** (< 80 characters) to avoid horizontal scrolling

---

## Example Complete Markdown File

Here's a complete example showing all features:

```markdown
---
title: "The Complete Guide to TypeScript"
author: "Jane Developer"
publisher: "Tech Books Publishing"
isbn: "978-1234567890"
language: "en"
date: "2025-01-15"
description: "From Beginner to Expert\nSecond Edition"
---

<!-- EPUB:COVER -->

# The Complete Guide to TypeScript

## From Beginner to Expert

*By Jane Developer*

**Second Edition**

Tech Books Publishing • 2025

<!-- /EPUB:COVER -->

<!-- EPUB:PART title="Part I: Foundations" -->

# Chapter 1: Getting Started

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.

## Why TypeScript?

TypeScript adds optional types to JavaScript. Here's a simple example:

\`\`\`typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}
\`\`\`

<!-- EPUB:PAGEBREAK -->

# Chapter 2: Type System

TypeScript's type system is powerful and flexible...

<!-- EPUB:PART title="Part II: Advanced Topics" -->

# Chapter 3: Generics

Generics provide a way to create reusable components...

## Generic Functions

The identity function is a classic example[^1]:

\`\`\`typescript
function identity<T>(arg: T): T {
  return arg;
}
\`\`\`

[^1]: The identity function returns its input unchanged.
```

---

## Troubleshooting

### EPUB Won't Open

**Problem**: E-reader says "Invalid EPUB"

**Solutions**:
- Check that all H1 headings are properly formatted
- Ensure YAML metadata is between `---` markers
- Verify image URLs are accessible
- Remove any unsupported HTML tags

### Images Not Showing

**Problem**: Images don't appear in the EPUB

**Solutions**:
- Check image URLs are accessible
- For external images, ensure they're publicly available
- Use supported image formats (JPG, PNG, GIF, SVG)
- Verify base64 data URIs are complete

### Math Not Rendering

**Problem**: Math equations show as garbled text

**Solutions**:
- This shouldn't happen - KaTeX CSS is auto-included
- Try using `$$...$$` for block math instead of code blocks
- Ensure you're using valid LaTeX syntax

### TOC Not Showing Chapters

**Problem**: Table of contents is empty or incomplete

**Solutions**:
- Ensure you're using H1 (`#`) for chapters, not H2 or H3
- Check "Include table of contents" is enabled
- Verify chapters have unique titles

---

## Testing Your EPUB

### E-Reader Applications

Test your EPUB in these applications:

**Desktop:**
- Calibre (Windows, Mac, Linux) - Free
- Adobe Digital Editions (Windows, Mac) - Free
- Apple Books (Mac) - Built-in

**Mobile:**
- Apple Books (iOS) - Built-in
- Google Play Books (Android, iOS) - Free
- PocketBook Reader (Android, iOS) - Free

**Web:**
- Calibre Web (self-hosted)
- EPUBReader browser extension

### What to Check

✓ **Cover displays correctly**

✓ **Title page and copyright page** have correct information

✓ **Table of contents** is complete and links work

✓ **All chapters** are present and in order

✓ **Images display** and are properly sized

✓ **Math equations** render correctly

✓ **Code blocks** have syntax highlighting

✓ **Fonts** look good (if embedded)

✓ **Theme colors** work in different reader modes

---

## Advanced Tips

### Custom Styling

EPUB exports include professional CSS, but you can customize appearance by using standard markdown classes in your source.

### Multiple Languages

For multilingual books, set the `language` field in YAML metadata:

```yaml
---
language: "es"  # Spanish
---
```

This affects hyphenation and text direction.

### Series Information

Include series information in the description:

```yaml
---
description: "Book 3 in the Epic Fantasy Series"
---
```

### Edition Information

Specify edition on the second line of description:

```yaml
---
description: "A comprehensive guide\nRevised Third Edition"
---
```

---

## EPUB Specifications

Your EPUBs are generated according to **EPUB 3.0 specification**:

- Valid XHTML5 content
- UTF-8 encoding throughout
- Navigation document (EPUB3) and NCX (EPUB2 compatibility)
- Proper manifest and spine ordering
- Metadata according to Dublin Core

### File Structure

Generated EPUBs contain:

```
book.epub
├── mimetype
├── META-INF/
│   └── container.xml
└── OEBPS/
    ├── content.opf          # Manifest & metadata
    ├── nav.xhtml            # EPUB3 navigation
    ├── toc.ncx              # EPUB2 navigation
    ├── styles/
    │   ├── book.css         # Typography & layout
    │   ├── katex.min.css    # Math rendering
    │   └── highlight.min.css # Syntax highlighting
    ├── fonts/               # Embedded fonts (if enabled)
    ├── images/              # Embedded images
    └── text/
        ├── cover.xhtml      # Cover page
        ├── titlepage.xhtml  # Title page
        ├── copyright.xhtml  # Copyright page
        ├── chapter-001.xhtml
        ├── chapter-002.xhtml
        └── ...
```

---

## Support & Resources

### Online Resources

- **EPUB Specification**: [IDPF EPUB 3.0](https://www.w3.org/publishing/epub3/)
- **Markdown Guide**: [markdownguide.org](https://www.markdownguide.org)
- **KaTeX Documentation**: [katex.org](https://katex.org)

### Getting Help

If you encounter issues:

1. Check this help guide for common solutions
2. Verify your markdown syntax in the preview
3. Test with a simple example first
4. Check that your images and external resources are accessible

---

## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save content (localStorage)
- **Ctrl/Cmd + K**: Toggle Write/Preview modes
- **Escape**: Close any open modal

---

**Happy Publishing!** 📚

Your markdown files are now ready to become beautiful EPUB e-books that work on any e-reader device.
