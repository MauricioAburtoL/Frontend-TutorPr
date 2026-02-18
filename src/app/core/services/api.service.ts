import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Lang = 'python' | 'java' | 'cpp';

/**
 * Interfaz de respuesta de ejecución técnica y pedagógica.
 * Refleja los cambios realizados en ExecutionService.py y execute.py.
 */
export interface ExecOut {
  status: 'ok' | 'error' | 'running'; // Añadido 'running' para mejorar UX (Heurística #1)
  stdout: string;
  stderr: string;
  error_type?: string | null;
  runtime_ms?: number | null;
  is_correct?: boolean; // Veredicto de los casos de prueba del backend
  failed_case?: string | null; // Información sobre qué test falló
}

export interface HintOut {
  hint: string;
  pattern_id?: string;
  concept?: string;
}

export interface CfgOut {
  mermaid: string;
}

/**
 * Payload de entrada para la ejecución.
 * Coincide con el esquema 'ExecuteIn' de tu FastAPI.
 */
export interface ExecInPayload {
  user_id: string;
  session_id: string;
  exercise_id: string;
  attempt_id: string;
  code: string;
  lang: Lang;
  duration_ms?: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  // Ajusta esta URL según tu configuración de proxy o entorno
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) { }

  /**
   * Genera un ID de intento basado en el timestamp.
   */
  private attemptId(): string {
    return Date.now().toString();
  }

  /**
   * Ejecuta el código y valida la lógica pedagógica.
   * @param code Código fuente del alumno.
   * @param lang Lenguaje seleccionado.
   * @param exerciseId ID del ejercicio actual (ej. 'e1').
   */
  run(code: string, lang: Lang, exerciseId: string = 'unknown'): Observable<ExecOut> {
    const body: ExecInPayload = {
      user_id: 'student_01', // Usuario demo para tu tesis
      session_id: 'local-session',
      exercise_id: exerciseId,
      attempt_id: this.attemptId(),
      code: code,
      lang: lang,
      duration_ms: 0 // Podrías calcular el tiempo real en el frontend
    };

    return this.http.post<ExecOut>(`${this.baseUrl}/execute`, body);
  }

  // En api.service.ts

  hint(code: string, exec_result: any, lang: Lang, exerciseId: string): Observable<HintOut> {
    const body = {
      user_id: 'student_01',
      session_id: 'local-session',
      exercise_id: exerciseId,
      attempt_id: this.attemptId(),
      code: code,
      lang: lang,                     // Asegúrate de que se llame 'lang'
      // Forzamos que sea un objeto plano para evitar problemas de serialización
      exec_result: JSON.parse(JSON.stringify(exec_result || {}))
    };

    return this.http.post<HintOut>(`${this.baseUrl}/hint`, body);
  }
  /**
   * Genera el Diagrama de Flujo (CFG) para visualización lógica.
   */
  cfg(lang: Lang, code: string): Observable<CfgOut> {
    return this.http.post<CfgOut>(`${this.baseUrl}/cfg/${lang}`, { code });
  }
}