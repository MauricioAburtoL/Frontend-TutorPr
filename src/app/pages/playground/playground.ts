// src/app/pages/playground/playground.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import mermaid from 'mermaid';

import { ApiService } from '../../core/services/api.service';

// Componentes feature standalone
import { CodeEditor } from '../../features/code-editor/code-editor';
import { OutputConsole } from '../../features/output-console/output-console';
import { HintPanel } from '../../features/hint-panel/hint-panel';
import { CfgViewer } from '../../features/cfg-viewer/cfg-viewer';

mermaid.initialize({ startOnLoad: false });

type Lang = 'python' | 'java' | 'cpp';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditor, OutputConsole, HintPanel, CfgViewer],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class Playground {
  code = `for i in range(5):\n    print(i)`;
  execOut: any = {};
  hint = '';
  mermaidSrc = '';

  // Selector de lenguaje (por defecto python)
  lang: Lang = 'python';
  langs: Lang[] = ['python', 'java', 'cpp'];

  constructor(private api: ApiService) {}

  // Two-way del editor
  onCodeChange(newCode: string) {
    this.code = newCode;
  }

  // Ejecutar código (usa tu ApiService.execute actual)
  onRun() {
    this.api.execute(this.code).subscribe((res: any) => {
      this.execOut = res || {};
    });
  }

  // Pista (usa tu ApiService.hint actual: (code, execOut))
  onHint() {
    this.api.hint(this.code, this.execOut).subscribe((r: any) => {
      this.hint = r?.hint ?? '';
    });
  }

  // CFG (usa tu ApiService.cfg actual: (lang, code))
  onCFG() {
    this.api.cfg(this.lang, this.code).subscribe(async (r: any) => {
      this.mermaidSrc = r?.mermaid ?? '';
      // Si quisieras renderizar a SVG aquí:
      // const { svg } = await mermaid.render('graph1', this.mermaidSrc);
      // this.mermaidSrc = svg;
    });
  }
}
