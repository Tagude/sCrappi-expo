const RADIO_TIERRA_METROS = 6371000;

const aRadianes = (grados: number) => (grados * Math.PI) / 180;

/**
 * Distancia en metros entre dos coordenadas GPS (fórmula de Haversine).
 * Se usa para saber si el trabajador está dentro de la geovalla de su puesto,
 * cuyo radio se guarda en metros (radio_meter).
 */
export function distanciaEnMetros(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * RADIO_TIERRA_METROS * Math.asin(Math.sqrt(a));
}

/** true si el punto está dentro del círculo (centro + radio en metros). */
export function estaDentroDeGeovalla(
  lat: number,
  lon: number,
  centroLat: number,
  centroLon: number,
  radioMetros: number,
): boolean {
  return distanciaEnMetros(lat, lon, centroLat, centroLon) <= radioMetros;
}
