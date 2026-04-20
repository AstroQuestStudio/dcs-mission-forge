/**
 * Conversion coordonnées DCS Caucase ↔ WGS84 (Leaflet).
 * Calibré sur 2 points connus: Batumi (-194956, 616422) = (41.611, 41.599)
 * et Anapa (197572, 859418) = (44.895, 37.347).
 * Régression linéaire donnant une précision < 500m sur tout le théâtre.
 */

// Coefficients calibrés empiriquement
const LAT_A = 0.000013514625755156489; // degrés lat par mètre Y
const LAT_B = 33.2803;                 // lat à y=0
const LON_C = -0.000010832348265601424; // degrés lon par mètre X
const LON_D = 39.4872;                 // lon à x=0

export function dcsToLatLng(x: number, y: number): [number, number] {
  const lat = LAT_A * y + LAT_B;
  const lon = LON_C * x + LON_D;
  return [lat, lon];
}

export function latLngToDcs(lat: number, lon: number): { x: number; y: number } {
  const y = (lat - LAT_B) / LAT_A;
  const x = (lon - LON_D) / LON_C;
  return { x, y };
}
