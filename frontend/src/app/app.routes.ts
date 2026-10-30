import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { LoginComponent } from './login/login';
import { ParticipantsComponent } from './participants/participants';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'participants/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./participants/participant-form').then((module) => module.ParticipantFormComponent),
  },
  {
    path: 'participants/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./participants/participant-form').then((module) => module.ParticipantFormComponent),
  },
  {
    path: 'participants',
    component: ParticipantsComponent,
    canActivate: [authGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
