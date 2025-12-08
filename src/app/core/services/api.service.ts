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
  // lo que más devuelva tu backend...
}

export interface HintOut {
  hint: string;
  pattern_id?: string;
  concept?: string;
}

export interface CfgOut {
  mermaid: string;
  // nodes/edges si los envías
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  // Si tu backend necesita también el lenguaje para ejecutar,
  // cambia la firma a execute(code: string, lang: Lang)
  execute(code: string): Observable<ExecOut> {
    return this.http.post<ExecOut>('/api/execute', { code });
  }

  // Si tu backend espera lang en el hint, añade lang aquí y en el body
  hint(code: string, exec_result: any /*, lang?: Lang */): Observable<HintOut> {
    return this.http.post<HintOut>('/api/hint', { code, exec_result /*, lang */ });
  }

  cfg(lang: Lang, code: string): Observable<CfgOut> {
    return this.http.post<CfgOut>(`/api/ast/cfg/${lang}`, { code });
  }
}
