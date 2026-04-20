/**
 * Conversion coordonnées DCS (système métrique centré sur la carte)
 * vers WGS84 (latitude/longitude) pour Leaflet.
 *
 * DCS Caucase : origine à lat ~41.0°N, lon ~44.0°E
 * X = Est (longitude), Y = Nord (latitude)
 */

const CAUCASUS_LAT = 41.0;
const CAUCASUS_LON = 44.0;
const METERS_PER_DEG_LAT = 111320;

export function dcsToLatLng(x: number, y: number): [number, number] {
  const lat = CAUCASUS_LAT + y / METERS_PER_DEG_LAT;
  const lon = CAUCASUS_LON + x / (METERS_PER_DEG_LAT * Math.cos((CAUCASUS_LAT * Math.PI) / 180));
  return [lat, lon];
}

export function latLngToDcs(lat: number, lon: number): { x: number; y: number } {
  const y = (lat - CAUCASUS_LAT) * METERS_PER_DEG_LAT;
  const x = (lon - CAUCASUS_LON) * (METERS_PER_DEG_LAT * Math.cos((CAUCASUS_LAT * Math.PI) / 180));
  return { x, y };
}
