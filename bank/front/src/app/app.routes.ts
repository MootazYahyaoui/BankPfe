import { Routes } from '@angular/router';
import { ServicesDashboardComponent } from './services-dashboard/services-dashboard.component';
import { adminGuard, clientGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'customers',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'services',
    canMatch: [adminGuard],
    component: ServicesDashboardComponent
  },
  {
    path: 'auth',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./auth-dashboard/auth-dashboard.component').then((m) => m.AuthDashboardComponent)
  },
  {
    path: 'accounts',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./accounts-dashboard/accounts-dashboard.component').then(
        (m) => m.AccountsDashboardComponent
      )
  },
  {
    path: 'notifications',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./notifications-dashboard/notifications-dashboard.component').then(
        (m) => m.NotificationsDashboardComponent
      )
  },
  {
    path: 'admin',
    canMatch: [adminGuard],
    loadComponent: () =>
      import('./dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'client',
    canMatch: [clientGuard],
    loadComponent: () => import('./client-space/client-space.component').then((m) => m.ClientSpaceComponent)
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
