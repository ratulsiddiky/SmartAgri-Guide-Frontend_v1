import { Routes } from '@angular/router';
import {
  adminGuard,
  adminMatchGuard,
  authChildGuard,
  authMatchGuard,
} from './guards/auth.guard';

export const protectedRoutes: Routes = [
  {
    path: '',
    canMatch: [authMatchGuard],
    canActivateChild: [authChildGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/dashboard/home/home').then((m) => m.Home),
      },
      {
        path: 'farms',
        loadComponent: () =>
          import('./components/farms/farms-list/farms-list').then(
            (m) => m.FarmsList
          ),
      },
      {
        path: 'farms/new',
        loadComponent: () =>
          import('./components/farms/farm-form/farm-form').then(
            (m) => m.FarmForm
          ),
      },
      {
        path: 'farms/:id/edit',
        loadComponent: () =>
          import('./components/farms/farm-form/farm-form').then(
            (m) => m.FarmForm
          ),
      },
      {
        path: 'farms/:id',
        loadComponent: () =>
          import('./components/farms/farm-detail/farm-detail').then(
            (m) => m.FarmDetail
          ),
      },
      {
        path: 'agri-markets',
        loadComponent: () =>
          import('./components/dashboard/agri-markets/agri-markets').then(
            (m) => m.AgriMarkets
          ),
      },
      {
        path: 'admin',
        canMatch: [adminMatchGuard],
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./components/dashboard/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard
          ),
      },
    ],
  },
];
