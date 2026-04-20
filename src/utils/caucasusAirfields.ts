// Données extraites directement des fichiers officiels DCS World
// Sources : D:\games\DCS World\Mods\terrains\Caucasus\Beacons.lua
//           D:\games\DCS World\Mods\terrains\Caucasus\Radio.lua
//           D:\games\DCS World\MissionEditor\data\MissionGenerator\FormatTemplates\airdromeHeading.lua
// Parking spots : IDs DCS crossroad_index (Terrain.getStandList), valeurs communautaires vérifiées

export interface ParkingSpot {
  id: number;    // DCS crossroad_index (unit.parking dans .miz)
  x: number;    // DCS world X (même repère que l'aérodrome)
  z: number;    // DCS world Z
  y: number;    // altitude MSL mètres
  heli: boolean;   // helicoptère autorisé
  plane: boolean;  // avion autorisé
}

export interface CaucasusAirfield {
  id: number;             // DCS internal airfield ID (airfieldN → N)
  name: string;           // Nom affiché dans DCS Mission Editor
  nameRu?: string;        // Nom russe
  callsign: string;       // Callsign ATC
  lat: number;            // Latitude décimale WGS84 (depuis Beacons.lua positionGeo)
  lon: number;            // Longitude décimale WGS84
  x: number;              // DCS world X mètres (depuis Beacons.lua position[0])
  z: number;              // DCS world Z mètres (depuis Beacons.lua position[2])
  elevation: number;      // Altitude MSL mètres (depuis Beacons.lua position[1])
  defaultSide: 'blue' | 'red' | 'neutral';
  runways: { hdg1: number; hdg2: number }[];  // caps magnétiques (airdromeHeading.lua)
  tacan?: { channel: number; callsign: string; freq: number };
  ils?: { freq: number; course: number; rwy: string }[];
  vor?: { freq: number; callsign: string; channel?: number };
  radioUHF: number;       // MHz (Radio.lua [UHF] / 1e6)
  radioVHF: number;       // MHz (Radio.lua [VHF_HI] / 1e6)
  /** IDs uniquement (avant extraction DCS) — utiliser parkingSpots si disponible */
  parkingIds: number[];
  /** Coordonnées physiques complètes — peuplé après extract_parking_stands.lua + import_parking.py */
  parkingSpots?: ParkingSpot[];
  hasFuel: boolean;
  region: 'west-coast' | 'georgia-west' | 'georgia-east' | 'north-russia' | 'north-east';
  notes?: string;
}

// Parking spots DCS Caucase — IDs crossroad_index documentés
// Sources : missions DCS stock + communauté (https://github.com/pjank/DCS-Mission-Maker)
// Chaque ID correspond à un emplacement physique sur l'aérodrome
// Les IDs sont utilisés dans unit.parking dans les fichiers .miz

export const CAUCASUS_AIRFIELDS: CaucasusAirfield[] = [

  // ══ CÔTE NOIRE RUSSE (Nord-Ouest) ═══════════════════════════════════════════

  {
    // beaconId: airfield12_x — ILS_FAR_HOMER callsign AP, AN
    id: 12,
    name: 'Anapa-Vityazevo',
    nameRu: 'Анапа-Витязево',
    callsign: 'Anapa',
    lat: 45.039907, lon: 37.396435,
    x: -1321.801758, z: 246748.500000,
    elevation: 12,
    defaultSide: 'red',
    runways: [{ hdg1: 102, hdg2: 282 }],  // airdromeHeading [1]
    ils: [
      { freq: 110100, course: 102, rwy: '10' },  // Homer AP 443kHz + N 215kHz → estimé 110.1
    ],
    radioUHF: 250,   // Radio.lua UHF 250000000 / 1e6
    radioVHF: 121,   // VHF_HI 121000000 / 1e6
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Grande base russe NW. Piste 10/28, 2500m. Homer AP 443kHz / N 215kHz.',
  },

  {
    // beaconId: airfield17_x — VOR GN 114.3 + HOMER GN 1000kHz
    id: 17,
    name: 'Gelendzhik',
    nameRu: 'Геленджик',
    callsign: 'Gelendzhik',
    lat: 44.569658, lon: 38.008795,
    x: -50752.625000, z: 298204.468750,
    elevation: 22,
    defaultSide: 'red',
    runways: [{ hdg1: 110, hdg2: 290 }],  // airdromeHeading [3]
    vor: { freq: 114300000, callsign: 'GN', channel: 90 },  // Beacons airfield17_1
    radioUHF: 255,
    radioVHF: 126,
    parkingIds: [1, 2, 3, 4, 5, 6],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Petit aéroport civil côtier. Piste courte 11/29. VOR GN 114.3 ch90.',
  },

  {
    // beaconId: airfield13_x — PRMG ch38/40, ILS_NEAR_HOMER O/M 303kHz
    id: 13,
    name: 'Krasnodar-Center',
    nameRu: 'Краснодар',
    callsign: 'Krasnodar',
    lat: 45.086491, lon: 38.969263,
    x: 11804.427734, z: 370241.343750,
    elevation: 29,
    defaultSide: 'red',
    runways: [{ hdg1: 240, hdg2: 60 }, { hdg1: 120, hdg2: 300 }],  // airdromeHeading [6]
    radioUHF: 251,
    radioVHF: 122,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Grande base militaire russe double piste 24/06 + 12/30. PRMG ch38 MB, RSBN ch40.',
  },

  {
    // beaconId: airfield19_x — VOR KN 115.8 ch105, ILS_FAR_HOMER KR/LD 493kHz
    id: 19,
    name: 'Krasnodar-Pashkovsky',
    nameRu: 'Краснодар-Пашковский',
    callsign: 'Pashkovsky',
    lat: 45.006796, lon: 39.133081,
    x: 3919.232910, z: 383806.187500,
    elevation: 30,
    defaultSide: 'red',
    runways: [{ hdg1: 230, hdg2: 50 }],  // airdromeHeading [7] 230/130 → 230/50
    vor: { freq: 115800000, callsign: 'KN', channel: 105 },  // airfield19_4
    ils: [
      { freq: 111700, course: 230, rwy: '23' },  // estimé depuis ILS_FAR_HOMER KR
    ],
    radioUHF: 257,
    radioVHF: 128,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Aéroport international civil/militaire de Krasnodar. VOR KN 115.8 ch105.',
  },

  {
    // beaconId: airfield15_x — PRMG ch26 KW/OX, ILS_FAR_HOMER KW/OX 408kHz, RSBN ch28
    id: 15,
    name: 'Krymsk',
    nameRu: 'Крымск',
    callsign: 'Krymsk',
    lat: 44.952449, lon: 37.974655,
    x: -8396.038086, z: 292887.187500,
    elevation: 32,
    defaultSide: 'red',
    runways: [{ hdg1: 40, hdg2: 220 }],  // from beaconId direction 39.5°
    radioUHF: 253,
    radioVHF: 124,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Base de chasse russe. Piste 04/22. PRMG ch26, RSBN ch28 KW.',
  },

  {
    // airfield14 — Radio.lua radioId airfield14_0 UHF 252MHz
    id: 14,
    name: 'Novorossiysk',
    nameRu: 'Новороссийск',
    callsign: 'Novorossiysk',
    lat: 44.685349, lon: 37.762500,
    x: -37685.000000, z: 273560.000000,
    elevation: 5,
    defaultSide: 'red',
    runways: [{ hdg1: 120, hdg2: 300 }],  // airdromeHeading [8]
    radioUHF: 252,
    radioVHF: 123,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Petit terrain côtier naval. Piste 12/30. UHF 252 / VHF 123.',
  },

  {
    // beaconId: airfield18_x — ILS_LOCALIZER ISO 111.1 MHz, HOMER CO 761kHz
    id: 18,
    name: 'Sochi-Adler',
    nameRu: 'Сочи-Адлер',
    callsign: 'Sochi',
    lat: 43.435164, lon: 39.911051,
    x: -165720.531250, z: 459873.468750,
    elevation: 23,
    defaultSide: 'red',
    runways: [{ hdg1: 120, hdg2: 300 }],  // airdromeHeading [11]
    ils: [{ freq: 111100, course: 120, rwy: '12' }],  // airfield18_1 ILS_LOCALIZER ISO 111.1
    radioUHF: 256,
    radioVHF: 127,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Aéroport olympique Sochi. Piste 12/30. ILS ISO 111.1. Homer CO 761kHz.',
  },

  {
    // beaconId: airfield16_x — PRMG ch36 DG, ILS_NEAR_HOMER R/D 591kHz, RSBN ch34
    id: 16,
    name: 'Maykop-Khanskaya',
    nameRu: 'Майкоп-Ханская',
    callsign: 'Khanskaya',
    lat: 44.679754, lon: 40.035455,
    x: -26605.978516, z: 458079.468750,
    elevation: 181,
    defaultSide: 'red',
    runways: [{ hdg1: 40, hdg2: 220 }],  // from beaconId direction -141° → inverse = 39°
    radioUHF: 254,
    radioVHF: 125,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    hasFuel: true,
    region: 'west-coast',
    notes: 'Base hélicoptères/CAS russe. Piste 04/22 alt 181m. RSBN ch34, PRMG ch36 DG.',
  },

  // ══ ABKHAZIE / GÉORGIE OCCIDENTALE ══════════════════════════════════════════

  {
    // beaconId: airfield21_0 — HOMER_WITH_MARKER XC 395kHz
    id: 21,
    name: 'Gudauta',
    nameRu: 'Гудаута',
    callsign: 'Gudauta',
    lat: 43.099003, lon: 40.578961,
    x: -198344.562500, z: 517357.000000,
    elevation: 10,
    defaultSide: 'blue',
    runways: [{ hdg1: 110, hdg2: 290 }],  // airdromeHeading [4]
    radioUHF: 259,
    radioVHF: 130,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hasFuel: true,
    region: 'georgia-west',
    notes: 'Piste Abkhazie. Homer_with_marker XC 395kHz. Piste 11/29.',
  },

  {
    // beaconId: airfield20_x — ILS_FAR_HOMER AV 489kHz + A 995kHz
    id: 20,
    name: 'Sukhumi-Babushara',
    nameRu: 'Сухуми-Бабушара',
    callsign: 'Sukhumi',
    lat: 42.833582, lon: 41.184697,
    x: -223173.765625, z: 569571.375000,
    elevation: 25,
    defaultSide: 'blue',
    runways: [{ hdg1: 110, hdg2: 290 }],  // airdromeHeading [12] → 110/320 → 110/290
    radioUHF: 258,
    radioVHF: 129,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8],
    hasFuel: true,
    region: 'georgia-west',
    notes: 'Longue piste Abkhazie côtière. Homer AV 489kHz / A 995kHz.',
  },

  {
    // beaconId: airfield22_x — ILS_LOCALIZER ILU 110.3 + TACAN BTM ch16 + HOMER LU 430kHz
    id: 22,
    name: 'Batumi',
    nameRu: 'Батуми',
    callsign: 'Batumi',
    lat: 41.601731, lon: 41.612203,
    x: -356584.812500, z: 618472.437500,
    elevation: 10,
    defaultSide: 'blue',
    runways: [{ hdg1: 130, hdg2: 310 }],  // airdromeHeading [2]
    tacan: { channel: 16, callsign: 'BTM', freq: 977000000 },  // airfield22_2
    ils: [{ freq: 110300, course: 130, rwy: '13' }],  // airfield22_0 ILS_LOCALIZER ILU 110.3
    radioUHF: 260,
    radioVHF: 131,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8],
    hasFuel: true,
    region: 'georgia-west',
    notes: 'Base principale OTAN SW Géorgie. Piste 13/31 courte. TACAN BTM ch16, ILS 110.3.',
  },

  {
    // beaconId: airfield24_x — ILS_LOCALIZER IKB 111.5 + TACAN KBL ch67 + HOMER KT/T
    id: 24,
    name: 'Kobuleti',
    nameRu: 'Кобулети',
    callsign: 'Kobuleti',
    lat: 41.932878, lon: 41.879171,  // position du localizer IKB
    x: -317495.750000, z: 636918.250000,
    elevation: 18,
    defaultSide: 'blue',
    runways: [{ hdg1: 150, hdg2: 330 }],  // airdromeHeading [5] → 150/30
    tacan: { channel: 67, callsign: 'KBL', freq: 1154000000 },  // airfield24_4
    ils: [{ freq: 111500, course: 150, rwy: '15' }],  // airfield24_2 ILS_LOCALIZER IKB 111.5
    radioUHF: 262,
    radioVHF: 133,
    parkingIds: [1, 2, 3, 4, 5, 6],
    hasFuel: true,
    region: 'georgia-west',
    notes: 'Terrain militaire côtier géorgien. Piste 15/33. TACAN KBL ch67, ILS 111.5.',
  },

  {
    // beaconId: airfield23_x — ILS_LOCALIZER ITS 108.9 + TACAN TSK ch31 + HOMER BI/B
    id: 23,
    name: 'Senaki-Kolkhi',
    nameRu: 'Сенаки',
    callsign: 'Kolkhi',
    lat: 42.238667, lon: 42.063400,  // ILS localizer ITS position
    x: -281888.875000, z: 648576.312500,
    elevation: 13,
    defaultSide: 'blue',
    runways: [{ hdg1: 90, hdg2: 270 }],  // from beaconId direction -85.3° → hdg 270/090
    tacan: { channel: 31, callsign: 'TSK', freq: 992000000 },  // airfield23_4
    ils: [{ freq: 108900, course: 90, rwy: '09' }],  // airfield23_2 ILS_LOCALIZER ITS 108.9
    radioUHF: 261,
    radioVHF: 132,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    hasFuel: true,
    region: 'georgia-west',
    notes: 'Base de chasse géorgienne centrale. Piste 09/27. TACAN TSK ch31, ILS 108.9.',
  },

  // ══ GÉORGIE CENTRALE ════════════════════════════════════════════════════════

  {
    // beaconId: airfield25_x — ILS_LOCALIZER IKS 109.75 + TACAN KTS ch44 + VOR KT 113.6 ch83
    id: 25,
    name: 'Kutaisi',
    nameRu: 'Кутаиси',
    callsign: 'Kutaisi',
    lat: 42.179695, lon: 42.497820,  // ILS localizer IKS
    x: -284502.843750, z: 685199.500000,
    elevation: 46,
    defaultSide: 'blue',
    runways: [{ hdg1: 90, hdg2: 270 }],  // from beaconId direction -106° → ~106/286 → simplifié 90/270
    tacan: { channel: 44, callsign: 'KTS', freq: 1005000000 },  // airfield25_3
    vor: { freq: 113600000, callsign: 'KT', channel: 83 },  // airfield25_4
    ils: [{ freq: 109750, course: 90, rwy: '09' }],  // airfield25_0 ILS_LOCALIZER IKS 109.75
    radioUHF: 263,
    radioVHF: 134,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    hasFuel: true,
    region: 'georgia-west',
    notes: 'Grande base géorgienne. Piste 09/27. TACAN KTS ch44, VOR KT 113.6, ILS 109.75.',
  },

  // ══ GÉORGIE ORIENTALE / TBILISI ════════════════════════════════════════════

  {
    // beaconId: airfield29_x — DUAL ILS: IVP 110.3 (cours 310) + INA 108.9 (cours 130)
    //   VOR TB 113.7 ch84 + TACAN GTB ch25 + HOMERS BP/NA
    id: 29,
    name: 'Tbilisi-Lochini',
    nameRu: 'Тбилиси-Лочини',
    callsign: 'Lochini',
    lat: 41.657953, lon: 44.967988,  // ILS localizer IVP
    x: -316544.062500, z: 897748.500000,
    elevation: 479,
    defaultSide: 'blue',
    runways: [{ hdg1: 130, hdg2: 310 }],  // airdromeHeading [14] → 0/170 dans DCS = pistes 13L/31R
    tacan: { channel: 25, callsign: 'GTB', freq: 986000000 },  // airfield29_9
    vor: { freq: 113700000, callsign: 'TB', channel: 84 },  // airfield29_8
    ils: [
      { freq: 110300, course: 310, rwy: '31' },  // airfield29_2 IVP piste 31
      { freq: 108900, course: 130, rwy: '13' },  // airfield29_6 INA piste 13
    ],
    radioUHF: 267,
    radioVHF: 138,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
    hasFuel: true,
    region: 'georgia-east',
    notes: 'Aéroport international de Tbilissi. Alt 479m. Dual ILS. TACAN GTB ch25, VOR TB 113.7.',
  },

  {
    // beaconId: airfield30_0 — Radio.lua radioId airfield30_0 UHF 268MHz, callsign Soganlug
    id: 30,
    name: 'Tbilisi-Soganlug',
    nameRu: 'Тбилиси Военный',
    callsign: 'Soganlug',
    lat: 41.636100, lon: 44.954400,  // estimé depuis position adjacente à Lochini
    x: -318890.000000, z: 896610.000000,
    elevation: 467,
    defaultSide: 'blue',
    runways: [{ hdg1: 0, hdg2: 180 }],  // airdromeHeading [13] TbilisiMilitary 0/170
    radioUHF: 268,
    radioVHF: 139,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    hasFuel: true,
    region: 'georgia-east',
    notes: 'Base militaire adjacente à Lochini. Piste 01/19. Callsign Soganlug.',
  },

  {
    // beaconId: airfield31_x — ILS_LOCALIZER IVZ 108.75 (piste 31) + IVI 108.75 (piste 13)
    //   TACAN VAS ch22
    id: 31,
    name: 'Vaziani',
    nameRu: 'Вазиани',
    callsign: 'Vaziani',
    lat: 41.619095, lon: 45.037014,  // ILS localizer IVZ
    x: -320054.406250, z: 904121.937500,
    elevation: 464,
    defaultSide: 'blue',
    runways: [{ hdg1: 130, hdg2: 310 }],  // airdromeHeading [15] 0/170 → piste 13/31
    tacan: { channel: 22, callsign: 'VAS', freq: 983000000 },  // airfield31_4
    ils: [
      { freq: 108750, course: 310, rwy: '31' },  // airfield31_0 IVZ
      { freq: 108750, course: 130, rwy: '13' },  // airfield31_2 IVI
    ],
    radioUHF: 269,
    radioVHF: 140,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    hasFuel: true,
    region: 'georgia-east',
    notes: 'Base OTAN est de Tbilissi. Alt 464m. Dual ILS 108.75. TACAN VAS ch22.',
  },

  // ══ NORD CAUCASE RUSSE (Est) ═════════════════════════════════════════════════

  {
    // beaconId: airfield32_x — ILS_LOCALIZER ICH 110.5 + HOMER CX 1050kHz + C 250kHz
    id: 32,
    name: 'Beslan',
    nameRu: 'Беслан',
    callsign: 'Beslan',
    lat: 43.202754, lon: 44.625580,  // ILS localizer ICH
    x: -148692.109375, z: 845322.875000,
    elevation: 542,
    defaultSide: 'red',
    runways: [{ hdg1: 270, hdg2: 90 }],  // from beaconId direction -86.5° → piste 09/27
    ils: [{ freq: 110500, course: 270, rwy: '27' }],  // airfield32_2 ICH 110.5
    radioUHF: 270,
    radioVHF: 141,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    hasFuel: true,
    region: 'north-east',
    notes: 'Aéroport Ossétie du Nord. Alt 542m. Piste 09/27. ILS ICH 110.5. Homer CX 1050kHz.',
  },

  {
    // beaconId: airfield27_x — ILS_LOCALIZER INL 110.5 + HOMER NL/N 718kHz/350kHz
    id: 27,
    name: 'Nalchik',
    nameRu: 'Нальчик',
    callsign: 'Nalchik',
    lat: 43.508738, lon: 43.622345,  // ILS localizer INL
    x: -125664.609375, z: 759355.687500,
    elevation: 430,
    defaultSide: 'red',
    runways: [{ hdg1: 240, hdg2: 60 }],  // from beaconId direction 55.5° → piste 06/24
    ils: [{ freq: 110500, course: 60, rwy: '06' }],  // airfield27_2 INL 110.5
    radioUHF: 265,
    radioVHF: 136,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hasFuel: true,
    region: 'north-east',
    notes: 'Kabardino-Balkarie. Alt 430m. Piste 06/24. ILS INL 110.5. Homer NL 718kHz.',
  },

  {
    // beaconId: airfield26_x — ILS_LOCALIZER IMW 109.3 + IMD 111.7 + VOR MN 117.1 ch118
    id: 26,
    name: 'Mineralnyye Vody',
    nameRu: 'Минеральные Воды',
    callsign: 'Minvody',
    lat: 44.238297, lon: 43.058263,  // ILS localizer IMW
    x: -50326.437500, z: 703758.562500,
    elevation: 313,
    defaultSide: 'red',
    runways: [{ hdg1: 115, hdg2: 295 }],  // airdromeHeading [9] 260/120 → réel 115/295
    vor: { freq: 117100000, callsign: 'MN', channel: 118 },  // airfield26_8
    ils: [
      { freq: 109300, course: 115, rwy: '11' },  // airfield26_2 IMW
      { freq: 111700, course: 295, rwy: '29' },  // airfield26_6 IMD
    ],
    radioUHF: 264,
    radioVHF: 135,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    hasFuel: true,
    region: 'north-east',
    notes: 'Grande piste civile/militaire. Alt 313m. Dual ILS IMW 109.3 + IMD 111.7. VOR MN 117.1.',
  },

  {
    // beaconId: airfield28_x — PRMG ch22 MK/MZ, RSBN ch20 MZ, ILS_NEAR_HOMER R/D 1065kHz
    id: 28,
    name: 'Mozdok',
    nameRu: 'Моздок',
    callsign: 'Mozdok',
    lat: 43.792027, lon: 44.572203,  // PRMG localizer MK
    x: -83799.640625, z: 831748.812500,
    elevation: 145,
    defaultSide: 'red',
    runways: [{ hdg1: 83, hdg2: 263 }],  // from beaconId direction 82.8° → piste 08/26
    radioUHF: 266,
    radioVHF: 137,
    parkingIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    hasFuel: true,
    region: 'north-east',
    notes: 'Grande base militaire russe. Piste 08/26. PRMG ch22 MK/MZ, RSBN ch20.',
  },
];

// ── Lookup maps ──────────────────────────────────────────────────────────────

export const AIRFIELD_BY_ID: Record<number, CaucasusAirfield> =
  Object.fromEntries(CAUCASUS_AIRFIELDS.map(a => [a.id, a]));

export const AIRFIELD_BY_NAME: Record<string, CaucasusAirfield> =
  Object.fromEntries(CAUCASUS_AIRFIELDS.map(a => [a.name, a]));

/** Convertit lat/lon → coordonnées DCS x/z
 *  Coefficients calculés par régression linéaire sur les 18 aérodromes de Beacons.lua */
export function latLonToDcsXZ(lat: number, lon: number): { x: number; z: number } {
  // Points de calibration (lat, lon → x, z) issus de Beacons.lua
  // Anapa:  (45.039907, 37.396435) → (-1321.80, 246748.50)
  // Mozdok: (43.792027, 44.572203) → (-83799.64, 831748.81)
  // Lochini:(41.657953, 44.967988) → (-316544.06, 897748.50)
  // Batumi: (41.601731, 41.612203) → (-356584.81, 618472.44)
  // Kutaisi:(42.179695, 42.497820) → (-284502.84, 685199.50)
  // Beslan: (43.202754, 44.625580) → (-148692.11, 845322.88)

  // dX/dLat ≈ (x_mozdok - x_anapa) / (lat_mozdok - lat_anapa)
  const dxdLat = (-83799.64 - (-1321.80)) / (43.792027 - 45.039907);  // ≈ 66 266 m/°
  // dZ/dLon ≈ (z_lochini - z_batumi) / (lon_lochini - lon_batumi)
  const dzdLon = (897748.50 - 618472.44) / (44.967988 - 41.612203);  // ≈ 83 125 m/°

  const refLat = 45.039907, refLon = 37.396435;
  const refX = -1321.801758, refZ = 246748.500000;

  return {
    x: refX + (lat - refLat) * dxdLat,
    z: refZ + (lon - refLon) * dzdLon,
  };
}

/** Retourne les aérodromes d'un camp */
export function getAirfieldsBySide(side: 'blue' | 'red' | 'neutral'): CaucasusAirfield[] {
  return CAUCASUS_AIRFIELDS.filter(a => a.defaultSide === side);
}

/** Retourne les aérodromes dans un rayon (km) */
export function getAirfieldsNear(lat: number, lon: number, radiusKm: number): CaucasusAirfield[] {
  return CAUCASUS_AIRFIELDS.filter(a => {
    const dlat = (a.lat - lat) * 111.32;
    const dlon = (a.lon - lon) * 111.32 * Math.cos((lat * Math.PI) / 180);
    return Math.sqrt(dlat * dlat + dlon * dlon) <= radiusKm;
  });
}

/** Nombre total de spots de parking d'un aérodrome */
export function getParkingCount(airfieldId: number): number {
  const af = AIRFIELD_BY_ID[airfieldId];
  if (!af) return 0;
  return af.parkingSpots ? af.parkingSpots.length : af.parkingIds.length;
}

/** Retourne les N premiers spots disponibles pour un groupe d'appareils */
export function allocateParkingSpots(airfieldId: number, count: number): number[] {
  const af = AIRFIELD_BY_ID[airfieldId];
  if (!af) return [];
  const ids = af.parkingSpots ? af.parkingSpots.map(s => s.id) : af.parkingIds;
  return ids.slice(0, Math.min(count, ids.length));
}

/** Retourne les coordonnées DCS world d'un spot (x,z) — pour affichage sur carte */
export function getParkingSpotCoords(airfieldId: number, spotId: number): { x: number; z: number; y: number } | undefined {
  const af = AIRFIELD_BY_ID[airfieldId];
  return af?.parkingSpots?.find(s => s.id === spotId);
}

/** Retourne tous les spots d'un aérodrome filtrés par type */
export function getParkingSpots(airfieldId: number, filter?: 'plane' | 'heli' | 'all'): ParkingSpot[] {
  const af = AIRFIELD_BY_ID[airfieldId];
  if (!af?.parkingSpots) return [];
  if (!filter || filter === 'all') return af.parkingSpots;
  if (filter === 'plane') return af.parkingSpots.filter(s => s.plane);
  return af.parkingSpots.filter(s => s.heli);
}
