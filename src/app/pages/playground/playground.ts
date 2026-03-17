// src/app/pages/playground/playground.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ApiService, ExecOut, HintOut, DetectedError, Lang, CfgNode } from '../../core/services/api.service';
import { ContentService, Exercise } from '../../core/services/content.service';

// Feature components (standalone)
import { CodeEditor } from '../../features/code-editor/code-editor';
import { OutputConsole } from '../../features/output-console/output-console';
import { HintPanel } from '../../features/hint-panel/hint-panel';
import { CfgViewer } from '../../features/cfg-viewer/cfg-viewer';

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, CodeEditor, OutputConsole, HintPanel, CfgViewer],
  templateUrl: './playground.html',
  styleUrls: ['./playground.scss'],
})
export class Playground implements OnInit {
  currentExercise: Exercise | undefined;
  code = '';
  execOut: Partial<ExecOut> = {};
  hints: string[] = [];
  currentHintIndex = -1;
  hint = '';
  hasMoreHints = false;
  mermaidSrc = '';
  detectedErrors: DetectedError[] = [];

  cfgNodes: CfgNode[] = [];
  cfgHighlightLines: { from: number; to: number } | null = null;

  cfgLoading = false;
  hintLoading = false;
  runLoading = false;

  lang: Lang = 'python';
  langs: Lang[] = ['python', 'java', 'cpp'];

  constructor(
    private api: ApiService,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const exerciseId = params.get('exerciseId');
      if (exerciseId) {
        this.resetState(); // Limpiamos consola y pistas al cambiar de ejercicio
        this.loadExercise(exerciseId);
      }
    });
  }

  get canGoPrev(): boolean {
    return this.currentHintIndex > 0;
  }

  get canGoNext(): boolean {
    return this.currentHintIndex < this.hints.length - 1;
  }

  goToHint(index: number) {
    this.currentHintIndex = index;
    this.hint = this.hints[index] ?? '';
  }

  private resetState() {
    this.execOut = {};
    this.hints = [];
    this.currentHintIndex = -1;
    this.hint = '';
    this.hasMoreHints = false;
    this.mermaidSrc = '';
    this.detectedErrors = [];
    this.cfgNodes = [];
    this.cfgHighlightLines = null;
    this.cfgLoading = false;
    this.hintLoading = false;
    this.runLoading = false;
  }

  private loadExercise(id: string) {
    this.contentService.getExerciseById(id).subscribe({
      next: (ex) => {
        if (ex) {
          this.currentExercise = { ...ex };
          this.code = (ex as any).baseCode || `# Solución para: ${this.currentExercise?.title}\n`;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al cargar ejercicio:', err)
    });
  }

  onCodeChange(newCode: string) {
    this.code = newCode;
    this.detectedErrors = [];
  }

  // --- LÓGICA DE EJECUCIÓN CON VALIDACIÓN ---
  onRun() {
    if (!this.currentExercise || this.runLoading) return;

    this.runLoading = true;
    this.execOut = { stdout: 'Ejecutando y validando...', status: 'running' };

    this.api.run(this.code, this.lang, this.currentExercise.id).subscribe({
      next: (res: any) => {
        this.execOut = res || {};
        this.runLoading = false;

        // Verificación Pedagógica (is_correct viene del nuevo execute.py)
        if (res.is_correct) {
          this.currentExercise!.completed = true;
          console.log("¡Éxito pedagógico detectado!");
        } else if (res.status === 'ok' && !res.is_correct) {
          console.warn("Código válido, pero lógica incorrecta para este ejercicio.");
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.execOut = { status: 'error', stderr: 'Error de conexión con el servidor.' };
        this.runLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onHint() {
    if (!this.currentExercise || this.hintLoading) return;
    this.hintLoading = true;
    this.api.hint(this.code, this.execOut, this.lang, this.currentExercise.id).subscribe({
      next: (r: HintOut) => {
        const newHint = r?.hint ?? '';
        if (newHint) {
          this.hints.push(newHint);
          this.goToHint(this.hints.length - 1);
        }
        this.hasMoreHints = r?.has_more_hints ?? false;
        this.detectedErrors = r?.detected_errors ?? [];
        this.hintLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Error al obtener pista:", err);
        this.hintLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPrevHint() {
    if (this.canGoPrev) this.goToHint(this.currentHintIndex - 1);
  }

  onNextHint() {
    if (this.currentHintIndex < this.hints.length - 1) {
      this.goToHint(this.currentHintIndex + 1);
    }
  }

  onCFG() {
    if (this.cfgLoading) return;
    this.cfgLoading = true;
    this.api.cfg(this.lang, this.code, this.currentExercise?.id).subscribe({
      next: (r) => {
        this.mermaidSrc = r?.mermaid ?? '';
        this.cfgNodes = r?.nodes ?? [];
        this.cfgHighlightLines = null;
        this.cfgLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cfgLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onNodeHover(range: { from: number; to: number } | null) {
    this.cfgHighlightLines = range;
  }

  /**
   * Navega al siguiente ejercicio disponible
   * Útil para mantener el flujo de aprendizaje (Flow state)
   */
  goToNext() {
    if (!this.currentExercise) return;

    // Lógica simple: extraer el número del ID (ej: e1 -> e2)
    const currentIdNum = parseInt(this.currentExercise.id.replace('e', ''));
    const nextId = `e${currentIdNum + 1}`;

    this.router.navigate(['/solve', nextId]);
  }
}