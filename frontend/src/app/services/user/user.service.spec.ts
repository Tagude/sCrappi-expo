import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { UserService } from './user.service';
import { environment } from '../../../environments/environment';

describe('UserService', () => {
  let service: UserService;
  let http: HttpTestingController;
  const api = `${environment.apiUrl}/users`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('inicia sesión con documento o usuario y contraseña', () => {
    service.login({ identifier: 'tagude', password: 'secreta' }).subscribe();

    const req = http.expectOne(`${api}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ identifier: 'tagude', password: 'secreta' });
    req.flush({ id: 1, role: 'ADMIN' });
  });

  it('lista los usuarios', () => {
    service.getUsers().subscribe((users) => expect(users.length).toBe(2));

    http.expectOne(api).flush([{ id: 1 }, { id: 2 }]);
  });

  it('actualiza un usuario con PUT /users/{id}', () => {
    service.updateUser(2, { name: 'Ana' }).subscribe();

    const req = http.expectOne(`${api}/2`);
    expect(req.request.method).toBe('PUT');
    req.flush({ id: 2, name: 'Ana' });
  });

  it('activa o desactiva un usuario con DELETE /users/{id}', () => {
    service.deleteUser(2).subscribe();

    const req = http.expectOne(`${api}/2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
