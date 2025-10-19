// GSAP Type Definitions
declare namespace gsap {
  interface TweenVars {
    [key: string]: any;
    x?: number | string;
    y?: number | string;
    rotation?: number;
    scale?: number;
    opacity?: number;
    duration?: number;
    delay?: number;
    ease?: string | Function;
    repeat?: number;
    yoyo?: boolean;
    onComplete?: Function;
    onUpdate?: Function;
    onStart?: Function;
  }

  interface Tween {
    kill(): void;
    pause(): Tween;
    play(): Tween;
    resume(): Tween;
    reverse(): Tween;
    restart(includeDelay?: boolean): Tween;
    duration(value?: number): number | Tween;
    progress(value?: number): number | Tween;
    time(value?: number): number | Tween;
  }

  function to(target: string | Element | Element[], vars: TweenVars): Tween;
  function from(target: string | Element | Element[], vars: TweenVars): Tween;
  function fromTo(target: string | Element | Element[], fromVars: TweenVars, toVars: TweenVars): Tween;
  function set(target: string | Element | Element[], vars: TweenVars): void;
  function timeline(vars?: any): any;
  function registerPlugin(...plugins: any[]): void;
}

declare const gsap: typeof gsap;
