import proj4 from 'proj4';

// Projection Transverse Mercator DCS Caucase (extraite du DCS Web Editor)
// Convention DCS mission files: x = North-South, y = East-West
// proj4.forward([y, x]) → [lon, lat]
const DCS_CAUCASUS_PROJ = '+proj=tmerc +lat_0=0 +lon_0=33 +k_0=0.9996 +x_0=-99517 +y_0=-4998115 +datum=WGS84 +units=m +no_defs';

const converter = proj4(DCS_CAUCASUS_PROJ, 'EPSG:4326');

/**
 * DCS mission coordinate convention:
 *   x = North-South axis
 *   y = East-West axis
 * Returns [lat, lng] for Leaflet.
 */
export function dcsToLatLng(x: number, y: number): [number, number] {
  const [lon, lat] = converter.forward([y, x]);
  return [lat, lon];
}

export function latLngToDcs(lat: number, lon: number): { x: number; y: number } {
  const [y, x] = converter.inverse([lon, lat]);
  return { x, y };
}
