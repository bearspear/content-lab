// Highcharts Type Definitions
declare namespace Highcharts {
  interface ChartOptions {
    chart?: any;
    title?: { text?: string };
    subtitle?: { text?: string };
    xAxis?: any;
    yAxis?: any;
    series?: SeriesOptions[];
    plotOptions?: any;
    legend?: any;
    tooltip?: any;
    credits?: { enabled?: boolean };
    [key: string]: any;
  }

  interface SeriesOptions {
    type?: string;
    name?: string;
    data?: any[];
    color?: string;
    [key: string]: any;
  }

  interface Chart {
    update(options: ChartOptions): void;
    destroy(): void;
    redraw(): void;
    reflow(): void;
    setSize(width: number, height: number): void;
    addSeries(options: SeriesOptions): void;
  }

  function chart(renderTo: string | HTMLElement, options: ChartOptions): Chart;
}

declare const Highcharts: typeof Highcharts;
