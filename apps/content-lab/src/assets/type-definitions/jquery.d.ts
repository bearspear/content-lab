// jQuery Type Definitions - Global declarations
declare const $: JQueryStatic;
declare const jQuery: JQueryStatic;

interface JQuery {
  addClass(className: string): JQuery;
  removeClass(className: string): JQuery;
  toggleClass(className: string): JQuery;
  hasClass(className: string): boolean;

  attr(attributeName: string): string;
  attr(attributeName: string, value: string | number): JQuery;
  removeAttr(attributeName: string): JQuery;

  prop(propertyName: string): any;
  prop(propertyName: string, value: any): JQuery;

  val(): any;
  val(value: string | number | string[]): JQuery;

  text(): string;
  text(text: string): JQuery;

  html(): string;
  html(htmlString: string): JQuery;

  append(content: string | JQuery | Element): JQuery;
  prepend(content: string | JQuery | Element): JQuery;
  after(content: string | JQuery | Element): JQuery;
  before(content: string | JQuery | Element): JQuery;
  remove(): JQuery;
  empty(): JQuery;

  css(propertyName: string): string;
  css(propertyName: string, value: string | number): JQuery;
  css(properties: any): JQuery;

  show(): JQuery;
  hide(): JQuery;
  toggle(): JQuery;
  fadeIn(duration?: number, callback?: Function): JQuery;
  fadeOut(duration?: number, callback?: Function): JQuery;
  slideDown(duration?: number, callback?: Function): JQuery;
  slideUp(duration?: number, callback?: Function): JQuery;

  on(events: string, handler: (eventObject: any) => any): JQuery;
  on(events: string, selector: string, handler: (eventObject: any) => any): JQuery;
  off(events?: string, handler?: (eventObject: any) => any): JQuery;
  click(handler?: (eventObject: any) => any): JQuery;
  change(handler?: (eventObject: any) => any): JQuery;
  submit(handler?: (eventObject: any) => any): JQuery;

  find(selector: string): JQuery;
  filter(selector: string): JQuery;
  first(): JQuery;
  last(): JQuery;
  eq(index: number): JQuery;
  parent(): JQuery;
  children(): JQuery;
  siblings(): JQuery;

  each(func: (index: number, element: Element) => any): JQuery;
  map(callback: (index: number, domElement: Element) => any): JQuery;

  ajax(settings: any): any;
  get(url: string, data?: any, success?: Function): any;
  post(url: string, data?: any, success?: Function): any;

  length: number;
  [index: number]: Element;
}

interface JQueryStatic {
  (selector: string, context?: Element | JQuery): JQuery;
  (element: Element): JQuery;
  (elementArray: Element[]): JQuery;
  (callback: () => void): JQuery;
  (html: string, ownerDocument?: Document): JQuery;
  (): JQuery;

  ajax(url: string, settings?: any): any;
  ajax(settings: any): any;
  get(url: string, data?: any, success?: Function, dataType?: string): any;
  post(url: string, data?: any, success?: Function, dataType?: string): any;
  getJSON(url: string, data?: any, success?: Function): any;

  each(collection: any, callback: (indexInArray: any, valueOfElement: any) => any): any;
  map(array: any[], callback: (elementOfArray: any, indexInArray: number) => any): any[];
  grep(array: any[], func: (elementOfArray: any, indexInArray: number) => boolean): any[];

  extend(target: any, ...objs: any[]): any;
  extend(deep: boolean, target: any, ...objs: any[]): any;
}
