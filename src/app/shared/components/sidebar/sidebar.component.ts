import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToolItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
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
        <ul class="tool-list">
          <li *ngFor="let tool of tools"
              class="tool-item"
              [class.active]="tool.id === activeToolId"
              (click)="selectTool(tool.id)">
            <div class="tool-icon" [innerHTML]="tool.icon"></div>
            <div class="tool-info" *ngIf="!isCollapsed">
              <span class="tool-name">{{ tool.name }}</span>
              <span class="tool-description">{{ tool.description }}</span>
            </div>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer" *ngIf="!isCollapsed">
        <div class="footer-content">
          <p class="footer-text">More tools coming soon!</p>
        </div>
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

    .tool-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .tool-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      margin: 4px 8px;
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

    .tool-name {
      font-size: 0.95rem;
      font-weight: 500;
      color: #e0e0e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      flex-shrink: 0;
    }

    .footer-content {
      text-align: center;
    }

    .footer-text {
      font-size: 0.85rem;
      color: #718096;
      font-style: italic;
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
export class SidebarComponent {
  @Output() toolSelected = new EventEmitter<string>();
  @Output() sidebarToggled = new EventEmitter<boolean>();

  isCollapsed = false;
  activeToolId = 'md-html';

  tools: ToolItem[] = [
    {
      id: 'md-html',
      name: 'Markdown to HTML',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>`,
      description: 'Convert markdown to HTML'
    },
    {
      id: 'js-playground',
      name: 'JavaScript Playground',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
      </svg>`,
      description: 'Run HTML, CSS & JavaScript'
    },
    {
      id: 'json-editor',
      name: 'JSON Editor',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M20 9h2M2 9h2m18 6h2M2 15h2M16.5 3.5l-1 1m-7-1l1 1m-1 13l1-1m7 1l-1-1"/>
      </svg>`,
      description: 'Format & validate JSON'
    }
  ];

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  selectTool(toolId: string): void {
    this.activeToolId = toolId;
    this.toolSelected.emit(toolId);
  }
}
