import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { ParticipantsComponent } from './participants/participants';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'participants/new',
    loadComponent: () =>
      import('./participants/participant-form').then((module) => module.ParticipantFormComponent),
  },
  { path: 'participants', component: ParticipantsComponent },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
