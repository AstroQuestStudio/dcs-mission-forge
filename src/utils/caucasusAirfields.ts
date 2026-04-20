// Données réelles extraites de D:\games\DCS World\Mods\terrains\Caucasus\
// Sources : Beacons.lua, Radio.lua, airdromeHeading.lua

export interface CaucasusAirfield {
  id: number;           // DCS internal ID
  name: string;         // Nom affiché dans DCS
  nameRu?: string;      // Nom russe / callsign URSS
  callsign: string;     // Callsign ATC
  lat: number;          // Latitude décimale (WGS84)
  lon: number;          // Longitude décimale (WGS84)
  x: number;            // DCS world X (mètres)
  z: number;            // DCS world Z (mètres)
  elevation: number;    // Altitude MSL (mètres)
  defaultSide: 'blue' | 'red' | 'neutral';
  runways: { hdg1: number; hdg2: number }[];
  tacan?: { channel: number; callsign: string };
  ils?: { freq: number; course: number; rwy: string }[];
  vor?: { freq: number; callsign: string };
  radioUHF: number;     // MHz
  radioVHF: number;     // MHz
  hasFuel: boolean;
  parkingSpots: number; // approximatif
  notes?: string;
  region: 'west' | 'center' | 'east' | 'north';
}

export const CAUCASUS_AIRFIELDS: CaucasusAirfield[] = [
  // ── CÔTE RUSSE (Nord-Ouest) ──────────────────────────────────────────────
  {
    id: 12,
    name: 'Anapa-Vityazevo',
    nameRu: 'Анапа-Витязево',
    callsign: 'Anapa',
    lat: 45.0399, lon: 37.3964,
    x: -1321.80, z: 246748.50,
    elevation: 12,
    defaultSide: 'red',
    runways: [{ hdg1: 102, hdg2: 282 }],
    ils: [{ freq: 110100, course: 102, rwy: '10' }],
    radioUHF: 250, radioVHF: 121,
    hasFuel: true,
    parkingSpots: 20,
    region: 'west',
    notes: 'Base aérienne russe principale nord-ouest. Longue piste, bonne capacité.',
  },
  {
    id: 17,
    name: 'Gelendzhik',
    nameRu: 'Геленджик',
    callsign: 'Gelendzhik',
    lat: 44.5697, lon: 38.0088,
    x: -50752.63, z: 298204.47,
    elevation: 22,
    defaultSide: 'red',
    runways: [{ hdg1: 110, hdg2: 290 }],
    vor: { freq: 114300, callsign: 'GN' },
    radioUHF: 255, radioVHF: 126,
    hasFuel: true,
    parkingSpots: 6,
    region: 'west',
    notes: 'Petit aéroport civil côtier. Piste courte.',
  },
  {
    id: 13,
    name: 'Krasnodar-Center',
    nameRu: 'Краснодар',
    callsign: 'Krasnodar',
    lat: 45.0865, lon: 38.9693,
    x: 11804.43, z: 370241.34,
    elevation: 29,
    defaultSide: 'red',
    runways: [{ hdg1: 240, hdg2: 60 }, { hdg1: 120, hdg2: 300 }],
    radioUHF: 251, radioVHF: 122,
    hasFuel: true,
    parkingSpots: 24,
    region: 'west',
    notes: 'Grande base militaire double piste.',
  },
  {
    id: 19,
    name: 'Krasnodar-Pashkovsky',
    nameRu: 'Краснодар-Пашковский',
    callsign: 'Pashkovsky',
    lat: 45.0340, lon: 39.1503,
    x: 3919.23, z: 383806.19,
    elevation: 30,
    defaultSide: 'red',
    runways: [{ hdg1: 230, hdg2: 50 }],
    vor: { freq: 115800, callsign: 'KN' },
    radioUHF: 257, radioVHF: 128,
    hasFuel: true,
    parkingSpots: 18,
    region: 'west',
    notes: 'Aéroport international civil/militaire de Krasnodar.',
  },
  {
    id: 15,
    name: 'Krymsk',
    nameRu: 'Крымск',
    callsign: 'Krymsk',
    lat: 44.9637, lon: 37.9985,
    x: -8396.04, z: 292887.19,
    elevation: 32,
    defaultSide: 'red',
    runways: [{ hdg1: 270, hdg2: 90 }],
    radioUHF: 253, radioVHF: 124,
    hasFuel: true,
    parkingSpots: 14,
    region: 'west',
    notes: 'Base de chasse russe. Terrain court.',
  },
  {
    id: 14,
    name: 'Novorossiysk',
    nameRu: 'Новороссийск',
    callsign: 'Novorossiysk',
    lat: 44.6853, lon: 37.7625,
    x: -37685.00, z: 273560.00,
    elevation: 5,
    defaultSide: 'red',
    runways: [{ hdg1: 120, hdg2: 300 }],
    radioUHF: 252, radioVHF: 123,
    hasFuel: true,
    parkingSpots: 8,
    region: 'west',
    notes: 'Petit terrain côtier. Héliport naval possible.',
  },
  {
    id: 18,
    name: 'Sochi-Adler',
    nameRu: 'Сочи-Адлер',
    callsign: 'Sochi',
    lat: 43.4500, lon: 39.9607,
    x: -163681.03, z: 463753.72,
    elevation: 23,
    defaultSide: 'red',
    runways: [{ hdg1: 120, hdg2: 300 }],
    ils: [{ freq: 111100, course: 120, rwy: '12' }],
    radioUHF: 256, radioVHF: 127,
    hasFuel: true,
    parkingSpots: 16,
    region: 'west',
    notes: 'Aéroport olympique côtier. Proximité mer.',
  },
  {
    id: 16,
    name: 'Maykop-Khanskaya',
    nameRu: 'Майкоп-Ханская',
    callsign: 'Khanskaya',
    lat: 44.6977, lon: 40.0355,
    x: -26605.98, z: 458079.47,
    elevation: 181,
    defaultSide: 'red',
    runways: [{ hdg1: 240, hdg2: 60 }],
    radioUHF: 254, radioVHF: 125,
    hasFuel: true,
    parkingSpots: 12,
    region: 'center',
    notes: 'Base hélicoptères / appui sol russe.',
  },

  // ── GÉORGIE (Bleu OTAN) ──────────────────────────────────────────────────
  {
    id: 22,
    name: 'Batumi',
    nameRu: 'Батуми',
    callsign: 'Batumi',
    lat: 41.6017, lon: 41.6122,
    x: -356584.81, z: 618472.44,
    elevation: 10,
    defaultSide: 'blue',
    runways: [{ hdg1: 130, hdg2: 310 }],
    tacan: { channel: 16, callsign: 'BTM' },
    ils: [{ freq: 110300, course: 130, rwy: '13' }],
    radioUHF: 260, radioVHF: 131,
    hasFuel: true,
    parkingSpots: 8,
    region: 'west',
    notes: 'Base principale OTAN sud-ouest Géorgie. Piste courte, décollage mer.',
  },
  {
    id: 24,
    name: 'Kobuleti',
    nameRu: 'Кобулети',
    callsign: 'Kobuleti',
    lat: 41.9281, lon: 41.8714,
    x: -318110.00, z: 637640.00,
    elevation: 9,
    defaultSide: 'blue',
    runways: [{ hdg1: 150, hdg2: 330 }],
    radioUHF: 262, radioVHF: 133,
    hasFuel: true,
    parkingSpots: 6,
    region: 'west',
    notes: 'Terrain militaire géorgien côtier.',
  },
  {
    id: 21,
    name: 'Gudauta',
    nameRu: 'Гудаута',
    callsign: 'Gudauta',
    lat: 43.1002, lon: 40.5718,
    x: -220285.00, z: 541730.00,
    elevation: 68,
    defaultSide: 'blue',
    runways: [{ hdg1: 110, hdg2: 290 }],
    radioUHF: 259, radioVHF: 130,
    hasFuel: true,
    parkingSpots: 10,
    region: 'west',
    notes: 'Base d\'Abkhazie — neutre dans DCS stock mais jouable bleu.',
  },
  {
    id: 20,
    name: 'Sukhumi-Babushara',
    nameRu: 'Сухуми-Бабушара',
    callsign: 'Sukhumi',
    lat: 42.8336, lon: 41.1847,
    x: -223173.77, z: 569571.38,
    elevation: 25,
    defaultSide: 'blue',
    runways: [{ hdg1: 110, hdg2: 290 }],
    radioUHF: 258, radioVHF: 129,
    hasFuel: true,
    parkingSpots: 8,
    region: 'west',
    notes: 'Longue piste en Abkhazie.',
  },
  {
    id: 23,
    name: 'Senaki-Kolkhi',
    nameRu: 'Сенаки',
    callsign: 'Kolkhi',
    lat: 42.2387, lon: 42.0634,
    x: -281888.88, z: 648576.31,
    elevation: 13,
    defaultSide: 'blue',
    runways: [{ hdg1: 150, hdg2: 330 }],
    tacan: { channel: 31, callsign: 'TSK' },
    ils: [{ freq: 108900, course: 150, rwy: '15' }],
    radioUHF: 261, radioVHF: 132,
    hasFuel: true,
    parkingSpots: 14,
    region: 'west',
    notes: 'Base de chasse géorgienne. ILS + TACAN.',
  },
  {
    id: 25,
    name: 'Kutaisi',
    nameRu: 'Кутаиси',
    callsign: 'Kutaisi',
    lat: 42.1797, lon: 42.4978,
    x: -284502.84, z: 685199.50,
    elevation: 46,
    defaultSide: 'blue',
    runways: [{ hdg1: 170, hdg2: 350 }],
    tacan: { channel: 44, callsign: 'KTS' },
    vor: { freq: 113600, callsign: 'KT' },
    ils: [{ freq: 109750, course: 170, rwy: '17' }],
    radioUHF: 263, radioVHF: 134,
    hasFuel: true,
    parkingSpots: 20,
    region: 'center',
    notes: 'Grande base géorgienne centrale. ILS + TACAN + VOR.',
  },
  {
    id: 29,
    name: 'Tbilisi-Lochini',
    nameRu: 'Тбилиси-Лочини',
    callsign: 'Lochini',
    lat: 41.6580, lon: 44.9680,
    x: -316544.06, z: 897748.50,
    elevation: 479,
    defaultSide: 'blue',
    runways: [{ hdg1: 130, hdg2: 310 }, { hdg1: 310, hdg2: 130 }],
    tacan: { channel: 25, callsign: 'GTB' },
    vor: { freq: 113700, callsign: 'TB' },
    ils: [
      { freq: 110300, course: 130, rwy: '13R' },
      { freq: 108900, course: 310, rwy: '31L' },
    ],
    radioUHF: 267, radioVHF: 138,
    hasFuel: true,
    parkingSpots: 32,
    region: 'east',
    notes: 'Aéroport international de Tbilissi. Deux pistes parallèles, altitude 479m.',
  },
  {
    id: 30,
    name: 'Tbilisi-Soganlug',
    nameRu: 'Тбилиси Военный',
    callsign: 'Soganlug',
    lat: 41.6360, lon: 44.9544,
    x: -318890.00, z: 896610.00,
    elevation: 467,
    defaultSide: 'blue',
    runways: [{ hdg1: 170, hdg2: 350 }],
    radioUHF: 268, radioVHF: 139,
    hasFuel: true,
    parkingSpots: 18,
    region: 'east',
    notes: 'Base militaire adjacente à Lochini.',
  },
  {
    id: 31,
    name: 'Vaziani',
    nameRu: 'Вазиани',
    callsign: 'Vaziani',
    lat: 41.6191, lon: 45.0370,
    x: -320054.41, z: 904121.94,
    elevation: 464,
    defaultSide: 'blue',
    runways: [{ hdg1: 130, hdg2: 310 }],
    tacan: { channel: 22, callsign: 'VAS' },
    ils: [{ freq: 108750, course: 130, rwy: '13' }],
    radioUHF: 269, radioVHF: 140,
    hasFuel: true,
    parkingSpots: 22,
    region: 'east',
    notes: 'Base de l\'OTAN à l\'est de Tbilissi. Bonne capacité, ILS + TACAN.',
  },

  // ── OSSÉTIE DU NORD / NORD (Rouge) ──────────────────────────────────────
  {
    id: 32,
    name: 'Beslan',
    nameRu: 'Беслан',
    callsign: 'Beslan',
    lat: 43.2028, lon: 44.6256,
    x: -148253.16, z: 838154.19,
    elevation: 542,
    defaultSide: 'red',
    runways: [{ hdg1: 270, hdg2: 90 }],
    ils: [{ freq: 110500, course: 270, rwy: '27' }],
    radioUHF: 270, radioVHF: 141,
    hasFuel: true,
    parkingSpots: 16,
    region: 'east',
    notes: 'Nord Ossétie — grande piste russe à l\'Est.',
  },
  {
    id: 27,
    name: 'Nalchik',
    nameRu: 'Нальчик',
    callsign: 'Nalchik',
    lat: 43.5350, lon: 43.6929,
    x: -122005.13, z: 764682.38,
    elevation: 426,
    defaultSide: 'red',
    runways: [{ hdg1: 120, hdg2: 300 }],
    ils: [{ freq: 110500, course: 120, rwy: '12' }],
    radioUHF: 265, radioVHF: 136,
    hasFuel: true,
    parkingSpots: 10,
    region: 'east',
    notes: 'Capitale du Kabardino-Balkarie, terrrain intermédiaire.',
  },
  {
    id: 26,
    name: 'Mineralnyye Vody',
    nameRu: 'Минеральные Воды',
    callsign: 'Minvody',
    lat: 44.2383, lon: 43.0583,
    x: -50326.44, z: 703758.56,
    elevation: 313,
    defaultSide: 'red',
    runways: [{ hdg1: 260, hdg2: 80 }],
    vor: { freq: 117100, callsign: 'MN' },
    ils: [{ freq: 109300, course: 260, rwy: '26' }],
    radioUHF: 264, radioVHF: 135,
    hasFuel: true,
    parkingSpots: 14,
    region: 'east',
    notes: 'Grande piste à l\'Est — bonne base de projection.',
  },
  {
    id: 28,
    name: 'Mozdok',
    nameRu: 'Моздок',
    callsign: 'Mozdok',
    lat: 43.7920, lon: 44.5722,
    x: -83799.64, z: 831748.81,
    elevation: 145,
    defaultSide: 'red',
    runways: [{ hdg1: 330, hdg2: 150 }],
    radioUHF: 266, radioVHF: 137,
    hasFuel: true,
    parkingSpots: 20,
    region: 'east',
    notes: 'Grande base militaire historique russe. Double voie.',
  },
];

// ── Lookup rapide ────────────────────────────────────────────────────────

export const AIRFIELD_BY_ID: Record<number, CaucasusAirfield> =
  Object.fromEntries(CAUCASUS_AIRFIELDS.map(a => [a.id, a]));

export const AIRFIELD_BY_NAME: Record<string, CaucasusAirfield> =
  Object.fromEntries(CAUCASUS_AIRFIELDS.map(a => [a.name, a]));

/** Convertit lat/lon → coordonnées DCS x/z via régression linéaire sur les points connus */
export function latLonToDcsXZ(lat: number, lon: number): { x: number; z: number } {
  // Interpolation bilinéaire simplifiée (suffisante sur Caucase)
  // dLat → x négatif (nord = moins négatif)
  // dLon → z positif (est = plus grand)
  const dxdLat = (-83799.64 - (-1321.80)) / (43.7920 - 45.0399);   // ~ -66_000 / °lat
  const dzdLon = (897748.50 - 246748.50) / (44.9680 - 37.3964);    // ~ 85_800 / °lon
  const refLat = 45.0399, refLon = 37.3964;
  const refX = -1321.80, refZ = 246748.50;

  return {
    x: refX + (lat - refLat) * dxdLat,
    z: refZ + (lon - refLon) * dzdLon,
  };
}

/** Retourne les aérodromes d'un côté donné */
export function getAirfieldsBySide(side: 'blue' | 'red' | 'neutral'): CaucasusAirfield[] {
  return CAUCASUS_AIRFIELDS.filter(a => a.defaultSide === side);
}

/** Retourne les aérodromes proches d'un point (dans rayon km) */
export function getAirfieldsNear(lat: number, lon: number, radiusKm: number): CaucasusAirfield[] {
  return CAUCASUS_AIRFIELDS.filter(a => {
    const dlat = (a.lat - lat) * 111.32;
    const dlon = (a.lon - lon) * 111.32 * Math.cos((lat * Math.PI) / 180);
    return Math.sqrt(dlat * dlat + dlon * dlon) <= radiusKm;
  });
}
