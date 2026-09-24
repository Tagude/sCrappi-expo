import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

import { authGuard } from './auth-guard';

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
