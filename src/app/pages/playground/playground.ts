// src/app/pages/playground/playground.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import mermaid from 'mermaid';

// Importa tipos y servicio
import { ApiService, ExecOut, HintOut, Lang } from '../../core/services/api.service';
import { ContentService, Exercise } from '../../core/services/content.service';

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
export class Playground implements OnInit {
  currentExercise: Exercise | undefined;
  code = '';
  execOut: Partial<ExecOut> = {};
  hint = '';
  mermaidSrc = '';

  // Selector de lenguaje
  lang: Lang = 'python';
  langs: Lang[] = ['python', 'java', 'cpp'];

  constructor(
    private api: ApiService,
    private contentService: ContentService,
    private route: ActivatedRoute,
    private router: Router // Agregado para navegación
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

  private resetState() {
    this.execOut = {};
    this.hint = '';
    this.mermaidSrc = '';
  }

  private loadExercise(id: string) {
    this.contentService.getExerciseById(id).subscribe({
      next: (ex) => {
        console.log('Ejercicio recibido:', ex); // 👈 Agrega este log para debuguear
        if (ex) {
          this.currentExercise = { ...ex };
          // Cambiamos 'ex.title' por 'currentExercise?.title' para mayor seguridad
          this.code = (ex as any).baseCode || `# Solución para: ${this.currentExercise?.title}\n`;
        }
      },
      error: (err) => console.error('Error al cargar ejercicio:', err)
    });
  }

  onCodeChange(newCode: string) {
    this.code = newCode;
  }

  // --- LÓGICA DE EJECUCIÓN CON VALIDACIÓN ---
  onRun() {
    if (!this.currentExercise) return;

    // Heurística #1: El usuario debe saber que el sistema está trabajando
    this.execOut = { stdout: 'Ejecutando y validando...', status: 'running' };

    this.api.run(this.code, this.lang, this.currentExercise.id).subscribe({
      next: (res: any) => {
        this.execOut = res || {};

        // Verificación Pedagógica (is_correct viene del nuevo execute.py)
        if (res.is_correct) {
          this.currentExercise!.completed = true;
          // Feedback de éxito (Puede ser un Toast o Modal en lugar de alert para mejor UX)
          console.log("¡Éxito pedagógico detectado!");
        } else if (res.status === 'ok' && !res.is_correct) {
          // El código no falló técnicamente, pero no cumple el objetivo
          console.warn("Código válido, pero lógica incorrecta para este ejercicio.");
        }
      },
      error: (err) => {
        this.execOut = { status: 'error', stderr: 'Error de conexión con el servidor.' };
      }
    });
  }
  // src/app/pages/playground/playground.ts

  onHint() {
    if (!this.currentExercise) return;

    // Ahora pasamos los 4 parámetros: code, execOut, lang y el ID del ejercicio
    this.api.hint(
      this.code,
      this.execOut,
      this.lang,
      this.currentExercise.id // <--- Este es el argumento que falta
    ).subscribe({
      next: (r: HintOut) => {
        this.hint = r?.hint ?? '';
      },
      error: (err) => {
        console.error("Error al obtener pista:", err);
      }
    });
  }

  // onHint() {
  //   this.api.hint(this.code, this.execOut, this.lang).subscribe((r: HintOut) => {
  //     this.hint = r?.hint ?? '';
  //   });
  // }

  //   onHint() {
  //   if (!this.currentExercise) return;

  //   // Pasamos: código, resultado previo, lenguaje e ID del ejercicio
  //   this.api.hint(
  //     this.code, 
  //     this.execOut, 
  //     this.lang, 
  //     this.currentExercise.id // 👈 Crucial para evitar el 422
  //   ).subscribe({
  //     next: (r: HintOut) => {
  //       this.hint = r?.hint ?? '';
  //     },
  //     error: (err) => {
  //       console.error("Error al obtener pista:", err);
  //     }
  //   });
  // }

  onCFG() {
    this.api.cfg(this.lang, this.code).subscribe(async (r) => {
      this.mermaidSrc = r?.mermaid ?? '';
    });
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