import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, map, switchMap, shareReplay } from 'rxjs'; // <--- Operadores esenciales
import { ContentService, Exercise, Topic } from '../../core/services/content.service';

@Component({
  selector: 'app-exercise-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './exercise-list-component.html',
  styleUrl: './exercise-list-component.scss'
})
export class ExerciseListComponent implements OnInit {
  // 1. Definimos los flujos de datos como Observables
  // Esto permite usar el pipe async en el HTML y evita el error de "vista no actualizada"
  topic$!: Observable<Topic | undefined>;
  exercises$!: Observable<Exercise[]>;

  constructor(
    private route: ActivatedRoute,
    private contentService: ContentService
  ) {}

  ngOnInit() {
    /**
     * 2. Creamos un flujo para el ID del tema extraído de la URL.
     * El operador 'map' soluciona el error: "Argument of type '{}' is not assignable to parameter of type 'string'"
     * transformando el objeto paramMap en un string puro.
     */
    const topicId$ = this.route.paramMap.pipe(
      map(params => params.get('topicId') ?? ''), // Extraemos el ID como string
      shareReplay(1) // Compartimos el resultado para no hacer peticiones dobles al backend
    );

    // 3. Obtenemos la información del tema usando el ID
    this.topic$ = topicId$.pipe(
      switchMap(id => this.contentService.getTopicById(id))
    );

    // 4. Obtenemos la lista de ejercicios usando el mismo ID
    this.exercises$ = topicId$.pipe(
      switchMap(id => this.contentService.getExercisesByTopic(id))
    );
  }
}