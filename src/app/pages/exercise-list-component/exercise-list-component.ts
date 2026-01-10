import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, Exercise, Topic } from '../../core/services/content.service'; // Ajusta la ruta

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercise-list-component.html',
  styleUrl: './exercise-list-component.scss'
})
export class ExerciseListComponent implements OnInit {
  exercises: Exercise[] = [];
  currentTopic: Topic | undefined;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService
  ) {}

  ngOnInit() {
    // 1. Obtenemos el ID del tema desde la URL (ej: 'control-flujo')
    this.route.paramMap.subscribe(params => {
      const topicId = params.get('topicId');
      
      if (topicId) {
        // 2. Cargamos la info del tema (para el título)
        this.contentService.getTopicById(topicId).subscribe(topic => {
            this.currentTopic = topic;
        });

        // 3. Cargamos los ejercicios de ese tema
        this.contentService.getExercisesByTopic(topicId).subscribe(data => {
          this.exercises = data;
        });
      }
    });
  }
}