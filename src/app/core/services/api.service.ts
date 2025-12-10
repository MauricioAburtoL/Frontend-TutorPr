// src/app/core/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Lang = 'python' | 'java' | 'cpp';

export interface ExecOut {
  status: 'ok' | 'error';
  stdout?: string;
  stderr?: string;
  error_type?: string | null;
  runtime_ms?: number | null;
}

export interface HintOut {
  hint: string;
  pattern_id?: string;
  concept?: string;
}

export interface CfgOut { mermaid: string; }

// 👉 tip opcional para no repetir
export interface ExecInPayload {
  user_id: string;
  session_id: string;
  exercise_id: string;
  attempt_id: string;
  code: string;
  lang: Lang;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Helper para generar IDs de prueba
  private attemptId() { return Date.now().toString(); }

  // ⚠️ Enviar TODO lo que tu backend espera (ExecuteIn)
  run(code: string, lang: Lang): Observable<ExecOut> {
    const body: ExecInPayload = {
      user_id:    'demo-user',
      session_id: 'local-session',
      exercise_id:'ex-1',
      attempt_id: this.attemptId(),
      code,
      lang
    };
    return this.http.post<ExecOut>('/api/execute', body);
  }

  // ⚠️ Enviar TODO lo que tu backend espera (HintIn)
  hint(code: string, exec_result: any, lang: Lang): Observable<HintOut> {
    const body = {
      user_id:    'demo-user',
      session_id: 'local-session',
      exercise_id:'ex-1',
      attempt_id: this.attemptId(),
      code,
      exec_result,
      lang
    };
    return this.http.post<HintOut>('/api/hint', body);
  }

  // ✅ ya lo corregiste: usamos /api/cfg/{lang}
  cfg(lang: Lang, code: string): Observable<CfgOut> {
    return this.http.post<CfgOut>(`/api/cfg/${lang}`, { code });
  }
}
