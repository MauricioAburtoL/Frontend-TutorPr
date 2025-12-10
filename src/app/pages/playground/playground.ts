// src/app/pages/playground/playground.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import mermaid from 'mermaid';

// Importa tipos y servicio
import { ApiService, ExecOut, HintOut, Lang } from '../../core/services/api.service';

// Feature components (standalone)
import { CodeEditor } from '../../features/code-editor/code-editor';
import { OutputConsole } from '../../features/output-console/output-console';
import { HintPanel } from '../../features/hint-panel/hint-panel';
import { CfgViewer } from '../../features/cfg-viewer/cfg-viewer';

mermaid.initialize({ startOnLoad: false });

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditor, OutputConsole, HintPanel, CfgViewer],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class Playground {
  code = `for i in range(5):\n    print(i)`;
  execOut: Partial<ExecOut> = {};
  hint = '';
  mermaidSrc = '';

  // Selector de lenguaje
  lang: Lang = 'python';
  langs: Lang[] = ['python', 'java', 'cpp'];

  constructor(private api: ApiService) {}

  // Two-way del editor
  onCodeChange(newCode: string) {
    this.code = newCode;
  }

  // Ejecutar código (envía payload completo con lang)
  onRun() {
    this.api.run(this.code, this.lang).subscribe((res) => {
      this.execOut = res || {};
    });
  }

  // Pedir pista (usa también execOut y lang)
  onHint() {
    this.api.hint(this.code, this.execOut, this.lang).subscribe((r: HintOut) => {
      this.hint = r?.hint ?? '';
    });
  }

  // Generar CFG con el lenguaje seleccionado
  onCFG() {
    this.api.cfg(this.lang, this.code).subscribe(async (r) => {
      this.mermaidSrc = r?.mermaid ?? '';
      // Si prefieres renderizar a SVG aquí:
      // const { svg } = await mermaid.render('graph1', this.mermaidSrc);
      // this.mermaidSrc = svg;
    });
  }
}
