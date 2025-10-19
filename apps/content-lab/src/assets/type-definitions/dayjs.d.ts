// Day.js Type Definitions - Global declarations
declare function dayjs(date?: string | number | Date): dayjs.Dayjs;

declare namespace dayjs {
  interface Dayjs {
    format(template?: string): string;
    add(value: number, unit: string): Dayjs;
    subtract(value: number, unit: string): Dayjs;
    year(): number;
    month(): number;
    date(): number;
    day(): number;
    hour(): number;
    minute(): number;
    second(): number;
    millisecond(): number;
    unix(): number;
    valueOf(): number;
    toDate(): Date;
    toJSON(): string;
    toISOString(): string;
    toString(): string;
    diff(date: Dayjs | string | Date, unit?: string, float?: boolean): number;
    isBefore(date: Dayjs | string | Date): boolean;
    isAfter(date: Dayjs | string | Date): boolean;
    isSame(date: Dayjs | string | Date): boolean;
  }
}
