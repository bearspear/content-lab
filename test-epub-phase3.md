---
title: "Advanced EPUB Features Test"
author: "Content Lab Team"
publisher: "Content Lab Publishing"
language: en
description: "A comprehensive test document demonstrating all Phase 3 EPUB features including images, special markers, parts, and custom covers"
date: "2025-01-15"
---

<!-- EPUB:COVER -->
# Advanced EPUB Features Test

## A Comprehensive Guide

**By Content Lab Team**

*Published by Content Lab Publishing*

---

This test document demonstrates all Phase 3 features:
- Custom cover pages
- Book parts and sections
- Page break controls
- Embedded images
- Mathematical equations
- Professional typography

**2025 Edition**
<!-- /EPUB:COVER -->

<!-- EPUB:PART title="Part I: Basic Features" -->

# Chapter 1: Introduction to EPUB

Welcome to this comprehensive test of EPUB Phase 3 features! This document demonstrates all the advanced capabilities we've implemented, including image embedding, special markers, and sophisticated document structure.

## 1.1 About This Test

This test file is designed to validate:

1. **Image Embedding** - Including external and base64 images
2. **Special Markers** - PAGEBREAK, PART, and COVER markers
3. **Mathematical Content** - KaTeX rendering in EPUB
4. **Rich Formatting** - Tables, code blocks, lists, and more

## 1.2 Document Structure

The document is organized into multiple parts, each containing several chapters. This tests the hierarchical navigation system.

<!-- EPUB:PAGEBREAK -->

# Chapter 2: Working with Images

Images are a crucial part of any modern document. Let's test image embedding with various sources.

## 2.1 External Images

Here's an example image from an external URL:

![Placeholder Image](https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Test+Image+1)

## 2.2 Multiple Images

Let's include several images to test the deduplication and embedding system:

![Sample Chart](https://via.placeholder.com/500x300/E94B3C/FFFFFF?text=Chart+Example)

![Diagram](https://via.placeholder.com/400x400/50C878/FFFFFF?text=Diagram)

## 2.3 Images with Captions

Images should display properly with surrounding text and context:

The following image demonstrates our image embedding system:

![Test Pattern](https://via.placeholder.com/700x200/9B59B6/FFFFFF?text=Wide+Test+Pattern)

This image shows a wide test pattern that should scale appropriately in different EPUB readers.

<!-- EPUB:PAGEBREAK -->

# Chapter 3: Mathematical Content

Mathematics should render beautifully in EPUB format using KaTeX.

## 3.1 Inline Mathematics

The famous equation $E = mc^2$ demonstrates Einstein's mass-energy equivalence. Other examples include the Pythagorean theorem $a^2 + b^2 = c^2$ and Euler's identity $e^{i\pi} + 1 = 0$.

## 3.2 Display Mathematics

Here's the quadratic formula:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

And the integral of a Gaussian function:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## 3.3 Complex Equations

Maxwell's equations in differential form:

$$
\begin{aligned}
\nabla \cdot \mathbf{E} &= \frac{\rho}{\epsilon_0} \\
\nabla \cdot \mathbf{B} &= 0 \\
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{B} &= \mu_0\mathbf{J} + \mu_0\epsilon_0\frac{\partial \mathbf{E}}{\partial t}
\end{aligned}
$$

<!-- EPUB:PART title="Part II: Advanced Formatting" -->

# Chapter 4: Tables and Lists

This chapter demonstrates various formatting options for structured data.

## 4.1 Complex Tables

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Image Embedding | ✅ Complete | High | Supports external URLs and base64 |
| EPUB:PAGEBREAK | ✅ Complete | Medium | Forces page breaks |
| EPUB:PART | ✅ Complete | High | Creates book sections |
| EPUB:COVER | ✅ Complete | High | Custom cover pages |
| Math Rendering | ✅ Complete | High | KaTeX with HTML output |
| Theme Support | ✅ Complete | Medium | Light, sepia, and dark themes |

## 4.2 Nested Lists

Here's a detailed breakdown of features:

1. **Phase 1: Core Structure**
   - EPUB3 file generation
   - Chapter splitting
   - Metadata parsing
   - Basic styling

2. **Phase 2: Enhanced Typography**
   - Font embedding
     - Literata for body text
     - Inter for headings
     - Source Code Pro for code
   - Theme support
   - Professional CSS

3. **Phase 3: Advanced Features** (Current)
   - Image embedding
   - Special markers
     - PAGEBREAK for pagination control
     - PART for book sections
     - COVER for custom covers
   - Enhanced navigation

## 4.3 Definition Lists

**EPUB (Electronic Publication)**
: A free and open e-book standard by the International Digital Publishing Forum (IDPF)

**KaTeX**
: A fast, easy-to-use JavaScript library for TeX math rendering on the web

**XHTML**
: Extensible HyperText Markup Language, required for EPUB content files

<!-- EPUB:PAGEBREAK -->

# Chapter 5: Code Examples

Testing code blocks with syntax highlighting across multiple languages.

## 5.1 TypeScript

```typescript
interface EpubStructure {
  metadata: EpubMetadata;
  cover?: string;
  coverContent?: string;
  chapters: EpubChapter[];
  parts: EpubPart[];
  toc: TocItem[];
  images: EpubImage[];
}

async function generateEpub(structure: EpubStructure): Promise<void> {
  const zip = new JSZip();
  // Add mimetype
  zip.file('mimetype', 'application/epub+zip', {
    compression: 'STORE'
  });

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'book.epub');
}
```

## 5.2 Python

```python
def fibonacci(n):
    """Generate Fibonacci sequence up to n terms."""
    a, b = 0, 1
    result = []

    for _ in range(n):
        result.append(a)
        a, b = b, a + b

    return result

# Test the function
print(fibonacci(10))
# Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

## 5.3 Shell Script

```bash
#!/bin/bash

# EPUB validation script
validate_epub() {
    local epub_file="$1"

    if [ ! -f "$epub_file" ]; then
        echo "Error: File not found"
        return 1
    fi

    echo "Validating $epub_file..."
    epubcheck "$epub_file"

    if [ $? -eq 0 ]; then
        echo "✓ EPUB is valid"
    else
        echo "✗ EPUB validation failed"
    fi
}

validate_epub "book.epub"
```

<!-- EPUB:PART title="Part III: Special Elements" -->

# Chapter 6: Blockquotes and Citations

This chapter tests blockquotes and various text formatting options.

## 6.1 Simple Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

## 6.2 Complex Blockquotes

> EPUB 3 is the most recent version of the EPUB standard, the digital book format
> developed by the International Digital Publishing Forum (IDPF). It offers improved
> support for accessibility, multimedia, and complex layouts.
>
> The format is widely adopted by publishers and supported by most e-readers, making
> it the de facto standard for digital publications.

## 6.3 Nested Quotes

> "I have always imagined that Paradise will be a kind of library."
>
> > "A library is not a luxury but one of the necessities of life."
> > — Henry Ward Beecher
>
> — Jorge Luis Borges

<!-- EPUB:PAGEBREAK -->

# Chapter 7: Links and References

Testing link handling and cross-references within the document.

## 7.1 External Links

Visit the [Content Lab GitHub Repository](https://github.com/mbehringer/content-lab) for the source code.

Additional resources:
- [EPUB 3 Specification](https://www.w3.org/TR/epub-33/)
- [KaTeX Documentation](https://katex.org/docs/)
- [Markdown Guide](https://www.markdownguide.org/)

## 7.2 Inline Code and Emphasis

Use the `convertToHtml()` method to **convert** markdown to HTML. The *MarkdownService* handles all conversions automatically.

Key features include:
- **Bold text** for emphasis
- *Italic text* for titles and subtle emphasis
- `Inline code` for technical references
- ~~Strikethrough~~ for deprecated content

## 7.3 Horizontal Rules

Section breaks are useful for separating content:

---

This is a new section after a horizontal rule.

---

And another section.

<!-- EPUB:PAGEBREAK -->

# Chapter 8: Conclusion and Testing Notes

This final chapter summarizes the test coverage and provides notes for validation.

## 8.1 Feature Summary

All Phase 3 features have been demonstrated in this test document:

✅ **Image Embedding**
- External URL images (via.placeholder.com)
- Multiple images across chapters
- Automatic deduplication
- Proper path resolution in EPUB

✅ **EPUB:PAGEBREAK Marker**
- Forced page breaks between major sections
- CSS-based implementation
- Compatible with all EPUB readers

✅ **EPUB:PART Marker**
- Three-part structure demonstrated
- Hierarchical TOC generation
- Proper navigation integration

✅ **EPUB:COVER Marker**
- Custom cover page with formatted content
- Professional typography
- Centered layout

✅ **Mathematical Rendering**
- Inline and display mathematics
- KaTeX HTML-only output
- No duplicate rendering

✅ **Rich Formatting**
- Tables with multiple columns
- Nested lists (ordered and unordered)
- Code blocks with syntax highlighting
- Blockquotes and citations
- Links (external and inline)

## 8.2 Validation Checklist

When testing this EPUB, verify:

- [ ] Cover page displays correctly
- [ ] TOC shows three parts with chapters
- [ ] All images load properly
- [ ] Math equations render without duplication
- [ ] Page breaks occur at marked locations
- [ ] Code blocks have proper formatting
- [ ] Tables display correctly
- [ ] Links are functional (where supported)
- [ ] Typography is professional and readable
- [ ] No XHTML validation errors

## 8.3 Reader Compatibility

This EPUB should be tested on:

**Desktop:**
- Calibre (Windows/Mac/Linux)
- Adobe Digital Editions
- Apple Books (Mac)

**Mobile:**
- Apple Books (iOS)
- Google Play Books (Android)
- Moon+ Reader (Android)

**E-Readers:**
- Kindle (via Send to Kindle or Kindle Previewer)
- Kobo
- Barnes & Noble Nook

## 8.4 Final Notes

This test document demonstrates that all Phase 3 advanced features are fully functional. The EPUB export system now supports:

- Complete image embedding pipeline
- Three special markers for document structure
- Professional multi-part book layouts
- Custom cover page generation
- Robust math rendering

The system is ready for Phase 4: UI integration and user-facing controls.

---

**Test Document Version:** 1.0
**Date:** January 15, 2025
**Status:** Phase 3 Complete ✅
