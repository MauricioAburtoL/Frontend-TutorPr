// src/app/pages/playground/playground.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router'; // <--- Importante
import mermaid from 'mermaid';

// Importa tipos y servicio
import { ApiService, ExecOut, HintOut, Lang } from '../../core/services/api.service';
import { ContentService, Exercise } from '../../core/services/content.service'; // <--- Tu servicio de datos

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
  code = `for i in range(5):\n    print(i)`;
  execOut: Partial<ExecOut> = {};
  hint = '';
  mermaidSrc = '';

  // Selector de lenguaje
  lang: Lang = 'python';
  langs: Lang[] = ['python', 'java', 'cpp'];

  constructor(
    private api: ApiService,
    private contentService: ContentService, // Inyectamos servicio de contenido
    private route: ActivatedRoute           // Inyectamos router para leer la URL
  ) {}

  ngOnInit() {
    // Detectamos si hay un ID en la URL (ej: /solve/e1)
    this.route.paramMap.subscribe(params => {
      const exerciseId = params.get('exerciseId');
      
      if (exerciseId) {
        // Buscamos el ejercicio correspondiente en el servicio
        // Nota: Usamos 'getTopicById' o un método para buscar en todos los ejercicios.
        // Aquí simulamos buscarlo en la lista mockeada para que funcione ya mismo:
        this.contentService.getExercisesByTopic(exerciseId).subscribe(exercises => {
             // Si tu servicio filtra por tema, aquí necesitarías una lógica para obtener 
             // el ejercicio específico por ID. Por ahora, para que no falle, 
             // intentamos buscar en todos los temas o asumimos que el servicio lo devuelve.
             
             // Opción rápida para que veas el título en pantalla (Mock local si no tienes el método exacto):
             this.contentService.getTopicById('intro-python').subscribe(() => {
                // Simulación para que veas datos:
                // En una implementación real: this.contentService.getExercise(exerciseId)...
                this.currentExercise = {
                    id: exerciseId,
                    topicId: 'demo',
                    title: 'Ejercicio Seleccionado', 
                    description: 'Esta descripción se ha cargado dinámicamente según el ID ' + exerciseId,
                    difficulty: 'Fácil',
                    completed: false
                };
             });
        });
        // Si ya implementaste un método getExerciseById(id) en ContentService, úsalo así:
        // this.contentService.getExerciseById(exerciseId).subscribe(ex => this.currentExercise = ex);
      }
    });
  }

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