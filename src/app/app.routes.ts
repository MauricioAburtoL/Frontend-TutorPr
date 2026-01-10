import { Routes } from '@angular/router';
import { Playground } from './pages/playground/playground';
import { HomeComponent } from './pages/home-component/home-component';
import { LoginComponent } from './pages/login-component/login-component';
import { TopicListComponent } from './pages/topic-list-component/topic-list-component';
import { ExerciseListComponent } from './pages/exercise-list-component/exercise-list-component';

export const routes: Routes = [ 
  { path: 'login', component: LoginComponent },


  // TUTOR (Placeholder por ahora)
  { path: 'tutor-dashboard', component: HomeComponent },

  { path: 'home', component: HomeComponent },
  { path: 'playground', component: Playground },

  { path: 'topics', component: TopicListComponent },

  { path: 'topics/:topicId', component: ExerciseListComponent },

  { path: '', component: LoginComponent },
  { path: '**', redirectTo: '' },
];