import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para *ngFor
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
  topics: Topic[] = [];

  constructor(private contentService: ContentService) {}

  ngOnInit(): void {
    // Cargamos los temas al iniciar
    this.contentService.getTopics().subscribe(data => {
      this.topics = data;
    });
  }
}