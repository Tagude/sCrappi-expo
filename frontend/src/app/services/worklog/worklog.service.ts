import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class WorklogService {
  private apiUrl =`${environment.apiUrl}/worklogs`;

  constructor(private http: HttpClient) {}

  // 🟢 Para REGISTRAR ENTRADA (Crea el registro inicial)
  registrarAsistencia(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  // 🔴 Para REGISTRAR SALIDA (Actualiza el registro existente)
  // El ID es el del worklog que se creó en la entrada
  registrarSalida(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/checkout`, data);
  }

  // 📋 Para obtener el historial del usuario (Lo usaremos en el Dashboard)
  obtenerHistorialPorUsuario(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  // 📋 Para obtener todos los worklogs (Reportes)
  obtenerTodosLosWorklogs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Obtener datos de la oficina (Geovalla)
  obtenerConfiguracionEstacion(id: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/workstation/${id}`);
  }
}
