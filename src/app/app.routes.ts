import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '',
    loadChildren: () =>
      import('./protected.routes').then((m) => m.protectedRoutes),
  },
  { path: '**', redirectTo: '' },
];
