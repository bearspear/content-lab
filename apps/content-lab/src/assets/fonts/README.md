# EPUB Fonts

This directory contains fonts used for EPUB export to ensure consistent typography across all e-readers.

## Required Fonts

The EPUB export feature uses the following open-source fonts:

### 1. Literata (Body Text)
- **Usage**: Body text, paragraphs
- **Source**: Google Fonts
- **License**: SIL Open Font License
- **Download**: https://fonts.google.com/specimen/Literata
- **Required Weights**: Regular (400), Italic (400), Bold (700), Bold Italic (700)
- **Location**: `literata/`

### 2. Inter (Headings)
- **Usage**: Headings (h1-h6)
- **Source**: Google Fonts
- **License**: SIL Open Font License
- **Download**: https://fonts.google.com/specimen/Inter
- **Required Weights**: Regular (400), Semi-Bold (600), Bold (700)
- **Location**: `inter/`

### 3. Source Code Pro (Code)
- **Usage**: Code blocks, inline code
- **Source**: Google Fonts
- **License**: SIL Open Font License
- **Download**: https://fonts.google.com/specimen/Source+Code+Pro
- **Required Weights**: Regular (400)
- **Location**: `source-code-pro/`

## Installation Instructions

1. Visit each Google Fonts link above
2. Select the required weights
3. Download the font files
4. Extract and place the `.ttf` or `.woff2` files in the corresponding subdirectories
5. Font files will be automatically embedded in EPUB exports

## File Naming Convention

Please use the following naming convention for consistency:

```
literata/
  Literata-Regular.ttf
  Literata-Italic.ttf
  Literata-Bold.ttf
  Literata-BoldItalic.ttf

inter/
  Inter-Regular.ttf
  Inter-SemiBold.ttf
  Inter-Bold.ttf

source-code-pro/
  SourceCodePro-Regular.ttf
```

## Optional

If fonts are not present, the EPUB will fall back to system fonts defined in the CSS font stacks.
