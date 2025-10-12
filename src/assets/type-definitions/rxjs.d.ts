// RxJS Type Definitions
declare namespace rxjs {
  interface Observable<T> {
    subscribe(observer: ((value: T) => void) | {
      next?: (value: T) => void;
      error?: (err: any) => void;
      complete?: () => void;
    }): Subscription;
    pipe(...operations: any[]): Observable<any>;
  }

  interface Subscription {
    unsubscribe(): void;
    add(subscription: Subscription): void;
    remove(subscription: Subscription): void;
  }

  interface Observer<T> {
    next?: (value: T) => void;
    error?: (err: any) => void;
    complete?: () => void;
  }

  function interval(period: number): Observable<number>;
  function timer(dueTime: number, period?: number): Observable<number>;
  function of<T>(...values: T[]): Observable<T>;
  function from<T>(input: any): Observable<T>;
  function fromEvent(target: any, eventName: string): Observable<any>;

  function map<T, R>(project: (value: T, index: number) => R): (source: Observable<T>) => Observable<R>;
  function filter<T>(predicate: (value: T, index: number) => boolean): (source: Observable<T>) => Observable<T>;
  function take<T>(count: number): (source: Observable<T>) => Observable<T>;
  function takeUntil<T>(notifier: Observable<any>): (source: Observable<T>) => Observable<T>;
  function mergeMap<T, R>(project: (value: T, index: number) => Observable<R>): (source: Observable<T>) => Observable<R>;
  function switchMap<T, R>(project: (value: T, index: number) => Observable<R>): (source: Observable<T>) => Observable<R>;
  function debounceTime<T>(dueTime: number): (source: Observable<T>) => Observable<T>;
  function distinctUntilChanged<T>(): (source: Observable<T>) => Observable<T>;
}

declare const rxjs: typeof rxjs;
