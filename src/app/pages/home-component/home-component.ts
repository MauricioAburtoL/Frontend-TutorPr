import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <--- Importante

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink], // <--- Agregarlo aquí
  templateUrl: './home-component.html',
  styleUrl: './home-component.scss'
})
export class HomeComponent {
  // Aquí pondremos lógica futura, como cargar el nombre del usuario
}