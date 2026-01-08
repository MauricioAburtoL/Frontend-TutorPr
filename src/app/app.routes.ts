import { Routes } from '@angular/router';
import { Playground } from './pages/playground/playground';
import { HomeComponent } from './pages/home-component/home-component';

export const routes: Routes = [ 
  { path: '', component: HomeComponent },
  { path: 'playground', component: Playground },
  { path: '**', redirectTo: '' },
];