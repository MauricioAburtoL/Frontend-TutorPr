import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContentService, Exercise, Topic } from '../../core/services/content.service';

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
    this.route.paramMap.subscribe(params => {
      const topicId = params.get('topicId');
      
      if (topicId) {
        // Obtenemos info del tema
        this.contentService.getTopicById(topicId).subscribe(topic => {
            this.currentTopic = topic;
        });

        // Obtenemos los ejercicios
        this.contentService.getExercisesByTopic(topicId).subscribe(data => {
          this.exercises = data;
        });
      }
    });
  }
}