// Lodash global declarations
declare const _: _.LoDashStatic;

declare namespace _ {
  interface LoDashStatic {
    // Array methods
    chunk<T>(array: T[], size?: number): T[][];
    compact<T>(array: (T | null | undefined | false | '' | 0)[]): T[];
    concat<T>(...values: Array<T | T[]>): T[];
    difference<T>(array: T[], ...values: T[][]): T[];
    drop<T>(array: T[], n?: number): T[];
    dropRight<T>(array: T[], n?: number): T[];
    fill<T, U>(array: T[], value: U, start?: number, end?: number): Array<T | U>;
    findIndex<T>(array: T[], predicate: (value: T) => boolean, fromIndex?: number): number;
    findLastIndex<T>(array: T[], predicate: (value: T) => boolean, fromIndex?: number): number;
    first<T>(array: T[]): T | undefined;
    flatten<T>(array: any[]): T[];
    flattenDeep<T>(array: any[]): T[];
    head<T>(array: T[]): T | undefined;
    indexOf<T>(array: T[], value: T, fromIndex?: number): number;
    initial<T>(array: T[]): T[];
    intersection<T>(...arrays: T[][]): T[];
    join<T>(array: T[], separator?: string): string;
    last<T>(array: T[]): T | undefined;
    pull<T>(array: T[], ...values: T[]): T[];
    pullAt<T>(array: T[], ...indexes: number[]): T[];
    remove<T>(array: T[], predicate: (value: T) => boolean): T[];
    reverse<T>(array: T[]): T[];
    slice<T>(array: T[], start?: number, end?: number): T[];
    sortedIndex<T>(array: T[], value: T): number;
    sortedUniq<T>(array: T[]): T[];
    tail<T>(array: T[]): T[];
    take<T>(array: T[], n?: number): T[];
    takeRight<T>(array: T[], n?: number): T[];
    union<T>(...arrays: T[][]): T[];
    uniq<T>(array: T[]): T[];
    unique<T>(array: T[]): T[];
    unzip<T>(array: T[][]): T[][];
    without<T>(array: T[], ...values: T[]): T[];
    zip<T>(...arrays: T[][]): T[][];

    // Collection methods
    countBy<T>(collection: T[], iteratee?: (value: T) => any): Record<string, number>;
    each<T>(collection: T[], iteratee: (value: T, index: number) => any): T[];
    forEach<T>(collection: T[], iteratee: (value: T, index: number) => any): T[];
    every<T>(collection: T[], predicate?: (value: T) => boolean): boolean;
    filter<T>(collection: T[], predicate: (value: T) => boolean): T[];
    find<T>(collection: T[], predicate: (value: T) => boolean, fromIndex?: number): T | undefined;
    findLast<T>(collection: T[], predicate: (value: T) => boolean, fromIndex?: number): T | undefined;
    flatMap<T, U>(collection: T[], iteratee: (value: T) => U | U[]): U[];
    groupBy<T>(collection: T[], iteratee: (value: T) => any): Record<string, T[]>;
    includes<T>(collection: T[], value: T, fromIndex?: number): boolean;
    keyBy<T>(collection: T[], iteratee: (value: T) => any): Record<string, T>;
    map<T, U>(collection: T[], iteratee: (value: T, index: number) => U): U[];
    orderBy<T>(collection: T[], iteratees?: any[], orders?: ('asc' | 'desc')[]): T[];
    partition<T>(collection: T[], predicate: (value: T) => boolean): [T[], T[]];
    reduce<T, U>(collection: T[], iteratee: (accumulator: U, value: T) => U, accumulator?: U): U;
    reduceRight<T, U>(collection: T[], iteratee: (accumulator: U, value: T) => U, accumulator?: U): U;
    reject<T>(collection: T[], predicate: (value: T) => boolean): T[];
    sample<T>(collection: T[]): T | undefined;
    sampleSize<T>(collection: T[], n?: number): T[];
    shuffle<T>(collection: T[]): T[];
    size<T>(collection: T[] | object): number;
    some<T>(collection: T[], predicate?: (value: T) => boolean): boolean;
    sortBy<T>(collection: T[], ...iteratees: any[]): T[];

    // Object methods
    assign<T, U>(object: T, ...sources: U[]): T & U;
    assignIn<T, U>(object: T, ...sources: U[]): T & U;
    at(object: any, ...paths: string[]): any[];
    create<T>(prototype: T, properties?: object): T;
    defaults<T>(object: T, ...sources: any[]): T;
    defaultsDeep<T>(object: T, ...sources: any[]): T;
    entries<T>(object: T): [string, any][];
    entriesIn<T>(object: T): [string, any][];
    extend<T, U>(object: T, ...sources: U[]): T & U;
    findKey(object: any, predicate?: (value: any) => boolean): string | undefined;
    findLastKey(object: any, predicate?: (value: any) => boolean): string | undefined;
    forIn(object: any, iteratee?: (value: any, key: string) => any): any;
    forInRight(object: any, iteratee?: (value: any, key: string) => any): any;
    forOwn(object: any, iteratee?: (value: any, key: string) => any): any;
    forOwnRight(object: any, iteratee?: (value: any, key: string) => any): any;
    functions(object: any): string[];
    get(object: any, path: string | string[], defaultValue?: any): any;
    has(object: any, path: string | string[]): boolean;
    hasIn(object: any, path: string | string[]): boolean;
    invert(object: any): any;
    invoke(object: any, path: string, ...args: any[]): any;
    keys(object: any): string[];
    keysIn(object: any): string[];
    mapKeys(object: any, iteratee?: (value: any, key: string) => string): any;
    mapValues(object: any, iteratee?: (value: any, key: string) => any): any;
    merge<T, U>(object: T, ...sources: U[]): T & U;
    omit(object: any, ...paths: string[]): any;
    omitBy(object: any, predicate?: (value: any) => boolean): any;
    pick(object: any, ...paths: string[]): any;
    pickBy(object: any, predicate?: (value: any) => boolean): any;
    result(object: any, path: string | string[], defaultValue?: any): any;
    set(object: any, path: string | string[], value: any): any;
    toPairs(object: any): [string, any][];
    toPairsIn(object: any): [string, any][];
    transform(object: any, iteratee?: (accumulator: any, value: any, key: string) => any, accumulator?: any): any;
    unset(object: any, path: string | string[]): boolean;
    update(object: any, path: string | string[], updater: (value: any) => any): any;
    values(object: any): any[];
    valuesIn(object: any): any[];

    // String methods
    camelCase(string?: string): string;
    capitalize(string?: string): string;
    deburr(string?: string): string;
    endsWith(string?: string, target?: string, position?: number): boolean;
    escape(string?: string): string;
    escapeRegExp(string?: string): string;
    kebabCase(string?: string): string;
    lowerCase(string?: string): string;
    lowerFirst(string?: string): string;
    pad(string?: string, length?: number, chars?: string): string;
    padEnd(string?: string, length?: number, chars?: string): string;
    padStart(string?: string, length?: number, chars?: string): string;
    parseInt(string: string, radix?: number): number;
    repeat(string?: string, n?: number): string;
    replace(string?: string, pattern?: string | RegExp, replacement?: string | Function): string;
    snakeCase(string?: string): string;
    split(string?: string, separator?: string | RegExp, limit?: number): string[];
    startCase(string?: string): string;
    startsWith(string?: string, target?: string, position?: number): boolean;
    template(string?: string, options?: any): Function;
    toLower(string?: string): string;
    toUpper(string?: string): string;
    trim(string?: string, chars?: string): string;
    trimEnd(string?: string, chars?: string): string;
    trimStart(string?: string, chars?: string): string;
    truncate(string?: string, options?: { length?: number; omission?: string; separator?: string | RegExp }): string;
    unescape(string?: string): string;
    upperCase(string?: string): string;
    upperFirst(string?: string): string;
    words(string?: string, pattern?: string | RegExp): string[];

    // Utility methods
    attempt(func: Function, ...args: any[]): any;
    constant<T>(value: T): () => T;
    identity<T>(value: T): T;
    iteratee(func?: any): Function;
    matches(source: any): (object: any) => boolean;
    matchesProperty(path: string | string[], srcValue: any): (object: any) => boolean;
    method(path: string | string[], ...args: any[]): (object: any) => any;
    noop(): void;
    now(): number;
    property(path: string | string[]): (object: any) => any;
    range(start: number, end?: number, step?: number): number[];
    rangeRight(start: number, end?: number, step?: number): number[];
    times<T>(n: number, iteratee: (index: number) => T): T[];
    toPath(value: any): string[];
    uniqueId(prefix?: string): string;
  }
}
