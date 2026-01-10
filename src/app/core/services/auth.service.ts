import { Injectable } from '@angular/core';
import { of, delay, Observable } from 'rxjs';

// Definimos los tipos de usuario para evitar errores
export type UserRole = 'student' | 'tutor' | 'guest';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio esté disponible en toda la app
})
export class AuthService {

  constructor() { }

  // Simulación de Login (MOCK)
  // En el futuro, aquí harás el http.post a tu FastAPI
  login(username: string, password: string): Observable<{ success: boolean, role: UserRole }> {
    
    // Lógica simulada para pruebas rápidas
    if (username === 'profe' && password === '123') {
      return of({ success: true, role: 'tutor' as UserRole }).pipe(delay(1000));
    } 
    
    if (username === 'alumno' && password === '123') {
      return of({ success: true, role: 'student' as UserRole }).pipe(delay(1000));
    }

    return of({ success: false, role: 'guest' as UserRole }).pipe(delay(1000));
  }
}