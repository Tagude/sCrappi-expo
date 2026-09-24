import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 🔑 Aquí verificamos la sesión
  const usuarioSesion = localStorage.getItem('usuarioSesion'); // O como llames a tu key en localStorage

  if (usuarioSesion) {
    return true; // Sesión activa, bienvenido
  } else {
    // No hay sesión, rebote al login
    router.navigate(['/login']);
    return false;
  }
};