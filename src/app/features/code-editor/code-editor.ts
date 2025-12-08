import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-editor.html',
  styleUrls: ['./code-editor.scss'],
})
export class CodeEditor {
  @Input() code = '';
  @Output() codeChange = new EventEmitter<string>();
  @Output() run  = new EventEmitter<void>();
  @Output() hint = new EventEmitter<void>();
  @Output() cfg  = new EventEmitter<void>();

  onInput(e: Event) {
    const v = (e.target as HTMLTextAreaElement).value;
    this.codeChange.emit(v);
  }

  emitRun()  { this.run.emit(); }
  emitHint() { this.hint.emit(); }
  emitCFG()  { this.cfg.emit(); } // el padre decide el lenguaje, p.ej. 'python'
}
