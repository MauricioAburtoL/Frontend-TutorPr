import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs'; // <--- NUEVOS
import { map } from 'rxjs/operators'; // <--- NUEVO
import { ContentService, Topic } from '../../core/services/content.service';

@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topic-list-component.html',
  styleUrl: './topic-list-component.scss'
})
export class TopicListComponent implements OnInit {
  // 1. Creamos un "sujeto" para manejar la categoría seleccionada de forma reactiva
  private categorySubject = new BehaviorSubject<string>('Todos');
  selectedCategory$ = this.categorySubject.asObservable();

  // 2. Definimos el flujo de los temas filtrados
  filteredTopics$!: Observable<Topic[]>;

  // Categorías estáticas para la vista
  categories: string[] = ['Todos', 'Fundamentos', 'Lógica', 'Estructuras'];

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    // 3. Combinamos el flujo de datos de FastAPI con el flujo de la categoría seleccionada
    // Esto asegura que si cambia la categoría O llegan datos nuevos, la vista se actualice sola.
    this.filteredTopics$ = combineLatest([
      this.contentService.getTopics(),
      this.selectedCategory$
    ]).pipe(
      map(([topics, category]) => {
        if (category === 'Todos') return topics;
        return topics.filter(t => t.category === category);
      })
    );
  }

  // 4. Para cambiar de pestaña, solo emitimos el nuevo valor al "sujeto"
  selectCategory(category: string) {
    this.categorySubject.next(category);
  }
}