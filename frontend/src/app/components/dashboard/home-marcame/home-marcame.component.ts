import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WorklogService } from '../../../services/worklog/worklog.service';
import { AuthService } from '../../../services/auth/auth.service';

import * as L from 'leaflet';
import { distanciaEnMetros } from '../../../utils/geo';

@Component({
  selector: 'app-home-marcame',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-marcame.component.html',
  styleUrl: './home-marcame.component.css',
})
export class HomeMarcameComponent implements OnInit {
  // --- Variables de Estado ---
  horaActual: Date = new Date();
  ubicacionEstado: string = 'Cargando configuración...';
  jornadaActiva: boolean = false;
  idMarcajeActual: number | null = null; // Para el PUT de salida
  historialMarcajes: any[] = []; // 👈 Agrega esta línea
  map: any;
  // --- Datos del Usuario y Alertas ---
  usuarioSesion: any = null;
  mostrarAlertaExito: boolean = false;
  mensajeAlerta: string = '';
  mostrarAlertaError: boolean = false;
  mensajeError: string = '';

  // --- Configuración Dinámica (Geovalla desde DB) ---
  puestoLat: number = 0;
  puestoLon: number = 0;
  radioMaximo: number = 0;

  constructor(
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef,
    private worklogService: WorklogService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // 1. Obtenemos el usuario
    this.usuarioSesion = this.authService.getUser();
    // 2. Cargamos la configuración de la oficina (Geovalla)
    this.cargarConfiguracionGeovalla();
    if (this.usuarioSesion) {
      // Primero, cargamos la lista de marcajes para la tabla
      this.cargarHistorial();
      // Segundo, verificamos si hay una jornada pendiente por cerrar
      this.worklogService.obtenerHistorialPorUsuario(this.usuarioSesion.id).subscribe({
        next: (logs) => {
          const turnoAbierto = logs.find((log) => !log.complete);
          if (turnoAbierto) {
            this.jornadaActiva = true;
            this.idMarcajeActual = turnoAbierto.id;
            this.ubicacionEstado = 'Dentro de jornada (Recuperado)';
            this.cdRef.detectChanges();
          }
        },
      });
    }
    // 3. Reloj en tiempo real
    setInterval(() => {
      this.horaActual = new Date();
      this.cdRef.detectChanges();
    }, 1000);
  }

private initMap() {
  const mapContainer = document.getElementById('map');
  
  // 1. Verificación de seguridad
  if (!mapContainer || this.map) {
    return; 
  }

  // 2. Inicializar el objeto mapa
  this.map = L.map('map').setView([this.puestoLat, this.puestoLon], 16);

  // 3. 🆕 IMPORTANTE: Añadir la capa de imágenes (Tiles)
  // Sin esto, el mapa siempre será gris porque no tiene "dibujos"
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(this.map);

  // 4. Círculo de la geovalla alrededor del puesto
  L.circle([this.puestoLat, this.puestoLon], {
    color: '#0d6efd',
    fillColor: '#0d6efd',
    fillOpacity: 0.2,
    radius: this.radioMaximo, // radio de la estación, en metros
  }).addTo(this.map);

  // 5. 🆕 EL TRUCO FINAL: Forzar el renderizado
  // Esto arregla el problema del cuadro gris definitivamente
  setTimeout(() => {
    this.map.invalidateSize();
    this.cdRef.detectChanges();
  }, 800);
}

  private cargarConfiguracionGeovalla() {
    // Consultamos la estación 1 (Puerta del Norte) de forma dinámica
    this.worklogService.obtenerConfiguracionEstacion(1).subscribe({
      next: (estacion) => {
        this.puestoLat = estacion.latitude;
        this.puestoLon = estacion.longitude;
        this.radioMaximo = estacion.radio_meter || 100; // metros
        this.initMap();
        this.ubicacionEstado = 'GPS Listo (Geovalla Activa)';
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar geovalla:', err);
        this.ubicacionEstado = 'Error al cargar geovalla';
        this.cdRef.detectChanges();
      },
    });
  }

  solicitarRegistro(content: any) {
    if (!this.usuarioSesion) {
      this.mensajeError = 'Error: Sesión no identificada.';
      this.mostrarAlertaError = true;
      return;
    }
    this.modalService.open(content, { centered: true }).result.then(
      (result) => {
        if (result === 'confirmar') this.registrarAsistencia();
      },
      () => {
        this.ubicacionEstado = 'Operación cancelada.';
        this.cdRef.detectChanges();
      },
    );
  }

  private registrarAsistencia() {
    if (!navigator.geolocation) return;

    this.ubicacionEstado = 'Obteniendo GPS...';
    this.cdRef.detectChanges();

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Distancia real en metros hasta el puesto, comparada con el radio de la geovalla
        const distancia = distanciaEnMetros(lat, lon, this.puestoLat, this.puestoLon);

        if (distancia <= this.radioMaximo) {
          if (!this.jornadaActiva) {
            // 🟢 FLUJO ENTRADA (POST)
            const payloadEntrada = {
              user: { id: this.usuarioSesion.id },
              workStation: { id: 1 },
              latitudeIn: lat,
              longitudeIn: lon,
              // la hora de entrada la pone el servidor (hora de Bogotá), no el navegador
              complete: false,
            };

            this.worklogService.registrarAsistencia(payloadEntrada).subscribe({
              next: (res) => {
                this.idMarcajeActual = res.id; // Guardamos ID para la salida posterior
                this.gestionarExito('Entrada');
              },
              error: (err) => this.gestionarError(err),
            });
          } else {
            // 🔴 FLUJO SALIDA (PUT)
            const payloadSalida = {
              latitudeOut: lat,
              longitudeOut: lon,
            };

            if (this.idMarcajeActual) {
              this.worklogService.registrarSalida(this.idMarcajeActual, payloadSalida).subscribe({
                next: () => {
                  this.idMarcajeActual = null;
                  this.gestionarExito('Salida');
                },
                error: (err) => this.gestionarError(err),
              });
            }
          }
        } else {
          this.ubicacionEstado = 'Fuera de rango.';
          this.mensajeError = `Te encuentras a ${Math.round(distancia)} m del puesto; el máximo permitido es ${this.radioMaximo} m.`;
          this.mostrarAlertaError = true;
          this.cdRef.detectChanges();
        }
      },
      (error) => {
        this.ubicacionEstado = 'Error GPS';
        this.cdRef.detectChanges();
      },
      { enableHighAccuracy: true },
    );
  }

  private gestionarExito(tipo: string) {
    this.jornadaActiva = !this.jornadaActiva;
    this.mensajeAlerta = `¡Marcaje de ${tipo} exitoso!`;
    this.mostrarAlertaExito = true;
    this.ubicacionEstado = this.jornadaActiva ? 'Dentro de jornada' : 'Fuera de jornada';
    this.cargarHistorial(); //guarda el historial
    this.cdRef.detectChanges();
    setTimeout(() => {
      this.mostrarAlertaExito = false;
      this.cdRef.detectChanges();
    }, 5000);
  }

  private gestionarError(err: any) {
    console.error('❌ Error API:', err);
    // si el servidor explica el motivo (p. ej. jornada ya abierta), se muestra ese texto
    this.mensajeError =
      typeof err?.error === 'string' && err.error ? err.error : 'Error de comunicación con el servidor.';
    this.mostrarAlertaError = true;
    this.cdRef.detectChanges();
  }

  private cargarHistorial() {
    if (this.usuarioSesion) {
      this.worklogService.obtenerHistorialPorUsuario(this.usuarioSesion.id).subscribe({
        next: (logs) => {
          this.historialMarcajes = logs.sort((a: any, b: any) => b.id - a.id).slice(0, 5);
          this.cdRef.detectChanges();
        },
      });
    }
  }
}
