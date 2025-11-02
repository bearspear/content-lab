/**
 * EPUB to PDF Plugin Definition
 */

import { FeaturePlugin, FeaturePluginMetadata, ToolCategory } from '@content-lab/plugin-system';

export const metadata: FeaturePluginMetadata = {
  id: 'epub-to-pdf',
  name: 'EPUB to PDF',
  description: 'Convert EPUB books to high-quality PDF',
  version: '1.0.0',
  category: ToolCategory.ContentDesign,
  route: '/tools/epub-to-pdf',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>`,
  badge: 'NEW',
  badgeClass: 'badge-new',
  dependencies: []
};

export const plugin: FeaturePlugin = {
  metadata,
  loadComponent: () => import('./epub-to-pdf.component').then(m => m.EpubToPdfComponent)
};
