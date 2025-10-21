import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StateManagerService } from '@content-lab/core';
import { StatefulComponent } from '@content-lab/core';
import { ResetButtonComponent } from '@content-lab/ui-components'  // NOTE: update to specific componentreset-button/reset-button.component';

interface RegexMatch {
  fullMatch: string;
  index: number;
  groups: string[];
  namedGroups?: { [key: string]: string };
}

interface RegexTesterState {
  pattern: string;
  testString: string;
  flags: {
    global: boolean;
    caseInsensitive: boolean;
    multiline: boolean;
    dotAll: boolean;
    unicode: boolean;
    sticky: boolean;
  };
  activeMode: 'test' | 'replace' | 'explain' | 'library';
  replacement: string;
}

@Component({
  selector: 'app-regex-tester',
  standalone: true,
  imports: [CommonModule, FormsModule, ResetButtonComponent],
  templateUrl: './regex-tester.component.html',
  styleUrl: './regex-tester.component.scss',
  styles: [`
    :host {
      display: flex;
      flex: 1;
      width: 100%;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
  `]
})
export class RegexTesterComponent extends StatefulComponent<RegexTesterState> implements AfterViewInit {
  protected readonly TOOL_ID = 'regex-tester';

  // Pattern and test strings
  pattern = '';
  testString = '';
  replacement = '';

  // Flags
  flags = {
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false
  };

  // UI State
  activeMode: 'test' | 'replace' | 'explain' | 'library' = 'test';

  // Results
  matches: RegexMatch[] = [];
  replacedString = '';
  error: string | null = null;
  isValid = false;

  // Pattern library
  commonPatterns = [
    {
      category: 'Email & Web',
      patterns: [
        { name: 'Email Address', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: 'Basic email validation' },
        { name: 'URL', pattern: 'https?://[^\\s/$.?#].[^\\s]*', description: 'Match HTTP/HTTPS URLs' },
        { name: 'Domain', pattern: '([a-z0-9-]+\\.)+[a-z]{2,}', description: 'Domain names' },
        { name: 'IPv4 Address', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b', description: 'IPv4 address' }
      ]
    },
    {
      category: 'Numbers',
      patterns: [
        { name: 'Integer', pattern: '-?\\d+', description: 'Positive or negative integers' },
        { name: 'Decimal', pattern: '-?\\d+\\.\\d+', description: 'Decimal numbers' },
        { name: 'Currency', pattern: '\\$?\\d+(?:,\\d{3})*(?:\\.\\d{2})?', description: 'Currency format' },
        { name: 'Percentage', pattern: '\\d+(?:\\.\\d+)?%', description: 'Percentage values' }
      ]
    },
    {
      category: 'Dates & Time',
      patterns: [
        { name: 'Date (MM/DD/YYYY)', pattern: '\\d{2}/\\d{2}/\\d{4}', description: 'US date format' },
        { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', description: 'ISO date format' },
        { name: 'Time (24h)', pattern: '([01]?[0-9]|2[0-3]):[0-5][0-9]', description: '24-hour time' },
        { name: 'Time (12h)', pattern: '(0?[1-9]|1[0-2]):[0-5][0-9]\\s?(AM|PM)', description: '12-hour time with AM/PM' }
      ]
    },
    {
      category: 'Phone Numbers',
      patterns: [
        { name: 'US Phone', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', description: 'US phone number formats' },
        { name: 'International', pattern: '\\+?[1-9]\\d{1,14}', description: 'International phone (E.164)' }
      ]
    },
    {
      category: 'Text Patterns',
      patterns: [
        { name: 'Word Boundary', pattern: '\\bword\\b', description: 'Match whole words only' },
        { name: 'Whitespace', pattern: '\\s+', description: 'One or more whitespace characters' },
        { name: 'Line Start', pattern: '^.*', description: 'Match from line start' },
        { name: 'Line End', pattern: '.*$', description: 'Match to line end' }
      ]
    },
    {
      category: 'Code & Files',
      patterns: [
        { name: 'Hex Color', pattern: '#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})', description: 'Hex color codes' },
        { name: 'HTML Tag', pattern: '<([a-z]+)([^<]+)*(?:>(.*)<\\/\\1>|\\s+\\/>)', description: 'HTML tags' },
        { name: 'File Extension', pattern: '\\.([a-zA-Z0-9]+)$', description: 'File extensions' },
        { name: 'Variable Name', pattern: '[a-zA-Z_$][a-zA-Z0-9_$]*', description: 'Valid JavaScript variable names' }
      ]
    }
  ];

  constructor(stateManager: StateManagerService) {
    super(stateManager);
  }

  protected getDefaultState(): RegexTesterState {
    return {
      pattern: '\\b[A-Z][a-z]+\\b',
      testString: 'Hello World! This is a Test String.\nRegular Expressions are Powerful.',
      flags: {
        global: true,
        caseInsensitive: false,
        multiline: false,
        dotAll: false,
        unicode: false,
        sticky: false
      },
      activeMode: 'test',
      replacement: '$1'
    };
  }

  protected applyState(state: RegexTesterState): void {
    this.pattern = state.pattern;
    this.testString = state.testString;
    this.flags = { ...state.flags };
    this.activeMode = state.activeMode;
    this.replacement = state.replacement || '$1';
    this.testRegex();
  }

  protected getCurrentState(): RegexTesterState {
    return {
      pattern: this.pattern,
      testString: this.testString,
      flags: { ...this.flags },
      activeMode: this.activeMode,
      replacement: this.replacement
    };
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.testRegex();
  }

  ngAfterViewInit(): void {
    // Any post-view initialization
  }

  setMode(mode: 'test' | 'replace' | 'explain' | 'library'): void {
    this.activeMode = mode;
    this.saveState();
  }

  toggleFlag(flag: keyof typeof this.flags): void {
    this.flags[flag] = !this.flags[flag];
    this.testRegex();
    this.saveState();
  }

  getFlagString(): string {
    let flagStr = '';
    if (this.flags.global) flagStr += 'g';
    if (this.flags.caseInsensitive) flagStr += 'i';
    if (this.flags.multiline) flagStr += 'm';
    if (this.flags.dotAll) flagStr += 's';
    if (this.flags.unicode) flagStr += 'u';
    if (this.flags.sticky) flagStr += 'y';
    return flagStr;
  }

  onPatternChange(): void {
    this.testRegex();
    this.saveState();
  }

  onTestStringChange(): void {
    this.testRegex();
    this.saveState();
  }

  onReplacementChange(): void {
    this.performReplace();
    this.saveState();
  }

  testRegex(): void {
    this.matches = [];
    this.error = null;
    this.isValid = false;

    if (!this.pattern) {
      this.error = 'Please enter a regex pattern';
      return;
    }

    try {
      const regex = new RegExp(this.pattern, this.getFlagString());
      this.isValid = true;

      if (this.testString) {
        let match;
        if (this.flags.global) {
          // Global flag: find all matches
          while ((match = regex.exec(this.testString)) !== null) {
            this.matches.push({
              fullMatch: match[0],
              index: match.index,
              groups: match.slice(1),
              namedGroups: match.groups
            });

            // Prevent infinite loop on zero-length matches
            if (match.index === regex.lastIndex) {
              regex.lastIndex++;
            }
          }
        } else {
          // Without global flag: find first match only
          match = regex.exec(this.testString);
          if (match) {
            this.matches.push({
              fullMatch: match[0],
              index: match.index,
              groups: match.slice(1),
              namedGroups: match.groups
            });
          }
        }
      }

      // Also perform replacement if in replace mode
      if (this.activeMode === 'replace') {
        this.performReplace();
      }
    } catch (e: any) {
      this.error = e.message;
      this.isValid = false;
    }
  }

  performReplace(): void {
    if (!this.pattern || !this.isValid) {
      this.replacedString = this.testString;
      return;
    }

    try {
      const regex = new RegExp(this.pattern, this.getFlagString());
      this.replacedString = this.testString.replace(regex, this.replacement);
    } catch (e: any) {
      this.replacedString = this.testString;
    }
  }

  loadPattern(pattern: string): void {
    this.pattern = pattern;
    this.testRegex();
    this.saveState();
    this.setMode('test');
  }

  exportMatches(format: 'json' | 'csv' | 'array'): void {
    if (this.matches.length === 0) {
      alert('No matches to export');
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(this.matches, null, 2);
        filename = 'regex-matches.json';
        mimeType = 'application/json';
        break;

      case 'csv':
        content = 'Index,Match,Groups\n';
        this.matches.forEach(m => {
          const groups = m.groups.join('|');
          content += `${m.index},"${m.fullMatch}","${groups}"\n`;
        });
        filename = 'regex-matches.csv';
        mimeType = 'text/csv';
        break;

      case 'array':
        const arr = this.matches.map(m => m.fullMatch);
        content = JSON.stringify(arr, null, 2);
        filename = 'regex-matches-array.json';
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
      console.log('Copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  getHighlightedText(): string {
    if (!this.testString || this.matches.length === 0) {
      return this.testString;
    }

    let result = '';
    let lastIndex = 0;

    // Sort matches by index to process them in order
    const sortedMatches = [...this.matches].sort((a, b) => a.index - b.index);

    sortedMatches.forEach((match, matchIndex) => {
      // Add text before the match
      result += this.escapeHtml(this.testString.substring(lastIndex, match.index));

      // Add highlighted match
      result += `<mark class="match match-${matchIndex % 5}" data-index="${matchIndex}">${this.escapeHtml(match.fullMatch)}</mark>`;

      lastIndex = match.index + match.fullMatch.length;
    });

    // Add remaining text after last match
    result += this.escapeHtml(this.testString.substring(lastIndex));

    return result;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  getExplanation(): string[] {
    if (!this.pattern) return [];

    const explanations: string[] = [];
    const pattern = this.pattern;

    // Basic pattern analysis
    if (pattern.includes('^')) explanations.push('^ - Matches the beginning of a line');
    if (pattern.includes('$')) explanations.push('$ - Matches the end of a line');
    if (pattern.includes('\\b')) explanations.push('\\b - Word boundary (start or end of a word)');
    if (pattern.includes('\\d')) explanations.push('\\d - Matches any digit (0-9)');
    if (pattern.includes('\\w')) explanations.push('\\w - Matches any word character (a-z, A-Z, 0-9, _)');
    if (pattern.includes('\\s')) explanations.push('\\s - Matches any whitespace character');
    if (pattern.includes('.')) explanations.push('. - Matches any character except newline');
    if (pattern.includes('*')) explanations.push('* - Matches 0 or more of the preceding element');
    if (pattern.includes('+')) explanations.push('+ - Matches 1 or more of the preceding element');
    if (pattern.includes('?')) explanations.push('? - Matches 0 or 1 of the preceding element');
    if (pattern.includes('[')) explanations.push('[ ] - Character class (matches any character inside)');
    if (pattern.includes('(')) explanations.push('( ) - Capturing group');
    if (pattern.includes('|')) explanations.push('| - Alternation (OR operator)');

    return explanations;
  }

  generateCode(language: string): string {
    const pattern = this.pattern;
    const flags = this.getFlagString();

    const examples: { [key: string]: string } = {
      javascript: `// JavaScript\nconst regex = /${pattern}/${flags};\nconst text = "${this.testString.substring(0, 50)}...";\nconst matches = text.match(regex);\nconsole.log(matches);`,
      python: `# Python\nimport re\npattern = r'${pattern}'\ntext = "${this.testString.substring(0, 50)}..."\nmatches = re.findall(pattern, text)\nprint(matches)`,
      java: `// Java\nimport java.util.regex.*;\n\nString pattern = "${pattern}";\nString text = "${this.testString.substring(0, 50)}...";\nPattern r = Pattern.compile(pattern);\nMatcher m = r.matcher(text);\nwhile (m.find()) {\n    System.out.println(m.group());\n}`,
      csharp: `// C#\nusing System.Text.RegularExpressions;\n\nstring pattern = @"${pattern}";\nstring text = "${this.testString.substring(0, 50)}...";\nMatchCollection matches = Regex.Matches(text, pattern);\nforeach (Match match in matches) {\n    Console.WriteLine(match.Value);\n}`,
      php: `// PHP\n$pattern = '/${pattern}/${flags}';\n$text = "${this.testString.substring(0, 50)}...";\npreg_match_all($pattern, $text, $matches);\nprint_r($matches);`,
      ruby: `# Ruby\npattern = /${pattern}/\ntext = "${this.testString.substring(0, 50)}..."\nmatches = text.scan(pattern)\nputs matches`,
      go: `// Go\nimport (\n    "fmt"\n    "regexp"\n)\n\npattern := \`${pattern}\`\ntext := "${this.testString.substring(0, 50)}..."\nre := regexp.MustCompile(pattern)\nmatches := re.FindAllString(text, -1)\nfmt.Println(matches)`
    };

    return examples[language] || 'Language not supported';
  }
}
