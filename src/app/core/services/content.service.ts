import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

// 1. Definimos la interfaz para un Ejercicio
export interface Exercise {
  id: string;
  topicId: string; // Para saber a qué tema pertenece
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
}

@Injectable({
  providedIn: 'root'
})
export class ContentService {

  private mockTopics: Topic[] = [
      // ... (Tus temas actuales déjalos igual) ...
      {
        id: 'intro-python',
        title: 'Introducción a Python',
        description: 'Variables, Tipos de Datos y Operadores Básicos.',
        icon: '🐍',
        progress: 100,
        totalExercises: 5
      },
      {
        id: 'control-flujo',
        title: 'Control de Flujo',
        description: 'Toma de decisiones con If, Else y Elif.',
        icon: '🔀',
        progress: 40,
        totalExercises: 10
      },
      // ... resto de temas
  ];

  // 2. Agregamos los ejercicios falsos
  private mockExercises: Exercise[] = [
    // Ejercicios para Intro Python
    { id: 'e1', topicId: 'intro-python', title: 'Hola Mundo', description: 'Imprime tu primer mensaje en consola.', difficulty: 'Fácil', completed: true },
    { id: 'e2', topicId: 'intro-python', title: 'Variables Numéricas', description: 'Crea variables y suma dos números.', difficulty: 'Fácil', completed: true },
    
    // Ejercicios para Control de Flujo
    { id: 'e3', topicId: 'control-flujo', title: 'Es mayor de edad', description: 'Usa if/else para verificar una edad.', difficulty: 'Fácil', completed: true },
    { id: 'e4', topicId: 'control-flujo', title: 'Calculadora de Descuentos', description: 'Aplica descuentos según el monto de compra.', difficulty: 'Medio', completed: false },
    { id: 'e5', topicId: 'control-flujo', title: 'El semáforo', description: 'Decide qué hacer según el color.', difficulty: 'Fácil', completed: false },

    // Ejercicios para Ciclos
    { id: 'e6', topicId: 'ciclos', title: 'Contador del 1 al 10', description: 'Usa un ciclo for básico.', difficulty: 'Fácil', completed: false },
  ];

  constructor() { }

  getTopics(): Observable<Topic[]> {
    return of(this.mockTopics);
  }

  // 3. NUEVO MÉTODO: Filtrar ejercicios por tema
  getExercisesByTopic(topicId: string): Observable<Exercise[]> {
    const filtered = this.mockExercises.filter(ex => ex.topicId === topicId);
    return of(filtered);
  }
  
  // Método auxiliar para obtener el nombre del tema actual
  getTopicById(topicId: string): Observable<Topic | undefined> {
      return of(this.mockTopics.find(t => t.id === topicId));
  }
}