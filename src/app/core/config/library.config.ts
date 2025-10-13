/**
 * Configuration for external JavaScript libraries
 * Uses CDN URLs with local fallback for optimal loading
 */

export interface LibraryConfig {
  id: string;
  name: string;
  description: string;
  cdnUrl: string;
  localUrl: string;
  category: string;
  globalVar?: string; // Global variable to check if library is loaded
}

/**
 * External library configurations with CDN URLs (primary) and local fallback
 * Libraries are loaded on-demand, reducing initial bundle size
 */
export const LIBRARY_CONFIG: LibraryConfig[] = [
  {
    id: 'lodash',
    name: 'Lodash',
    description: 'Utility library for arrays, objects, and functions',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
    localUrl: '/assets/js-libraries/lodash.min.js',
    category: 'Utility',
    globalVar: '_'
  },
  {
    id: 'moment',
    name: 'Moment.js',
    description: 'Date and time manipulation library',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js',
    localUrl: '/assets/js-libraries/moment.min.js',
    category: 'Date/Time',
    globalVar: 'moment'
  },
  {
    id: 'dayjs',
    name: 'Day.js',
    description: 'Lightweight date library (alternative to Moment)',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js',
    localUrl: '/assets/js-libraries/dayjs.min.js',
    category: 'Date/Time',
    globalVar: 'dayjs'
  },
  {
    id: 'axios',
    name: 'Axios',
    description: 'Promise-based HTTP client',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/axios@1.6.5/dist/axios.min.js',
    localUrl: '/assets/js-libraries/axios.min.js',
    category: 'HTTP',
    globalVar: 'axios'
  },
  {
    id: 'chartjs',
    name: 'Chart.js',
    description: 'Simple yet flexible charting library',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
    localUrl: '/assets/js-libraries/chart.min.js',
    category: 'Charting',
    globalVar: 'Chart'
  },
  {
    id: 'highcharts',
    name: 'Highcharts',
    description: 'Interactive JavaScript charts library',
    cdnUrl: 'https://code.highcharts.com/highcharts.js',
    localUrl: '/assets/js-libraries/highcharts.js',
    category: 'Charting',
    globalVar: 'Highcharts'
  },
  {
    id: 'd3',
    name: 'D3.js',
    description: 'Data visualization library',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js',
    localUrl: '/assets/js-libraries/d3.min.js',
    category: 'Charting',
    globalVar: 'd3'
  },
  {
    id: 'jquery',
    name: 'jQuery',
    description: 'Fast, small JavaScript library',
    cdnUrl: 'https://code.jquery.com/jquery-3.7.1.min.js',
    localUrl: '/assets/js-libraries/jquery.min.js',
    category: 'Utility',
    globalVar: '$'
  },
  {
    id: 'gsap',
    name: 'GSAP',
    description: 'Professional-grade animation library',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js',
    localUrl: '/assets/js-libraries/gsap.min.js',
    category: 'Animation',
    globalVar: 'gsap'
  },
  {
    id: 'threejs',
    name: 'Three.js',
    description: '3D graphics library',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.min.js',
    localUrl: '/assets/js-libraries/three.min.js',
    category: '3D/Graphics',
    globalVar: 'THREE'
  },
  {
    id: 'rxjs',
    name: 'RxJS',
    description: 'Reactive extensions library',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/rxjs@7.8.1/dist/bundles/rxjs.umd.min.js',
    localUrl: '/assets/js-libraries/rxjs.umd.min.js',
    category: 'Reactive',
    globalVar: 'rxjs'
  },
  {
    id: 'ramda',
    name: 'Ramda',
    description: 'Functional programming library',
    cdnUrl: 'https://cdn.jsdelivr.net/npm/ramda@0.29.1/dist/ramda.min.js',
    localUrl: '/assets/js-libraries/ramda.min.js',
    category: 'Functional',
    globalVar: 'R'
  }
];
