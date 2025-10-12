const fs = require('fs');

// Read the file
const filePath = './src/app/core/services/theme.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Find the line where we need to add getPubcssThemeStyles
const searchPattern = /private getMinimalThemeStyles\(\): string \{\n[\s\S]*?    `;\n  \}/;
const match = content.match(searchPattern);

if (match) {
  const insertAfter = match[0];

  // Extract inline PUBCSS CSS and create method
  const pubcssMatch = content.match(/\/\* ===== PUBCSS THEME[\s\S]*?margin: 2em 0;\n      \}/);

  if (pubcssMatch) {
    const pubcssStyles = pubcssMatch[0];

    // Create the new method
    const pubcssMethod = `
  /**
   * Pubcss theme styles
   */
  private getPubcssThemeStyles(): string {
    return \`
      ${pubcssStyles}
    \`;
  }`;

    // Insert the method after getMinimalThemeStyles
    content = content.replace(insertAfter, insertAfter + pubcssMethod);

    // Remove the inline CSS
    content = content.replace(pubcssMatch[0] + '\n\n', '');
  }
}

// Write back
fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactoring step 1 complete: Extracted PUBCSS theme');
