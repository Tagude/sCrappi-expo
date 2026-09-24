import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Usuario guardado al iniciar sesión, o null si no hay sesión. */
function usuarioEnSesion(): { role?: string } | null {
  const dato = localStorage.getItem('usuarioSesion');
  if (!dato) return null;
  try {
    return JSON.parse(dato);
  } catch {
    return null;
  }
}

/** Solo deja entrar al dashboard con una sesión iniciada; si no, manda al login. */
export const authGuard: CanActivateFn = () => {
  const router = inject(Router);

  if (usuarioEnSesion()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};

/**
 * Restringe una ruta a ciertos roles (p. ej. Administración y Reportes a ADMIN y SUPERVISOR).
 * Un empleado que escriba la URL a mano vuelve al inicio del dashboard.
 */
export const roleGuard =
  (...roles: string[]): CanActivateFn =>
  () => {
    const router = inject(Router);
    const rol = usuarioEnSesion()?.role?.toUpperCase() ?? '';

    if (roles.includes(rol)) {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  };
