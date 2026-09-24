import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorklogService } from '../../../services/worklog/worklog.service';
import { UserService, User } from '../../../services/user/user.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class ReportsComponent implements OnInit {
  listaEmpleados: User[] = [];
  todosLosLogs: any[] = [];
  reporteFiltrado: any[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';
  empleadoSeleccionado: string = '';
  cargando: boolean = false;

  constructor(
    private worklogService: WorklogService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.cargarEmpleados();
    this.cargarTodosLosLogs();
  }

  private cargarEmpleados() {
    this.userService.getUsers().subscribe({
      next: (users) => (this.listaEmpleados = users),
      error: (err) => console.error('Error cargando empleados:', err),
    });
  }

  private cargarTodosLosLogs() {
    this.cargando = true;
    this.worklogService.obtenerTodosLosWorklogs().subscribe({
      next: (logs) => {
        this.todosLosLogs = logs.sort(
          (a, b) => new Date(b.hourCheckIn).getTime() - new Date(a.hourCheckIn).getTime(),
        );
        this.reporteFiltrado = this.todosLosLogs;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando registros:', err);
        this.cargando = false;
      },
    });
  }

  generarReporte() {
    let filtrado = [...this.todosLosLogs];

    if (this.empleadoSeleccionado) {
      filtrado = filtrado.filter((log) => log.user?.id == this.empleadoSeleccionado);
    }

    if (this.fechaInicio) {
      const inicio = new Date(this.fechaInicio + 'T00:00:00');
      filtrado = filtrado.filter((log) => new Date(log.hourCheckIn) >= inicio);
    }

    if (this.fechaFin) {
      const fin = new Date(this.fechaFin + 'T23:59:59');
      filtrado = filtrado.filter((log) => new Date(log.hourCheckIn) <= fin);
    }

    this.reporteFiltrado = filtrado;
  }

  exportarExcel() {
    const datos = this.reporteFiltrado.map((log) => ({
      Fecha: new Date(log.hourCheckIn).toLocaleDateString('es-CO'),
      Empleado: `${log.user?.name ?? ''} ${log.user?.lastName ?? ''}`.trim(),
      Entrada: new Date(log.hourCheckIn).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      Salida: log.hourCheckOut
        ? new Date(log.hourCheckOut).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : 'Sin registrar',
      'Ubicación Entrada': `${log.latitudeIn?.toFixed(4)}, ${log.longitudeIn?.toFixed(4)}`,
      'Estado Geovalla': log.complete ? 'CUMPLIDO' : 'PENDIENTE',
    }));

    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
    XLSX.writeFile(wb, `reporte_asistencia_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  getBadgeClass(complete: boolean): string {
    return complete ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning';
  }
}
