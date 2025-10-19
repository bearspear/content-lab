import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services';

@Component({
  selector: 'app-markdown-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <iframe #previewFrame
            class="preview-iframe"
            sandbox="allow-same-origin allow-scripts"
            title="Markdown Preview"></iframe>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }

    .preview-iframe {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }
  `]
})
export class MarkdownPreviewComponent implements OnChanges, OnDestroy {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  @Input() htmlContent: string = '';
  @Input() theme: string = 'claude';
  @Input() centerContent: boolean = true;
  @Input() stylePlaintextCode: boolean = false;
  @Input() hideMarkdownCode: boolean = false;
  @Input() hideJavaScriptCode: boolean = false;
  @Input() hideImages: boolean = false;

  private currentBlobUrl: string | null = null;

  constructor(private themeService: ThemeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['htmlContent'] || changes['theme'] || changes['centerContent'] || changes['stylePlaintextCode'] || changes['hideMarkdownCode'] || changes['hideJavaScriptCode'] || changes['hideImages']) {
      this.updateIframe();
    }
  }

  /**
   * Update iframe content with the latest HTML and theme
   */
  private updateIframe(): void {
    setTimeout(() => {
      const iframe = this.previewFrame?.nativeElement;
      if (!iframe) return;

      // Revoke previous blob URL to free memory and ensure clean slate
      if (this.currentBlobUrl) {
        URL.revokeObjectURL(this.currentBlobUrl);
        this.currentBlobUrl = null;
      }

      const fullHtml = this.themeService.generateFullHtml(this.htmlContent, this.theme, this.centerContent, this.stylePlaintextCode, this.hideMarkdownCode, this.hideJavaScriptCode, this.hideImages);
      const blob = new Blob([fullHtml], { type: 'text/html' });
      this.currentBlobUrl = URL.createObjectURL(blob);
      iframe.src = this.currentBlobUrl;
    }, 0);
  }

  /**
   * Manually trigger iframe update (can be called from parent)
   */
  refresh(): void {
    this.updateIframe();
  }

  /**
   * Cleanup on component destroy
   */
  ngOnDestroy(): void {
    if (this.currentBlobUrl) {
      URL.revokeObjectURL(this.currentBlobUrl);
      this.currentBlobUrl = null;
    }
  }
}
