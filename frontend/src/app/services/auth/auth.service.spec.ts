import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    service = new AuthService();
  });

  it('no tiene sesión al empezar', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getUser()).toBeNull();
  });

  it('guarda y recupera el usuario que inició sesión', () => {
    service.setSession({ id: 7, userName: 'tagude', role: 'ADMIN' });

    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUser()).toEqual({ id: 7, userName: 'tagude', role: 'ADMIN' });
  });

  it('cierra la sesión', () => {
    service.setSession({ id: 7 });
    service.logout();

    expect(service.isLoggedIn()).toBe(false);
  });
});
