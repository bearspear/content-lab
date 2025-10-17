import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MonacoThemeService, MonacoTheme } from '../../../core/services/monaco-theme.service';
import { Subject, takeUntil } from 'rxjs';

export interface ToolItem {
  id: string;
  name: string;
  route: string;
  icon: string;
  description: string;
  badge?: string;
  badgeClass?: string;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  tools: ToolItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="isCollapsed">
      <div class="sidebar-header">
        <div class="logo" *ngIf="!isCollapsed">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
          <span class="app-name">Dev Tools</span>
        </div>
        <button class="toggle-btn"
                (click)="toggleSidebar()"
                [attr.aria-label]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
                [title]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path *ngIf="!isCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            <path *ngIf="isCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="category-list">
          <div *ngFor="let category of categories" class="category">
            <div class="category-header"
                 (click)="toggleCategory(category.id)"
                 [class.collapsed]="isCategoryCollapsed(category.id)">
              <div class="category-icon" [innerHTML]="category.icon"></div>
              <span class="category-name" *ngIf="!isCollapsed">{{ category.name }}</span>
              <svg *ngIf="!isCollapsed" class="category-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul class="tool-list" *ngIf="!isCategoryCollapsed(category.id) && !isCollapsed">
              <li *ngFor="let tool of category.tools"
                  class="tool-item"
                  [routerLink]="tool.route"
                  routerLinkActive="active">
                <div class="tool-icon" [innerHTML]="tool.icon"></div>
                <div class="tool-info">
                  <div class="tool-name-wrapper">
                    <span class="tool-name">{{ tool.name }}</span>
                    <span *ngIf="tool.badge" [class]="'badge ' + (tool.badgeClass || '')" [title]="'Work in Progress'">{{ tool.badge }}</span>
                  </div>
                  <span class="tool-description">{{ tool.description }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="theme-toggle-btn"
                (click)="toggleGlobalTheme()"
                [title]="currentTheme === 'vs' ? 'Switch to dark theme' : 'Switch to light theme'">
          <svg *ngIf="currentTheme === 'vs-dark'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <svg *ngIf="currentTheme === 'vs'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <span *ngIf="!isCollapsed" class="theme-label">{{ currentTheme === 'vs' ? 'Dark Mode' : 'Light Mode' }}</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      width: 280px;
      background: linear-gradient(180deg, #1a1d29 0%, #14161f 100%);
      color: #e0e0e0;
      display: flex;
      flex-direction: column;
      transition: width 0.3s ease, transform 0.3s ease;
      z-index: 1000;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .logo svg {
      width: 28px;
      height: 28px;
      color: #4299e1;
    }

    .app-name {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .toggle-btn svg {
      width: 20px;
      height: 20px;
      color: #a0aec0;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .toggle-btn:hover svg {
      color: #e0e0e0;
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 0;
    }

    .sidebar-nav::-webkit-scrollbar {
      width: 6px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: transparent;
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .category-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category {
      margin-bottom: 4px;
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      margin: 0 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .category-header:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .category-icon {
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #4299e1;
      transition: color 0.2s ease;
    }

    .category-icon :deep(svg) {
      width: 20px;
      height: 20px;
    }

    .category-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #cbd5e0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex: 1;
    }

    .category-chevron {
      width: 16px;
      height: 16px;
      color: #a0aec0;
      transition: transform 0.2s ease;
      flex-shrink: 0;
    }

    .category-header.collapsed .category-chevron {
      transform: rotate(-90deg);
    }

    .tool-list {
      list-style: none;
      padding: 0;
      margin: 0 0 8px 0;
    }

    .tool-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px 10px 48px;
      margin: 2px 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .tool-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0;
      background: linear-gradient(180deg, #4299e1 0%, #667eea 100%);
      border-radius: 0 3px 3px 0;
      transition: height 0.2s ease;
    }

    .tool-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .tool-item.active {
      background: rgba(66, 153, 225, 0.15);
    }

    .tool-item.active::before {
      height: 70%;
    }

    .tool-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #a0aec0;
      transition: color 0.2s ease;
    }

    .tool-item:hover .tool-icon,
    .tool-item.active .tool-icon {
      color: #4299e1;
    }

    .tool-icon :deep(svg) {
      width: 24px;
      height: 24px;
    }

    .tool-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;
    }

    .tool-name-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .tool-name {
      font-size: 0.95rem;
      font-weight: 500;
      color: #e0e0e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge {
      font-size: 0.85rem;
      flex-shrink: 0;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.6;
      }
    }

    .badge-wip {
      filter: grayscale(0);
    }

    .tool-description {
      font-size: 0.75rem;
      color: #a0aec0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .tool-item.active .tool-name {
      color: #ffffff;
      font-weight: 600;
    }

    .tool-item.active .tool-description {
      color: #cbd5e0;
    }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .theme-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #e0e0e0;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-toggle-btn svg {
      width: 20px;
      height: 20px;
      color: #4299e1;
      flex-shrink: 0;
    }

    .theme-toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(66, 153, 225, 0.5);
      transform: translateY(-1px);
    }

    .theme-toggle-btn:active {
      transform: translateY(0);
    }

    .theme-label {
      flex: 1;
      text-align: left;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.collapsed {
        transform: translateX(0);
        width: 70px;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  isCollapsed = false;
  collapsedCategories = new Set<string>(['code-dev', 'data-text', 'utilities', 'visualizations', 'games']);
  currentTheme: MonacoTheme = 'vs-dark';
  private destroy$ = new Subject<void>();

  constructor(private monacoThemeService: MonacoThemeService) {}

  categories: ToolCategory[] = [
    {
      id: 'content-design',
      name: 'Content & Design',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>`,
      tools: [
        {
          id: 'md-html',
          name: 'Markdown to HTML',
          route: '/tools/md-html',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>`,
          description: 'Convert markdown to HTML'
        },
        {
          id: 'text-editor',
          name: 'Text Editor',
          route: '/tools/text-editor',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>`,
          description: 'Full-featured text editor'
        },
        {
          id: 'svg-editor',
          name: 'SVG Editor',
          route: '/tools/svg-editor',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>`,
          description: 'Edit & optimize SVG files'
        }
      ]
    },
    {
      id: 'code-dev',
      name: 'Code & Development',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>`,
      tools: [
        {
          id: 'js-playground',
          name: 'JavaScript Playground',
          route: '/tools/js-playground',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
          </svg>`,
          description: 'Run HTML, CSS & JavaScript'
        },
        {
          id: 'json-editor',
          name: 'JSON Editor',
          route: '/tools/json-editor',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M20 9h2M2 9h2m18 6h2M2 15h2M16.5 3.5l-1 1m-7-1l1 1m-1 13l1-1m7 1l-1-1"/>
          </svg>`,
          description: 'Format & validate JSON'
        },
        {
          id: 'regex-tester',
          name: 'RegEx Tester',
          route: '/tools/regex-tester',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>`,
          description: 'Test & debug regex patterns'
        },
        {
          id: 'diff-checker',
          name: 'Diff Checker',
          route: '/tools/diff-checker',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>`,
          description: 'Compare text & code side-by-side'
        }
      ]
    },
    {
      id: 'data-text',
      name: 'Data & Text',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>`,
      tools: [
        {
          id: 'csv-editor',
          name: 'CSV/TSV Editor',
          route: '/tools/csv-editor',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>`,
          description: 'Edit & convert CSV data'
        },
        {
          id: 'word-counter',
          name: 'Word Counter',
          route: '/tools/word-counter',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m0 4v2" />
          </svg>`,
          description: 'Text analytics & readability'
        }
      ]
    },
    {
      id: 'utilities',
      name: 'Utilities',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>`,
      tools: [
        {
          id: 'base64-encoder',
          name: 'Base64 Encoder',
          route: '/tools/base64-encoder',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>`,
          description: 'Encode/decode Base64 strings'
        },
        {
          id: 'world-clock',
          name: 'World Clock',
          route: '/tools/world-clock',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2"/>
            <polyline points="12 6 12 12 16 14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`,
          description: 'View time across time zones'
        }
      ]
    },
    {
      id: 'visualizations',
      name: 'Visualizations',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="2" stroke-linecap="round"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2" stroke-linecap="round"/>
      </svg>`,
      tools: [
        {
          id: 'timeline-visualizer',
          name: 'Timeline Visualizer',
          route: '/tools/timeline-visualizer',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>`,
          description: 'Create interactive timelines',
          badge: '🚧',
          badgeClass: 'badge-wip'
        },
        {
          id: 'globe-visualizer',
          name: '3D Worlds Visualizer',
          route: '/tools/globe-visualizer',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" stroke-linecap="round"/>
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke-width="2" stroke-linecap="round"/>
          </svg>`,
          description: 'Interactive 3D globe with pins',
          badge: '🚧',
          badgeClass: 'badge-wip'
        }
      ]
    },
    {
      id: 'games',
      name: 'Games',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v7h7V4zM20 4h-7v7h7V4zM11 13H4v7h7v-7zM20 13h-7v7h7v-7z" />
      </svg>`,
      tools: [
        {
          id: 'tetris',
          name: 'Tetris Game',
          route: '/tools/tetris',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H4v7h7V4zM20 4h-7v7h7V4zM11 13H4v7h7v-7zM20 13h-7v7h7v-7z" />
          </svg>`,
          description: 'Classic block puzzle game'
        }
      ]
    }
  ];

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  toggleCategory(categoryId: string): void {
    if (this.collapsedCategories.has(categoryId)) {
      this.collapsedCategories.delete(categoryId);
    } else {
      this.collapsedCategories.add(categoryId);
    }
  }

  isCategoryCollapsed(categoryId: string): boolean {
    return this.collapsedCategories.has(categoryId);
  }

  ngOnInit(): void {
    // Subscribe to theme changes
    this.monacoThemeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleGlobalTheme(): void {
    this.monacoThemeService.toggleTheme();
  }
}
