import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

import { EditorState, StateEffect, StateField, RangeSet } from '@codemirror/state';
import {
  EditorView,
  Decoration,
  DecorationSet,
  hoverTooltip,
  GutterMarker,
  gutter,
  Tooltip,
  ViewUpdate,
} from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';

import { DetectedError } from '../../core/services/api.service';
import type { Lang } from '../../core/services/api.service';

// --- CodeMirror extensions for error decorations ---

const setErrorsEffect = StateEffect.define<DetectedError[]>();

// --- CodeMirror extensions for CFG line highlight ---

const setCfgHighlightEffect = StateEffect.define<{ from: number; to: number } | null>();

const cfgHighlightDecoration = Decoration.line({ class: 'cm-cfg-highlight-line' });

const cfgHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setCfgHighlightEffect)) {
        if (!effect.value) return Decoration.none;
        const { from, to } = effect.value;
        const doc = tr.state.doc;
        const decos: any[] = [];
        for (let line = from; line <= to; line++) {
          if (line >= 1 && line <= doc.lines) {
            decos.push(cfgHighlightDecoration.range(doc.line(line).from));
          }
        }
        return Decoration.set(decos, true);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Line decoration (background highlight)
const errorLineDecoration = Decoration.line({ class: 'cm-error-line' });
const warningLineDecoration = Decoration.line({ class: 'cm-warning-line' });

// State field that holds the current line decorations
const errorDecorationField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setErrorsEffect)) {
        const errors: DetectedError[] = effect.value;
        const doc = tr.state.doc;
        const decos: any[] = [];

        for (const err of errors) {
          if (err.line >= 1 && err.line <= doc.lines) {
            const lineStart = doc.line(err.line).from;
            const deco = err.type === 'syntax' ? errorLineDecoration : warningLineDecoration;
            decos.push(deco.range(lineStart));
          }
        }

        return Decoration.set(decos, true);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Gutter marker for error lines
class ErrorGutterMarker extends GutterMarker {
  constructor(private errorType: 'syntax' | 'logic') {
    super();
  }
  override toDOM() {
    const el = document.createElement('span');
    el.className = this.errorType === 'syntax' ? 'cm-gutter-error' : 'cm-gutter-warning';
    el.textContent = this.errorType === 'syntax' ? '●' : '▲';
    return el;
  }
}

// State field for gutter markers
const errorGutterField = StateField.define<RangeSet<GutterMarker>>({
  create() {
    return RangeSet.empty;
  },
  update(markers, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setErrorsEffect)) {
        const errors: DetectedError[] = effect.value;
        const doc = tr.state.doc;
        const gutterMarkers: any[] = [];

        for (const err of errors) {
          if (err.line >= 1 && err.line <= doc.lines) {
            const lineStart = doc.line(err.line).from;
            gutterMarkers.push(new ErrorGutterMarker(err.type).range(lineStart));
          }
        }

        return RangeSet.of(gutterMarkers, true);
      }
    }
    return markers;
  },
});

const errorGutter = gutter({
  class: 'cm-error-gutter',
  markers: (view) => view.state.field(errorGutterField),
});

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [],
  templateUrl: './code-editor.html',
  styleUrls: ['./code-editor.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CodeEditor implements OnChanges, OnDestroy {
  @Input() code = '';
  @Input() lang: Lang = 'python';
  @Input() detectedErrors: DetectedError[] = [];
  @Input() highlightLines: { from: number; to: number } | null = null;
  @Output() codeChange = new EventEmitter<string>();

  @ViewChild('editorHost', { static: true })
  editorHost!: ElementRef<HTMLDivElement>;

  private editorView: EditorView | null = null;
  private platformId = inject(PLATFORM_ID);
  private currentErrors: DetectedError[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!this.editorView) {
      this.initEditor();
    }

    // Update code from parent (e.g. loading a new exercise)
    if (changes['code'] && this.editorView) {
      const currentDoc = this.editorView.state.doc.toString();
      if (this.code !== currentDoc) {
        this.editorView.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: this.code },
        });
      }
    }

    // Update error decorations
    if (changes['detectedErrors'] && this.editorView) {
      this.currentErrors = this.detectedErrors || [];
      this.editorView.dispatch({
        effects: setErrorsEffect.of(this.currentErrors),
      });
    }

    // Update CFG line highlight
    if (changes['highlightLines'] && this.editorView) {
      this.editorView.dispatch({
        effects: setCfgHighlightEffect.of(this.highlightLines ?? null),
      });
    }
  }

  private getLanguageExtension() {
    switch (this.lang) {
      case 'java': return java();
      case 'cpp': return cpp();
      default: return python();
    }
  }

  private buildErrorTooltip() {
    return hoverTooltip((view: EditorView, pos: number): Tooltip | null => {
      const line = view.state.doc.lineAt(pos);
      const lineNumber = line.number;
      const error = this.currentErrors.find((e) => e.line === lineNumber);
      if (!error) return null;

      return {
        pos: line.from,
        above: true,
        create() {
          const dom = document.createElement('div');
          dom.className = 'cm-error-tooltip';

          const badge = document.createElement('span');
          badge.className = error.type === 'syntax' ? 'tooltip-badge-error' : 'tooltip-badge-warning';
          badge.textContent = error.type === 'syntax' ? 'Error de sintaxis' : 'Error de logica';

          const desc = document.createElement('span');
          desc.className = 'tooltip-desc';
          desc.textContent = error.desc;

          dom.appendChild(badge);
          dom.appendChild(desc);
          return { dom };
        },
      };
    });
  }

  private initEditor() {
    const updateListener = EditorView.updateListener.of((update: ViewUpdate) => {
      if (update.docChanged) {
        this.codeChange.emit(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: this.code,
      extensions: [
        basicSetup,
        this.getLanguageExtension(),
        errorDecorationField,
        errorGutterField,
        errorGutter,
        cfgHighlightField,
        this.buildErrorTooltip(),
        updateListener,
        EditorView.theme({
          '&': { height: '100%' },
          '.cm-scroller': { overflow: 'auto' },
          '.cm-content': { fontFamily: "'Consolas', 'Fira Code', monospace", fontSize: '14px' },
          '.cm-gutters': {
            backgroundColor: '#1b1b2f',
            color: '#6272a4',
            borderRight: '1px solid #2d2d4a',
          },
          '&.cm-focused .cm-cursor': { borderLeftColor: '#f8f8f2' },
          '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
            backgroundColor: '#44475a',
          },
        }),
      ],
    });

    this.editorView = new EditorView({
      state,
      parent: this.editorHost.nativeElement,
    });

    // Apply initial errors if any
    if (this.detectedErrors?.length) {
      this.currentErrors = this.detectedErrors;
      this.editorView.dispatch({
        effects: setErrorsEffect.of(this.currentErrors),
      });
    }
  }

  ngOnDestroy() {
    this.editorView?.destroy();
  }
}
