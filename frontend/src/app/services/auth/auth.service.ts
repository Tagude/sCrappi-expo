import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'currentUser';

  // Guarda el objeto User completo tras un login exitoso
  setSession(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Recupera el usuario para que el componente de Marcaje obtenga el ID
  getUser(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Finaliza la sesión
  logout(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Verifica si hay una sesión activa
  isLoggedIn(): boolean {
    return !!this.getUser();
  }
}