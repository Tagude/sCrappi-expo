import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbCollapseModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  isMenuCollapsed = true;
  horaActual: Date = new Date();
  ubicacion: string = 'Esperando acción...';
  usuarioLogueado: any = null;

  // 1. Inyectamos AuthService y Router en el constructor
  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
  ) {}

  currentUserRole: string = '';

  ngOnInit() {
    const dataSesion = localStorage.getItem('usuariosSesion');
    if (dataSesion) {
      const user = JSON.parse(dataSesion);
      this.currentUserRole = user.role ? user.role.toUpperCase() : 'EMPLOYED';
    }
  }

  // 3. Logo inteligente: Si hay sesión, se queda en dashboard.
  irAlInicio(): void {
    if (this.authService.isLoggedIn()) {
      this.isMenuCollapsed = true; // Cerramos el menú móvil si estaba abierto
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  // 4. Logout robusto: Limpia sesión y rompe el historial del navegador
  logout(): void {
    this.authService.logout(); // Limpia el USER_KEY del servicio
    localStorage.removeItem('usuarioSesion'); // Limpia la llave del Guard
    localStorage.clear(); // Limpieza total por seguridad

    // Redirigimos al Login reemplazando la URL actual en el historial
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  // 5. Marcaje (Aquí ya podrías usar this.usuarioLogueado.id)
  marcarAsistencia() {
    if (navigator.geolocation) {
      this.ubicacion = 'Capturando ubicación GPS...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          this.ubicacion = `Marcado en: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

          // Mensaje personalizado con el nombre del usuario logueado
          const nombre = this.usuarioLogueado?.name || 'Usuario';
          alert(`¡${nombre}, marcaje exitoso a las ${this.horaActual.toLocaleTimeString()}!`);
        },
        (err) => {
          this.ubicacion = 'Error: Por favor activa el GPS.';
          console.error('Error de ubicación:', err);
        },
      );
    }
  }
}
