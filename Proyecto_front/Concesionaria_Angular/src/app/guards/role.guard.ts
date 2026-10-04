import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.model';

export const RoleGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.initialize();

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }

  const roles = route.data['roles'] as UserRole[] | undefined;
  return !roles?.length || roles.includes(auth.role())
    ? true
    : router.createUrlTree(['/catalogo-publico']);
};