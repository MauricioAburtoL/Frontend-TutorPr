import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hint-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hint-panel.html',
  styleUrl: './hint-panel.scss',
})
export class HintPanel {
  @Input() hint: string | null = null;
}
