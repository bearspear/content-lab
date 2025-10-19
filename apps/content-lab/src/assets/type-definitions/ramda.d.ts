// Ramda Type Definitions - Global declarations
declare const R: typeof R;

declare namespace R {
  // Array functions
  function map<T, U>(fn: (x: T) => U): (list: readonly T[]) => U[];
  function map<T, U>(fn: (x: T) => U, list: readonly T[]): U[];

  function filter<T>(pred: (value: T) => boolean): (list: readonly T[]) => T[];
  function filter<T>(pred: (value: T) => boolean, list: readonly T[]): T[];

  function reduce<T, TResult>(fn: (acc: TResult, elem: T) => TResult, acc: TResult, list: readonly T[]): TResult;
  function reduce<T, TResult>(fn: (acc: TResult, elem: T) => TResult): (acc: TResult, list: readonly T[]) => TResult;

  function forEach<T>(fn: (x: T) => void, list: readonly T[]): T[];
  function forEach<T>(fn: (x: T) => void): (list: readonly T[]) => T[];

  // Math functions
  function add(a: number, b: number): number;
  function add(a: number): (b: number) => number;

  function subtract(a: number, b: number): number;
  function subtract(a: number): (b: number) => number;

  function multiply(a: number, b: number): number;
  function multiply(a: number): (b: number) => number;

  function divide(a: number, b: number): number;
  function divide(a: number): (b: number) => number;

  function sum(list: readonly number[]): number;
  function product(list: readonly number[]): number;

  // Logic functions
  function not(value: any): boolean;
  function and(a: any, b: any): boolean;
  function or(a: any, b: any): boolean;

  // Composition
  function compose<V0, T1>(fn0: (x0: V0) => T1): (x0: V0) => T1;
  function compose<V0, V1, T1>(fn0: (x0: V0, x1: V1) => T1): (x0: V0, x1: V1) => T1;
  function compose<V0, T1, T2>(fn1: (x: T1) => T2, fn0: (x0: V0) => T1): (x0: V0) => T2;

  function pipe<V0, T1>(fn0: (x0: V0) => T1): (x0: V0) => T1;
  function pipe<V0, T1, T2>(fn0: (x0: V0) => T1, fn1: (x: T1) => T2): (x0: V0) => T2;
  function pipe<V0, T1, T2, T3>(fn0: (x0: V0) => T1, fn1: (x: T1) => T2, fn2: (x: T2) => T3): (x0: V0) => T3;
  function pipe(...fns: Function[]): Function;

  // Object functions
  function prop<T>(p: string, obj: any): T;
  function prop(p: string): <T>(obj: any) => T;

  function pick<T>(names: readonly string[], obj: any): T;
  function pick(names: readonly string[]): <T>(obj: any) => T;

  function omit<T>(names: readonly string[], obj: any): T;
  function omit(names: readonly string[]): <T>(obj: any) => T;

  // Utility
  function identity<T>(a: T): T;
  function always<T>(val: T): (...args: any[]) => T;
  function clone<T>(value: T): T;
  function equals<T>(a: T, b: T): boolean;
  function equals<T>(a: T): (b: T) => boolean;
}

declare const R: typeof R;
