import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
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
  styles: []
})
export class MarkdownPreviewComponent implements OnChanges {
  @ViewChild('previewFrame') previewFrame!: ElementRef<HTMLIFrameElement>;

  @Input() htmlContent: string = '';
  @Input() theme: string = 'claude';

  constructor(private themeService: ThemeService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['htmlContent'] || changes['theme']) {
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

      const fullHtml = this.themeService.generateFullHtml(this.htmlContent, this.theme);
      const blob = new Blob([fullHtml], { type: 'text/html' });
      iframe.src = URL.createObjectURL(blob);
    }, 0);
  }

  /**
   * Manually trigger iframe update (can be called from parent)
   */
  refresh(): void {
    this.updateIframe();
  }
}
