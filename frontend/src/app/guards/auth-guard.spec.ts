import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard, roleGuard } from './auth-guard';

describe('authGuard', () => {
  const navigate = vi.fn();
  const ejecutar = () =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate } }],
    });
  });

  it('deja pasar al dashboard cuando hay sesión', () => {
    localStorage.setItem('usuarioSesion', JSON.stringify({ id: 1, role: 'ADMIN' }));

    expect(ejecutar()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('manda al login cuando no hay sesión', () => {
    expect(ejecutar()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });
});

describe('roleGuard', () => {
  const navigate = vi.fn();
  const soloAdminYSupervisor = roleGuard('ADMIN', 'SUPERVISOR');
  const ejecutar = () =>
    TestBed.runInInjectionContext(() =>
      soloAdminYSupervisor({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
  const sesionCon = (role: string) =>
    localStorage.setItem('usuarioSesion', JSON.stringify({ id: 1, role }));

  beforeEach(() => {
    localStorage.clear();
    navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { navigate } }],
    });
  });

  it('deja entrar a un administrador', () => {
    sesionCon('ADMIN');
    expect(ejecutar()).toBe(true);
  });

  it('deja entrar a un supervisor', () => {
    sesionCon('SUPERVISOR');
    expect(ejecutar()).toBe(true);
  });

  it('devuelve al inicio a un empleado que escribe la URL a mano', () => {
    sesionCon('EMPLOYED');
    expect(ejecutar()).toBe(false);
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('no deja entrar sin sesión', () => {
    expect(ejecutar()).toBe(false);
  });
});
