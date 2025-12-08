import { Component, ElementRef, Input, OnChanges, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-cfg-viewer',
  standalone: true,
  imports: [],
  templateUrl: './cfg-viewer.html',
  styleUrl: './cfg-viewer.scss',
})
export class CfgViewer implements OnChanges {
  @Input() mermaidSrc = '';
  private host = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  async ngOnChanges() {
    if (!this.mermaidSrc) return;
    if (!isPlatformBrowser(this.platformId)) return;

    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false });
    const el = this.host.nativeElement.querySelector('#diagram');
    const { svg } = await mermaid.render('graph1', this.mermaidSrc);
    el.innerHTML = svg;
  }
}
