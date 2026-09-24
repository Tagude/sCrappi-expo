import {
  Component,
  OnInit,
  ChangeDetectorRef,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core'; // 👈 Añadido OnDestroy
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

import { AuthService } from '../../../services/auth/auth.service';
import { environment } from '../../../../environments/environment';

Chart.register(...registerables);

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css',
})
export class HomeDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('cumplimientoChart') cumplimientoChart!: ElementRef;

  nombreUsuario = '';
  apellidoUsuario = '';
  lastEvent = 'Cargando...';
  locationStatus = 'Localizando...';
  alertasPendientes = 0;
  isInside = false;
  hoy: Date = new Date();

  private intervalId: any; // 👈 Para limpiar el reloj al salir
  currentUserRole: any;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    if (user) {
      this.nombreUsuario = user.name;
      this.apellidoUsuario = user.lastName;

      // 1. Capturamos el rol (asegurándonos de que esté en mayúsculas)
      this.currentUserRole = user.role ? user.role.toUpperCase() : 'EMPLOYED';

      // Forzamos que el ID sea numérico para evitar errores en la URL
      this.cargarResumen(Number(user.id));
    }
  }

  ngOnDestroy(): void {
    // 👈 Evita fugas de memoria si el usuario navega a otra página
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  cargarResumen(userId: number) {
    this.http.get<any>(`${environment.apiUrl}/worklogs/summary/${userId}`).subscribe({
      next: (data) => {
        this.lastEvent = data.lastEvent || 'Sin registros';
        this.locationStatus = data.locationStatus || 'Desconocido';
        this.alertasPendientes = data.alertsToday || 0;
        this.isInside = data.inside || false;

        // 🆕 NUEVO CAMBIO: Renderizar el gráfico con datos REALES del backend
        if (data.weeklyProgress && Array.isArray(data.weeklyProgress)) {
          this.renderChart(data.weeklyProgress);
        } else {
          this.renderChart([0, 0, 0, 0, 0, 0, 0]); // Fallback si no hay data
        }

        this.cdr.detectChanges(); // 🆕 NUEVO CAMBIO: Forzar pintado de las barras
      },
      error: (err) => {
        console.error('Error cargando resumen', err);
        this.cdr.detectChanges();
      },
    });
  }

  //Renderchar
  ngAfterViewInit(): void {
    this.renderChart();
  }

  // Declaramos la instancia del chart para poder actualizarla
  chartInstance: any;

  renderChart(datosData: number[] = [0, 0, 0, 0, 0, 0, 0]) {
    if (this.chartInstance) {
      this.chartInstance.destroy(); // Evita duplicados al recargar
    }

    this.chartInstance = new Chart(this.cumplimientoChart.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        datasets: [
          {
            label: '% de Cumplimiento',
            data: datosData, // USAMOS LOS DATOS REALES
            backgroundColor: datosData.map((val) => (val < 90 ? '#fd7e14' : '#0d6efd')), // Naranja si es bajo
            borderRadius: 8,
            barThickness: 25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { display: false },
          },
          x: { grid: { display: false } },
        },
      },
    });
  }
}
