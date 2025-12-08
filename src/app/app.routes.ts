import { Routes } from '@angular/router';
import { Playground } from './pages/playground/playground';

export const routes: Routes = [
  { path: '', component: Playground },
  { path: '**', redirectTo: '' },
];
