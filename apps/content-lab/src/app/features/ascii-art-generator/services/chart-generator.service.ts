/**
 * Chart Generator Service
 * Generates ASCII charts and graphs for data visualization
 */

import { Injectable } from '@angular/core';
import { ChartType, ChartConfig, ChartDataPoint, ChartSeries } from '../models/ascii-art.model';

@Injectable({
  providedIn: 'root'
})
export class ChartGeneratorService {

  constructor() {
    console.log('[ChartGeneratorService] Service initialized');
  }

  /**
   * Generate a chart based on configuration
   */
  generateChart(config: ChartConfig): string {
    switch (config.type) {
      case ChartType.Bar:
        return this.generateBarChart(config);
      case ChartType.Line:
        return this.generateLineChart(config);
      case ChartType.Scatter:
        return this.generateScatterPlot(config);
      case ChartType.Pie:
        return this.generatePieChart(config);
      case ChartType.Histogram:
        return this.generateHistogram(config);
      default:
        return 'Chart type not yet implemented';
    }
  }

  /**
   * Generate a bar chart (vertical bars)
   */
  private generateBarChart(config: ChartConfig): string {
    const width = config.width || 60;
    const height = config.height || 20;
    const series = config.series[0]; // Use first series for now

    if (!series || series.data.length === 0) {
      return 'No data provided for bar chart';
    }

    const lines: string[] = [];

    // Add title if provided
    if (config.title) {
      lines.push(this.centerText(config.title, width));
      lines.push('');
    }

    // Find max value for scaling
    const maxValue = Math.max(...series.data.map(d => d.y));
    const minValue = Math.min(...series.data.map(d => d.y), 0);
    const range = maxValue - minValue;

    // Calculate bar width
    const barCount = series.data.length;
    const availableWidth = width - 10; // Leave space for axis
    const barWidth = Math.max(1, Math.floor((availableWidth - barCount + 1) / barCount));
    const spacing = 1;

    // Generate chart area
    for (let row = height; row >= 0; row--) {
      let line = '';
      const threshold = minValue + (range * row / height);

      // Y-axis label
      const label = threshold.toFixed(1);
      line += label.padStart(6) + ' │ ';

      // Bars
      for (const point of series.data) {
        const barHeight = ((point.y - minValue) / range) * height;

        if (row <= barHeight) {
          line += '█'.repeat(barWidth) + ' '.repeat(spacing);
        } else {
          line += ' '.repeat(barWidth + spacing);
        }
      }

      lines.push(line);
    }

    // X-axis
    lines.push(' '.repeat(6) + ' └' + '─'.repeat(availableWidth + 2));

    // X-axis labels
    let labelLine = ' '.repeat(9);
    for (const point of series.data) {
      const label = String(point.x).substring(0, barWidth);
      labelLine += label.padEnd(barWidth + spacing);
    }
    lines.push(labelLine);

    // Y-axis label
    if (config.yLabel) {
      lines.unshift('');
      lines.unshift(config.yLabel);
    }

    // X-axis label
    if (config.xLabel) {
      lines.push('');
      lines.push(this.centerText(config.xLabel, width));
    }

    return lines.join('\n');
  }

  /**
   * Generate a line chart
   */
  private generateLineChart(config: ChartConfig): string {
    const width = config.width || 60;
    const height = config.height || 20;
    const series = config.series[0]; // Use first series for now

    if (!series || series.data.length === 0) {
      return 'No data provided for line chart';
    }

    const lines: string[] = [];

    // Add title if provided
    if (config.title) {
      lines.push(this.centerText(config.title, width));
      lines.push('');
    }

    // Sort data by x value
    const sortedData = [...series.data].sort((a, b) => {
      const aX = typeof a.x === 'number' ? a.x : 0;
      const bX = typeof b.x === 'number' ? b.x : 0;
      return aX - bX;
    });

    // Find ranges
    const xValues = sortedData.map(d => typeof d.x === 'number' ? d.x : 0);
    const yValues = sortedData.map(d => d.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues, 0);
    const maxY = Math.max(...yValues);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    // Create plot area
    const plotWidth = width - 10;
    const plotArea: string[][] = Array(height + 1).fill(null).map(() =>
      Array(plotWidth).fill(' ')
    );

    // Plot points and lines
    for (let i = 0; i < sortedData.length; i++) {
      const point = sortedData[i];
      const x = typeof point.x === 'number' ? point.x : 0;
      const y = point.y;

      const plotX = Math.round(((x - minX) / rangeX) * (plotWidth - 1));
      const plotY = height - Math.round(((y - minY) / rangeY) * height);

      if (plotY >= 0 && plotY <= height && plotX >= 0 && plotX < plotWidth) {
        plotArea[plotY][plotX] = '●';

        // Draw line to previous point
        if (i > 0) {
          const prevPoint = sortedData[i - 1];
          const prevX = typeof prevPoint.x === 'number' ? prevPoint.x : 0;
          const prevY = prevPoint.y;
          const prevPlotX = Math.round(((prevX - minX) / rangeX) * (plotWidth - 1));
          const prevPlotY = height - Math.round(((prevY - minY) / rangeY) * height);

          this.drawLine(plotArea, prevPlotX, prevPlotY, plotX, plotY);
        }
      }
    }

    // Convert plot area to strings with Y-axis
    for (let row = 0; row <= height; row++) {
      const yValue = maxY - ((maxY - minY) * row / height);
      const label = yValue.toFixed(1);
      const line = label.padStart(6) + ' │ ' + plotArea[row].join('');
      lines.push(line);
    }

    // X-axis
    lines.push(' '.repeat(6) + ' └' + '─'.repeat(plotWidth));

    // X-axis labels
    const xLabelLine = ' '.repeat(9) +
      minX.toFixed(1).padEnd(Math.floor(plotWidth / 2)) +
      maxX.toFixed(1).padStart(Math.floor(plotWidth / 2));
    lines.push(xLabelLine);

    // Axis labels
    if (config.yLabel) {
      lines.unshift('');
      lines.unshift(config.yLabel);
    }

    if (config.xLabel) {
      lines.push('');
      lines.push(this.centerText(config.xLabel, width));
    }

    return lines.join('\n');
  }

  /**
   * Generate a scatter plot
   */
  private generateScatterPlot(config: ChartConfig): string {
    const width = config.width || 60;
    const height = config.height || 20;

    if (config.series.length === 0 || config.series[0].data.length === 0) {
      return 'No data provided for scatter plot';
    }

    const lines: string[] = [];

    // Add title if provided
    if (config.title) {
      lines.push(this.centerText(config.title, width));
      lines.push('');
    }

    // Combine all series data for range calculation
    const allPoints = config.series.flatMap(s => s.data);
    const xValues = allPoints.map(d => typeof d.x === 'number' ? d.x : 0);
    const yValues = allPoints.map(d => d.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues, 0);
    const maxY = Math.max(...yValues);
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;

    // Create plot area
    const plotWidth = width - 10;
    const plotArea: string[][] = Array(height + 1).fill(null).map(() =>
      Array(plotWidth).fill(' ')
    );

    // Plot symbols for different series
    const symbols = ['●', '○', '■', '□', '▲', '△'];

    // Plot all series
    config.series.forEach((series, seriesIndex) => {
      const symbol = symbols[seriesIndex % symbols.length];

      series.data.forEach(point => {
        const x = typeof point.x === 'number' ? point.x : 0;
        const y = point.y;

        const plotX = Math.round(((x - minX) / rangeX) * (plotWidth - 1));
        const plotY = height - Math.round(((y - minY) / rangeY) * height);

        if (plotY >= 0 && plotY <= height && plotX >= 0 && plotX < plotWidth) {
          plotArea[plotY][plotX] = symbol;
        }
      });
    });

    // Convert plot area to strings with Y-axis
    for (let row = 0; row <= height; row++) {
      const yValue = maxY - ((maxY - minY) * row / height);
      const label = yValue.toFixed(1);
      const line = label.padStart(6) + ' │ ' + plotArea[row].join('');
      lines.push(line);
    }

    // X-axis
    lines.push(' '.repeat(6) + ' └' + '─'.repeat(plotWidth));

    // X-axis labels
    const xLabelLine = ' '.repeat(9) +
      minX.toFixed(1).padEnd(Math.floor(plotWidth / 2)) +
      maxX.toFixed(1).padStart(Math.floor(plotWidth / 2));
    lines.push(xLabelLine);

    // Legend if multiple series
    if (config.showLegend && config.series.length > 1) {
      lines.push('');
      lines.push('Legend:');
      config.series.forEach((series, i) => {
        const symbol = symbols[i % symbols.length];
        lines.push(`  ${symbol} ${series.name}`);
      });
    }

    // Axis labels
    if (config.yLabel) {
      lines.unshift('');
      lines.unshift(config.yLabel);
    }

    if (config.xLabel) {
      lines.push('');
      lines.push(this.centerText(config.xLabel, width));
    }

    return lines.join('\n');
  }

  /**
   * Generate a pie chart
   */
  private generatePieChart(config: ChartConfig): string {
    const series = config.series[0];

    if (!series || series.data.length === 0) {
      return 'No data provided for pie chart';
    }

    const lines: string[] = [];

    // Add title
    if (config.title) {
      lines.push(config.title);
      lines.push('');
    }

    // Calculate percentages
    const total = series.data.reduce((sum, point) => sum + point.y, 0);
    const percentages = series.data.map(point => ({
      label: String(point.x),
      value: point.y,
      percentage: (point.y / total) * 100
    }));

    // Sort by percentage (descending)
    percentages.sort((a, b) => b.percentage - a.percentage);

    // Generate simple text-based pie representation
    lines.push('┌────────────────────────────────────┐');

    percentages.forEach((item, index) => {
      const bar = '█'.repeat(Math.round(item.percentage / 3));
      const label = item.label.padEnd(15).substring(0, 15);
      const percent = item.percentage.toFixed(1) + '%';
      lines.push(`│ ${label} ${bar.padEnd(12)} ${percent.padStart(6)} │`);
    });

    lines.push('└────────────────────────────────────┘');
    lines.push('');
    lines.push(`Total: ${total.toFixed(2)}`);

    return lines.join('\n');
  }

  /**
   * Generate a histogram
   */
  private generateHistogram(config: ChartConfig): string {
    const series = config.series[0];

    if (!series || series.data.length === 0) {
      return 'No data provided for histogram';
    }

    const width = config.width || 60;
    const height = config.height || 20;
    const lines: string[] = [];

    // Add title
    if (config.title) {
      lines.push(this.centerText(config.title, width));
      lines.push('');
    }

    // Calculate bins
    const values = series.data.map(d => d.y);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.min(20, series.data.length);
    const binSize = (max - min) / binCount;

    // Create bins
    const bins: number[] = Array(binCount).fill(0);
    values.forEach(value => {
      const binIndex = Math.min(binCount - 1, Math.floor((value - min) / binSize));
      bins[binIndex]++;
    });

    // Find max frequency for scaling
    const maxFreq = Math.max(...bins);

    // Generate chart
    for (let row = height; row >= 0; row--) {
      let line = '';
      const threshold = (maxFreq * row) / height;

      // Y-axis label
      line += Math.round(threshold).toString().padStart(4) + ' │ ';

      // Bins
      for (const freq of bins) {
        if (freq >= threshold) {
          line += '█';
        } else {
          line += ' ';
        }
      }

      lines.push(line);
    }

    // X-axis
    lines.push(' '.repeat(4) + ' └' + '─'.repeat(binCount));

    // X-axis labels
    lines.push(' '.repeat(7) + min.toFixed(1).padEnd(binCount / 2) + max.toFixed(1));

    if (config.xLabel) {
      lines.push('');
      lines.push(this.centerText(config.xLabel, width));
    }

    return lines.join('\n');
  }

  /**
   * Draw a line between two points using Bresenham's algorithm
   */
  private drawLine(
    grid: string[][],
    x0: number,
    y0: number,
    x1: number,
    y1: number
  ): void {
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    let x = x0;
    let y = y0;

    while (true) {
      // Don't overwrite points
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        if (grid[y][x] === ' ') {
          grid[y][x] = '·';
        }
      }

      if (x === x1 && y === y1) break;

      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }

  /**
   * Center text within a given width
   */
  private centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  /**
   * Parse CSV data into chart series
   */
  parseCSVForChart(csvText: string): ChartSeries[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const data: ChartDataPoint[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 2) {
        const x = isNaN(Number(values[0])) ? values[0] : Number(values[0]);
        const y = Number(values[1]) || 0;
        data.push({ x, y });
      }
    }

    return [{
      name: headers[1] || 'Data',
      data
    }];
  }

  /**
   * Parse JSON data into chart series
   */
  parseJSONForChart(jsonText: string): ChartSeries[] {
    try {
      const parsed = JSON.parse(jsonText);

      if (!Array.isArray(parsed)) {
        return [];
      }

      // Assume format: [{ x: ..., y: ... }, ...]
      const data: ChartDataPoint[] = parsed.map(item => ({
        x: item.x ?? item.label ?? '',
        y: Number(item.y ?? item.value ?? 0)
      }));

      return [{
        name: 'Data',
        data
      }];
    } catch (error) {
      console.error('[ChartGenerator] Error parsing JSON:', error);
      return [];
    }
  }
}
