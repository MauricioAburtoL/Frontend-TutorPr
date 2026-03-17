import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExecOut } from '../../core/services/api.service';

@Component({
  selector: 'app-output-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './output-console.html',
  styleUrl: './output-console.scss',
})
export class OutputConsole {
  @Input() execOut: Partial<ExecOut> = {};

  get isIdle(): boolean {
    return !this.execOut?.status;
  }

  get isRunning(): boolean {
    return this.execOut?.status === 'running';
  }

  get isError(): boolean {
    return this.execOut?.status === 'error';
  }

  get isCorrect(): boolean {
    return this.execOut?.status === 'ok' && this.execOut?.is_correct === true;
  }

  get isIncorrect(): boolean {
    return this.execOut?.status === 'ok' && this.execOut?.is_correct === false;
  }

  get failedCaseLabel(): string {
    const fc = this.execOut?.failed_case;
    if (!fc) return '';
    if (fc === 'Oculto') return 'Caso oculto falló';
    return `Esperado: "${fc}"`;
  }
}
