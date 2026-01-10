import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Importante para el formulario
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.redirectUser(response.role);
        } else {
          this.errorMessage = 'Credenciales incorrectas';
        }
      }
    });
  }

  // AQUÍ ESTÁ LA MAGIA DE LA REDIRECCIÓN
  private redirectUser(role: string) {
    if (role === 'tutor') {
      this.router.navigate(['/tutor-dashboard']); // Vista del profesor
    } else if (role === 'student') {
      this.router.navigate(['/home']); // El menú principal que creamos antes
    }
  }
}