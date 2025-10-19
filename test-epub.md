---
title: "A Sample Book"
author: "Content Lab"
language: en
description: "A simple test book for EPUB export"
date: "2025-10-13"
---

# Chapter 1: Introduction

This is the first chapter of our test book. It contains some **bold text**, _italic text_, and `inline code`.

## Section 1.1

Here's a list of features:

- Markdown to EPUB conversion
- YAML front matter support
- Chapter splitting by H1 headings
- Table of contents generation
- Professional styling

## Section 1.2

Here's a code block:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

# Chapter 2: Advanced Features

This is the second chapter, demonstrating more advanced Markdown features.

## Section 2.1: Tables

| Feature | Status | Priority |
|---------|--------|----------|
| EPUB Export | ✅ Done | High |
| PDF Export | ✅ Done | High |
| HTML Export | ✅ Done | High |

## Section 2.2: Blockquotes

> This is a blockquote demonstrating how quoted text appears in the EPUB export.
> It can span multiple lines and maintain proper formatting.

## Section 2.3: Links

Check out the [Content Lab](https://github.com/mbehringer/content-lab) repository for more information.

# Chapter 3: Mathematical Expressions

This chapter demonstrates mathematical expressions using KaTeX.

Inline math: $E = mc^2$

Block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Section 3.1: More Equations

The quadratic formula:

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

# Chapter 4: Conclusion

This concludes our test book. The EPUB export feature has been successfully implemented with:

1. **YAML front matter parsing** - Extracting metadata from the markdown file
2. **Chapter splitting** - Automatically dividing content by H1 headings
3. **EPUB structure generation** - Creating all required EPUB files
4. **JSZip packaging** - Assembling the final .epub file

Thank you for using Content Lab!
