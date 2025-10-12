// Type definitions for PapaParse 5.4.1
// Project: https://www.papaparse.com

declare namespace Papa {
  interface ParseConfig {
    delimiter?: string;
    newline?: string;
    quoteChar?: string;
    escapeChar?: string;
    header?: boolean;
    transformHeader?: (header: string) => string;
    dynamicTyping?: boolean | { [field: string]: boolean };
    preview?: number;
    encoding?: string;
    worker?: boolean;
    comments?: boolean | string;
    step?: (results: ParseResult, parser: Parser) => void;
    complete?: (results: ParseResult) => void;
    error?: (error: ParseError, file?: File) => void;
    download?: boolean;
    downloadRequestHeaders?: { [headerName: string]: string };
    skipEmptyLines?: boolean | 'greedy';
    chunk?: (results: ParseResult, parser: Parser) => void;
    fastMode?: boolean;
    beforeFirstChunk?: (chunk: string) => string | void;
    withCredentials?: boolean;
    transform?: (value: string, field: string | number) => any;
    delimitersToGuess?: string[];
  }

  interface ParseResult {
    data: any[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  interface ParseError {
    type: string;
    code: string;
    message: string;
    row?: number;
  }

  interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    fields?: string[];
  }

  interface Parser {
    abort(): void;
    pause(): void;
    resume(): void;
  }

  interface UnparseConfig {
    quotes?: boolean | boolean[];
    quoteChar?: string;
    escapeChar?: string;
    delimiter?: string;
    header?: boolean;
    newline?: string;
    skipEmptyLines?: boolean | 'greedy';
    columns?: string[];
  }

  interface UnparseData {
    fields?: string[];
    data: any[] | any[][];
  }

  function parse(input: string | File, config?: ParseConfig): ParseResult;
  function unparse(data: any[] | UnparseData, config?: UnparseConfig): string;
}

declare const Papa: typeof Papa;
