import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { CfgNode } from '../../core/services/api.service';

@Component({
  selector: 'app-cfg-viewer',
  standalone: true,
  imports: [],
  templateUrl: './cfg-viewer.html',
  styleUrl: './cfg-viewer.scss',
})
export class CfgViewer implements OnChanges, OnDestroy {
  @Input() mermaidSrc = '';
  @Input() cfgNodes: CfgNode[] = [];
  @Output() nodeHover = new EventEmitter<{ from: number; to: number } | null>();
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
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background: '#1e1e28',
        mainBkg: '#252530',
        primaryColor: '#2d2b45',
        primaryBorderColor: '#6c63ff',
        primaryTextColor: '#e4e4eb',
        secondaryColor: '#1e1e28',
        secondaryBorderColor: '#5f6070',
        secondaryTextColor: '#9394a0',
        tertiaryColor: '#1a1a24',
        tertiaryBorderColor: '#5f6070',
        tertiaryTextColor: '#9394a0',
        lineColor: '#6c63ff',
        edgeLabelBackground: '#1e1e28',
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: '14px',
        titleColor: '#e4e4eb',
        clusterBkg: '#1a1a24',
        clusterBorder: '#2a2a38',
        nodeBorder: '#6c63ff',
        nodeTextColor: '#e4e4eb',
      },
    });

    const el: HTMLElement = this.host.nativeElement.querySelector('#diagram');
    const cleanSrc = this.sanitizeMermaid(this.mermaidSrc);
    const { svg } = await mermaid.render('graph1', cleanSrc);
    el.innerHTML = svg;

    // Make SVG fill container for better zoom behavior
    const svgEl = el.querySelector('svg');
    if (svgEl) {
      svgEl.style.maxWidth = 'none';
      svgEl.style.height = 'auto';
    }

    this.applyTransform(el);
    this.attachListeners(el);
    this.attachNodeHoverListeners(el);
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

  private sanitizeMermaid(src: string): string {
    // Convierte labels sin comillas que contengan (), __ u otros chars problemáticos
    // al formato seguro ["label"]. Safety net para output de Gemini.
    return src.replace(
      /(\w+)\s*(\[|\{)\s*([^"\]}\[{][^\]}\[{]*)\s*(\]|\})/g,
      (_match, id, _open, label, _close) => {
        const needsQuoting = /[\(\)]|__/.test(label);
        if (!needsQuoting) return _match;
        const safeLabel = label.trim().replace(/"/g, "'");
        return `${id}["${safeLabel}"]`;
      }
    );
  }

  private attachNodeHoverListeners(el: HTMLElement) {
    if (!this.cfgNodes.length) return;
    const svgEl = el.querySelector('svg');
    if (!svgEl) return;

    const nodeMap = new Map(this.cfgNodes.map(n => [n.id, n]));

    svgEl.querySelectorAll<SVGGElement>('g.node').forEach(nodeEl => {
      const match = nodeEl.id.match(/^flowchart-(.+)-\d+$/);
      const nodeId = match?.[1];
      const cfgNode = nodeId ? nodeMap.get(nodeId) : undefined;
      if (!cfgNode || cfgNode.lineno < 1) return;

      nodeEl.style.cursor = 'pointer';
      nodeEl.addEventListener('mouseenter', () => {
        this.nodeHover.emit({ from: cfgNode.lineno, to: cfgNode.end_lineno });
      });
      nodeEl.addEventListener('mouseleave', () => {
        this.nodeHover.emit(null);
      });
    });
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
