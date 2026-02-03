import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// --- INTERFACES (Se mantienen igual para asegurar la compatibilidad) ---

export interface Exercise {
  id: string;
  topicId: string;
  title: string;
  description: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil';
  completed: boolean;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  totalExercises: number;
  category: string;
  tags: string[];
  estimatedTime: string;
}

export interface Recommendation {
  title: string;
  type: 'review' | 'practice';
  link: string;
}

export interface Skill {
  name: string;
  progress: number;
}

export interface UserStats {
  username: string;
  level: string;
  exercisesCompleted: number;
  studyStreak: number;
  totalHours: number;
  skills: Skill[];
  lastAccessed: {
    exerciseId: string;
    title: string;
    topicName: string;
    progress: number;
  } | null;
  dailyTip: string;
  masteryScore: number;
  weakAreas: string[];
  strongAreas: string[];
  recommendations: Recommendation[];
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  // URL base apuntando a los routers que definimos en FastAPI
  private apiUrl = 'http://localhost:8000/api/kpis';

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los temas desde la base de datos a través del backend.
   */
  getTopics(): Observable<Topic[]> {
    return this.http.get<Topic[]>(`${this.apiUrl}/topics`);
  }

  /**
   * Obtiene los ejercicios asociados a un tema específico.
   * Reemplaza el filtrado manual que hacias en el frontend.
   */
  getExercisesByTopic(topicId: string): Observable<Exercise[]> {
    return this.http.get<Exercise[]>(`${this.apiUrl}/topics/${topicId}/exercises`);
  }

  /**
   * Busca un tema específico.
   */
  getTopicById(topicId: string): Observable<Topic | undefined> {
    return this.getTopics().pipe(
      map(topics => topics.find(t => t.id === topicId))
    );
  }

  /**
   * Recupera las estadísticas, áreas débiles y recomendaciones generadas por el sistema.
   * Por defecto usamos 'student_01', el ID que configuramos en el seed de la DB.
   */
  getUserStats(userId: string = 'student_01'): Observable<UserStats> {
    return this.http.get<UserStats>(`${this.apiUrl}/user/${userId}/stats`);
  }
}