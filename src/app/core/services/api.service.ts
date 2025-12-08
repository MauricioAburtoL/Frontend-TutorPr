import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  execute(code: string) {
    return this.http.post<any>('/api/execute', { code });
  }

  hint(code: string, exec_result: any) {
    return this.http.post<{ hint: string }>(
      '/api/hint',
      { code, exec_result }
    );
  }

  cfg(lang: 'python'|'java'|'cpp', code: string) {
    return this.http.post<{ mermaid: string }>(
      `/api/ast/cfg/${lang}`, { code }
    );
  }
}
