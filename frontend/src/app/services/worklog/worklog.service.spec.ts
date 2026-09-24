import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { WorklogService } from './worklog.service';
import { environment } from '../../../environments/environment';

describe('WorklogService', () => {
  let service: WorklogService;
  let http: HttpTestingController;
  const api = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WorklogService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('registra la entrada con POST /worklogs', () => {
    const entrada = { user: { id: 1 }, workStation: { id: 1 }, latitudeIn: 6.351, longitudeIn: -75.556 };
    service.registrarAsistencia(entrada).subscribe((res) => expect(res.id).toBe(10));

    const req = http.expectOne(`${api}/worklogs`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(entrada);
    req.flush({ id: 10 });
  });

  it('registra la salida con PUT /worklogs/{id}/checkout', () => {
    service.registrarSalida(10, { latitudeOut: 6.351, longitudeOut: -75.556 }).subscribe();

    const req = http.expectOne(`${api}/worklogs/10/checkout`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 10, complete: true });
  });

  it('pide el historial de un usuario', () => {
    service.obtenerHistorialPorUsuario(3).subscribe((logs) => expect(logs.length).toBe(2));

    const req = http.expectOne(`${api}/worklogs/user/3`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }, { id: 2 }]);
  });

  it('pide la configuración de la geovalla de una estación', () => {
    service.obtenerConfiguracionEstacion(1).subscribe((e) => expect(e.radio_meter).toBe(100));

    http.expectOne(`${api}/workstation/1`).flush({ id: 1, radio_meter: 100 });
  });
});
