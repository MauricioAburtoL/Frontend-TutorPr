import { Component, ElementRef, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-cfg-viewer',
  standalone: true,
  imports: [],
  templateUrl: './cfg-viewer.html',
  styleUrl: './cfg-viewer.scss',
})
export class CfgViewer implements OnChanges, OnDestroy {
  @Input() mermaidSrc = '';
  private host = inject(ElementRef);
  private platformId = inject(PLATFORM_ID);

  // Zoom & pan state
  private scale = 1;
  private translateX = 0;
  private translateY = 0;
  private isPanning = false;
  private startX = 0;
  private startY = 0;

  // Bound listeners (for cleanup)
  private boundWheel: ((e: WheelEvent) => void) | null = null;
  private boundMouseDown: ((e: MouseEvent) => void) | null = null;
  private boundMouseMove: ((e: MouseEvent) => void) | null = null;
  private boundMouseUp: ((e: MouseEvent) => void) | null = null;

  async ngOnChanges() {
    if (!this.mermaidSrc) return;
    if (!isPlatformBrowser(this.platformId)) return;

    // Reset transform on new diagram
    this.scale = 1;
    this.translateX = 0;
    this.translateY = 0;

    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({ startOnLoad: false });

    const el: HTMLElement = this.host.nativeElement.querySelector('#diagram');
    const { svg } = await mermaid.render('graph1', this.mermaidSrc);
    el.innerHTML = svg;

    // Make SVG fill container for better zoom behavior
    const svgEl = el.querySelector('svg');
    if (svgEl) {
      svgEl.style.maxWidth = 'none';
      svgEl.style.height = 'auto';
    }

    this.applyTransform(el);
    this.attachListeners(el);
  }

  private applyTransform(el: HTMLElement) {
    el.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
    el.style.transformOrigin = 'center center';
  }

  private attachListeners(el: HTMLElement) {
    this.removeListeners();

    const container: HTMLElement = this.host.nativeElement.querySelector('.diagram-container');
    if (!container) return;

    // Zoom with mouse wheel
    this.boundWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.scale = Math.min(Math.max(0.2, this.scale + delta), 5);
      this.applyTransform(el);
    };
    container.addEventListener('wheel', this.boundWheel, { passive: false });

    // Pan with mouse drag
    this.boundMouseDown = (e: MouseEvent) => {
      this.isPanning = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      container.style.cursor = 'grabbing';
    };

    this.boundMouseMove = (e: MouseEvent) => {
      if (!this.isPanning) return;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.applyTransform(el);
    };

    this.boundMouseUp = () => {
      this.isPanning = false;
      container.style.cursor = 'grab';
    };

    container.addEventListener('mousedown', this.boundMouseDown);
    window.addEventListener('mousemove', this.boundMouseMove);
    window.addEventListener('mouseup', this.boundMouseUp);
  }

  private removeListeners() {
    const container: HTMLElement | null = this.host.nativeElement.querySelector('.diagram-container');
    if (this.boundWheel && container) {
      container.removeEventListener('wheel', this.boundWheel);
    }
    if (this.boundMouseDown && container) {
      container.removeEventListener('mousedown', this.boundMouseDown);
    }
    if (this.boundMouseMove) {
      window.removeEventListener('mousemove', this.boundMouseMove);
    }
    if (this.boundMouseUp) {
      window.removeEventListener('mouseup', this.boundMouseUp);
    }
  }

  ngOnDestroy() {
    this.removeListeners();
  }
}
