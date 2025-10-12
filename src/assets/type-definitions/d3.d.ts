// D3.js Type Definitions - Global declarations
declare const d3: D3Static;

interface D3Static {
  // Selection
  select(selector: string | Element): D3Selection;
  selectAll(selector: string): D3Selection;

  // Data
  csv(url: string): Promise<any[]>;
  json(url: string): Promise<any>;

  // Scales
  scaleLinear(): D3Scale;
  scaleOrdinal(): D3Scale;
  scaleTime(): D3Scale;
  scaleBand(): D3Scale;

  // Axes
  axisBottom(scale: D3Scale): D3Axis;
  axisLeft(scale: D3Scale): D3Axis;
  axisTop(scale: D3Scale): D3Axis;
  axisRight(scale: D3Scale): D3Axis;

  // Shapes
  line(): D3Line;
  area(): D3Area;
  arc(): D3Arc;
  pie(): D3Pie;

  // Array utilities
  min(array: any[], accessor?: (d: any) => any): any;
  max(array: any[], accessor?: (d: any) => any): any;
  extent(array: any[], accessor?: (d: any) => any): [any, any];
  range(start: number, stop?: number, step?: number): number[];

  // Color
  rgb(r: number, g: number, b: number): any;
  hsl(h: number, s: number, l: number): any;

  version: string;
}

interface D3Selection {
  attr(name: string, value: any): D3Selection;
  style(name: string, value: any): D3Selection;
  text(value: any): D3Selection;
  html(value: any): D3Selection;
  append(type: string): D3Selection;
  remove(): D3Selection;
  data(data: any[]): D3Selection;
  enter(): D3Selection;
  exit(): D3Selection;
  on(typenames: string, listener: Function): D3Selection;
  call(func: Function, ...args: any[]): D3Selection;
  each(func: Function): D3Selection;
}

interface D3Scale {
  (value: any): any;
  domain(values?: any[]): D3Scale | any[];
  range(values?: any[]): D3Scale | any[];
  padding(value?: number): D3Scale | number;
  bandwidth?(): number;
}

interface D3Axis {
  (selection: D3Selection): void;
  scale(scale?: D3Scale): D3Axis | D3Scale;
  ticks(count?: number): D3Axis;
  tickFormat(format?: Function): D3Axis;
}

interface D3Line {
  (data: any[]): string;
  x(accessor: Function): D3Line;
  y(accessor: Function): D3Line;
  curve(curve: any): D3Line;
}

interface D3Area {
  (data: any[]): string;
  x(accessor: Function): D3Area;
  y0(accessor: Function): D3Area;
  y1(accessor: Function): D3Area;
}

interface D3Arc {
  (data: any): string;
  innerRadius(radius: number | Function): D3Arc;
  outerRadius(radius: number | Function): D3Arc;
  startAngle(angle: number | Function): D3Arc;
  endAngle(angle: number | Function): D3Arc;
}

interface D3Pie {
  (data: any[]): any[];
  value(accessor: Function): D3Pie;
  sort(comparator: Function): D3Pie;
}
