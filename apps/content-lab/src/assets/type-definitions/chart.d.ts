// Chart.js Type Definitions - Global declarations
declare const Chart: ChartStatic;

interface ChartStatic {
  new (ctx: string | CanvasRenderingContext2D | HTMLCanvasElement, config: ChartConfiguration): Chart;
  register(...items: any[]): void;
  unregister(...items: any[]): void;
  defaults: any;
}

interface Chart {
  update(mode?: string): void;
  reset(): void;
  render(): void;
  stop(): Chart;
  resize(width?: number, height?: number): void;
  clear(): void;
  destroy(): void;

  data: ChartData;
  options: any;
  config: ChartConfiguration;
}

interface ChartConfiguration {
  type: string;
  data: ChartData;
  options?: any;
  plugins?: any[];
}

interface ChartData {
  labels?: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label?: string;
  data: number[] | any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  [key: string]: any;
}
