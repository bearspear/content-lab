// Moment.js Type Definitions - Global declarations
declare const moment: moment.MomentStatic;

declare namespace moment {
  interface Moment {
    format(format?: string): string;
    add(amount: number, unit: string): Moment;
    subtract(amount: number, unit: string): Moment;
    startOf(unit: string): Moment;
    endOf(unit: string): Moment;
    year(y?: number): number | Moment;
    month(M?: number): number | Moment;
    date(d?: number): number | Moment;
    day(d?: number): number | Moment;
    hour(h?: number): number | Moment;
    minute(m?: number): number | Moment;
    second(s?: number): number | Moment;
    millisecond(ms?: number): number | Moment;
    unix(): number;
    valueOf(): number;
    toDate(): Date;
    toJSON(): string;
    toISOString(): string;
    toString(): string;
    diff(b: Moment | string | Date, unit?: string, precise?: boolean): number;
    isBefore(b: Moment | string | Date, unit?: string): boolean;
    isAfter(b: Moment | string | Date, unit?: string): boolean;
    isSame(b: Moment | string | Date, unit?: string): boolean;
    isSameOrBefore(b: Moment | string | Date, unit?: string): boolean;
    isSameOrAfter(b: Moment | string | Date, unit?: string): boolean;
    isBetween(a: Moment | string | Date, b: Moment | string | Date, unit?: string, inclusivity?: string): boolean;
    isValid(): boolean;
    locale(locale?: string): string | Moment;
    utc(): Moment;
    local(): Moment;
    utcOffset(offset?: number | string): number | Moment;
    clone(): Moment;
  }

  interface MomentStatic {
    (inp?: any, format?: string | string[], strict?: boolean): Moment;
    (inp?: any, format?: string | string[], language?: string, strict?: boolean): Moment;
    utc(inp?: any, format?: string | string[], strict?: boolean): Moment;
    unix(timestamp: number): Moment;
    now(): number;
    locale(language?: string): string;
    localeData(key?: string): any;
    duration(inp?: any, unit?: string): any;
    isDuration(obj: any): boolean;
    isMoment(obj: any): boolean;
    isDate(obj: any): boolean;
  }
}
