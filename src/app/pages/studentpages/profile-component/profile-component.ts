import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ContentService, UserStats } from '../../../core/services/content.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-component.html',
  styleUrl: './profile-component.scss'
})
export class ProfileComponent implements OnInit {
  stats: UserStats | null = null;

  constructor(private contentService: ContentService) {}

  ngOnInit() {
    this.contentService.getUserStats().subscribe(data => {
      this.stats = data;
    });
  }
}