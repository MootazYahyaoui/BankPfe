import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from './auth-state.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const adminGuard: CanMatchFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return auth.userKind() === 'admin' ? true : router.createUrlTree(['/client']);
};

export const clientGuard: CanMatchFn = () => {
  const auth = inject(AuthStateService);
  const router = inject(Router);
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }
  return auth.userKind() === 'client' ? true : router.createUrlTree(['/admin']);
};
