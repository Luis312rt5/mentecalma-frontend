import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkin',
    loadComponent: () =>
      import('./features/checkin/checkin.component').then(m => m.CheckinComponent),
    canActivate: [authGuard]
  },
  {
    path: 'recommendations/:id',
    loadComponent: () =>
      import('./features/recommendations/recommendations.component').then(m => m.RecommendationsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./features/history/history.component').then(m => m.HistoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'stats',
    loadComponent: () =>
      import('./features/stats/stats.component').then(m => m.StatsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];