import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- NECESARIO para *ngIf, *ngFor y slice
import { RouterLink } from '@angular/router';
import { ContentService, UserStats } from '../../core/services/content.service'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule], // <--- Agregamos CommonModule aquí
  templateUrl: './home-component.html', // Verifica que este nombre coincida con tu archivo real
  styleUrl: './home-component.scss'
})
export class HomeComponent implements OnInit {
  userStats: UserStats | null = null;

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.contentService.getUserStats().subscribe(data => {
      this.userStats = data;
    });
  }
}