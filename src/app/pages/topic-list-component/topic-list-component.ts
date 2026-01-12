import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService, Topic } from '../../core/services/content.service';

@Component({
  selector: 'app-topic-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topic-list-component.html',
  styleUrl: './topic-list-component.scss'
})
export class TopicListComponent implements OnInit {
  allTopics: Topic[] = [];
  filteredTopics: Topic[] = [];
  
  // Categorías disponibles para las pestañas
  categories: string[] = ['Todos', 'Fundamentos', 'Lógica', 'Estructuras'];
  selectedCategory: string = 'Todos';

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    this.contentService.getTopics().subscribe(data => {
      this.allTopics = data;
      this.filterTopics(); // Inicializamos la vista
    });
  }

  // Método para cambiar de pestaña
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.filterTopics();
  }

  // Filtramos la lista según la selección
  filterTopics() {
    if (this.selectedCategory === 'Todos') {
      this.filteredTopics = this.allTopics;
    } else {
      this.filteredTopics = this.allTopics.filter(t => t.category === this.selectedCategory);
    }
  }
}