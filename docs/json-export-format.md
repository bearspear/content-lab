# JSON Export Format Documentation

## Overview

The Markdown to HTML Converter provides a structured JSON export that converts HTML content into a machine-readable, hierarchical format. This document describes the structure and all supported content types.

## Root Structure

The JSON export follows a consistent root structure:

```json
{
  "meta": {
    "generatedAt": "2025-10-10T20:35:00.000Z",
    "theme": "claude",
    "converter": "Markdown to HTML Converter"
  },
  "title": "Document Title",
  "content": [
    // Array of content objects
  ]
}
```

### Root Fields

- **meta** (object): Metadata about the document
  - **generatedAt** (string): ISO 8601 timestamp of when the JSON was generated
  - **theme** (string): The theme applied to the document (e.g., "claude", "github", "dark", "academic", "pubcss", "minimal")
  - **converter** (string): The name of the converter tool

- **title** (string): The document title, extracted from the first H1 heading, or "Untitled" if no H1 is present

- **content** (array): Array of content objects representing the document structure

## Content Types

All content objects have a `type` field that indicates the kind of content. Content types support nesting and recursion where appropriate.

### Heading

Represents headings (H1-H6).

```json
{
  "type": "heading",
  "level": 1,
  "content": "Heading Text"
}
```

**Fields:**
- `type`: Always "heading"
- `level`: Integer from 1-6 indicating heading level
- `content`: The heading text

**Example:**
```json
{
  "type": "heading",
  "level": 2,
  "content": "Introduction"
}
```

---

### Paragraph

Represents a paragraph containing inline content.

```json
{
  "type": "paragraph",
  "content": [
    { "type": "text", "content": "This is " },
    { "type": "bold", "content": "bold text" },
    { "type": "text", "content": " and " },
    { "type": "italic", "content": "italic text" }
  ]
}
```

**Fields:**
- `type`: Always "paragraph"
- `content`: Array of inline content objects (see Inline Content Types)

---

### Code Block

Represents a code block with optional syntax highlighting.

```json
{
  "type": "code",
  "language": "typescript",
  "content": "function hello() {\n  console.log('Hello, world!');\n}"
}
```

**Fields:**
- `type`: Always "code"
- `language`: Programming language identifier (empty string if not specified)
- `content`: The raw code content

---

### List

Represents ordered or unordered lists, with support for nested lists.

```json
{
  "type": "list",
  "ordered": false,
  "items": [
    {
      "type": "listItem",
      "content": [
        { "type": "text", "content": "First item" }
      ]
    },
    {
      "type": "listItem",
      "content": [
        { "type": "text", "content": "Item with nested list" }
      ],
      "nested": {
        "type": "list",
        "ordered": true,
        "items": [
          {
            "type": "listItem",
            "content": [
              { "type": "text", "content": "Nested item 1" }
            ]
          }
        ]
      }
    }
  ]
}
```

**Fields:**
- `type`: Always "list"
- `ordered`: Boolean indicating if it's an ordered (numbered) list
- `items`: Array of list item objects

**List Item Fields:**
- `type`: Always "listItem"
- `content`: Array of inline content
- `nested` (optional): A nested list object

---

### Blockquote

Represents a blockquote that can contain any block-level content.

```json
{
  "type": "blockquote",
  "content": [
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "content": "This is a quote" }
      ]
    }
  ]
}
```

**Fields:**
- `type`: Always "blockquote"
- `content`: Array of block-level content objects (recursive)

---

### Table

Represents a table with rows and cells.

```json
{
  "type": "table",
  "rows": [
    {
      "type": "row",
      "cells": [
        { "type": "header", "content": "Column 1" },
        { "type": "header", "content": "Column 2" }
      ]
    },
    {
      "type": "row",
      "cells": [
        { "type": "cell", "content": "Data 1" },
        { "type": "cell", "content": "Data 2" }
      ]
    }
  ]
}
```

**Fields:**
- `type`: Always "table"
- `rows`: Array of row objects

**Row Fields:**
- `type`: Always "row"
- `cells`: Array of cell objects

**Cell Fields:**
- `type`: "header" or "cell"
- `content`: Text content of the cell

---

### Math Block

Represents mathematical equations in LaTeX format.

```json
{
  "type": "math",
  "displayMode": true,
  "content": "E = mc^2"
}
```

**Fields:**
- `type`: Always "math"
- `displayMode`: Boolean indicating if it's a display (block) equation
- `content`: LaTeX mathematical expression

---

### Divider

Represents a horizontal rule/divider.

```json
{
  "type": "divider"
}
```

**Fields:**
- `type`: Always "divider"

---

### Footnotes

Represents a footnotes section.

```json
{
  "type": "footnotes",
  "content": [
    // Array of footnote elements
  ]
}
```

**Fields:**
- `type`: Always "footnotes"
- `content`: Array of elements within the footnotes section

---

### Container

A generic container for grouped content.

```json
{
  "type": "container",
  "content": [
    // Array of nested content
  ]
}
```

**Fields:**
- `type`: Always "container"
- `content`: Array of nested content objects

---

## Inline Content Types

These types appear within paragraph content arrays or list items.

### Text

Plain text content.

```json
{
  "type": "text",
  "content": "Plain text"
}
```

---

### Bold

Bold/strong text.

```json
{
  "type": "bold",
  "content": "Bold text"
}
```

---

### Italic

Italic/emphasized text.

```json
{
  "type": "italic",
  "content": "Italic text"
}
```

---

### Inline Code

Inline code snippets.

```json
{
  "type": "inlineCode",
  "content": "console.log()"
}
```

---

### Link

Hyperlinks.

```json
{
  "type": "link",
  "url": "https://example.com",
  "text": "Example Link"
}
```

**Fields:**
- `url`: The link destination
- `text`: The link text

---

### Image

Images.

```json
{
  "type": "image",
  "src": "https://example.com/image.png",
  "alt": "Image description"
}
```

**Fields:**
- `src`: Image source URL
- `alt`: Alternative text

---

### Footnote Reference

Reference to a footnote.

```json
{
  "type": "footnoteRef",
  "id": "fn-1",
  "text": "[1]"
}
```

**Fields:**
- `id`: Footnote identifier
- `text`: Display text

---

## Complete Example

Here's a complete example showing various content types:

```json
{
  "meta": {
    "generatedAt": "2025-10-10T20:35:00.000Z",
    "theme": "claude",
    "converter": "Markdown to HTML Converter"
  },
  "title": "Sample Document",
  "content": [
    {
      "type": "heading",
      "level": 1,
      "content": "Sample Document"
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "content": "This is a " },
        { "type": "bold", "content": "sample document" },
        { "type": "text", "content": " with various " },
        { "type": "italic", "content": "content types" },
        { "type": "text", "content": "." }
      ]
    },
    {
      "type": "heading",
      "level": 2,
      "content": "Code Example"
    },
    {
      "type": "code",
      "language": "javascript",
      "content": "function greet(name) {\n  return `Hello, ${name}!`;\n}"
    },
    {
      "type": "heading",
      "level": 2,
      "content": "List Example"
    },
    {
      "type": "list",
      "ordered": false,
      "items": [
        {
          "type": "listItem",
          "content": [
            { "type": "text", "content": "First item" }
          ]
        },
        {
          "type": "listItem",
          "content": [
            { "type": "text", "content": "Second item" }
          ]
        }
      ]
    },
    {
      "type": "table",
      "rows": [
        {
          "type": "row",
          "cells": [
            { "type": "header", "content": "Name" },
            { "type": "header", "content": "Value" }
          ]
        },
        {
          "type": "row",
          "cells": [
            { "type": "cell", "content": "Example" },
            { "type": "cell", "content": "123" }
          ]
        }
      ]
    },
    {
      "type": "divider"
    },
    {
      "type": "blockquote",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "content": "This is a quoted paragraph." }
          ]
        }
      ]
    }
  ]
}
```

---

## Usage

The JSON export is available from the download dropdown in the Markdown to HTML Converter interface. Click "Download JSON" to export the current document in this format.

This structured format is ideal for:
- Programmatic content processing
- Content migration between systems
- Building custom renderers
- Content analysis and indexing
- API integration
- Machine learning training data

---

## Version History

- **v1.0** (2025-10-10): Initial JSON export format specification
