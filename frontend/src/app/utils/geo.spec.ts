import { distanciaEnMetros, estaDentroDeGeovalla } from './geo';

// Estación 1 (Puerta del Norte, Bello), la misma que usa la app, con radio de 100 m
const PUESTO = { lat: 6.351, lon: -75.556 };
const RADIO = 100;

describe('Geovalla: distancia en metros', () => {
  it('da 0 m para el mismo punto', () => {
    expect(distanciaEnMetros(PUESTO.lat, PUESTO.lon, PUESTO.lat, PUESTO.lon)).toBe(0);
  });

  it('mide cerca de 111 km por grado de latitud', () => {
    const d = distanciaEnMetros(6, -75.556, 7, -75.556);
    expect(d).toBeGreaterThan(111_000);
    expect(d).toBeLessThan(111_400);
  });

  it('mide la distancia entre dos estaciones reales de la base de datos (~61 m)', () => {
    // Puerta del Norte → Unidad Mirasol
    const d = distanciaEnMetros(6.351, -75.556, 6.351201, -75.556523);
    expect(d).toBeGreaterThan(55);
    expect(d).toBeLessThan(65);
  });
});

describe('Geovalla: dentro o fuera', () => {
  it('acepta a un trabajador a unos 50 m del puesto', () => {
    // 0.00045° de latitud ≈ 50 m
    expect(estaDentroDeGeovalla(PUESTO.lat + 0.00045, PUESTO.lon, PUESTO.lat, PUESTO.lon, RADIO)).toBe(true);
  });

  it('rechaza a un trabajador a unos 150 m del puesto', () => {
    expect(estaDentroDeGeovalla(PUESTO.lat + 0.00135, PUESTO.lon, PUESTO.lat, PUESTO.lon, RADIO)).toBe(false);
  });

  it('rechaza a un trabajador en otra ciudad (Medellín centro, ~12 km)', () => {
    expect(estaDentroDeGeovalla(6.2476, -75.5658, PUESTO.lat, PUESTO.lon, RADIO)).toBe(false);
  });

  it('acepta justo en el borde del radio', () => {
    const borde = distanciaEnMetros(PUESTO.lat + 0.0009, PUESTO.lon, PUESTO.lat, PUESTO.lon);
    expect(estaDentroDeGeovalla(PUESTO.lat + 0.0009, PUESTO.lon, PUESTO.lat, PUESTO.lon, borde)).toBe(true);
  });
});
