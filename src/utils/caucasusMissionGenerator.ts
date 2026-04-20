/**
 * Générateur de missions .miz pour DCS World — Théâtre Caucase
 * Génère un vrai fichier .miz importable directement dans DCS.
 */

import JSZip from 'jszip';
import { serializeLuaTable } from './luaParser';
import { CAUCASUS_AIRFIELDS, latLonToDcsXZ, allocateParkingSpots, type CaucasusAirfield } from './caucasusAirfields';
import type { MissionGeneratorConfig } from './missionGeneratorData';
import { MISSION_TASKS, DIFFICULTY_LEVELS, WEATHER_PRESETS, SEASONS, TIMES_OF_DAY } from './missionGeneratorData';

// ── Scénarios prédéfinis ──────────────────────────────────────────────────

export interface CaucasusScenario {
  id: string;
  name: string;
  description: string;
  blueBase: number;    // ID aérodrome bleu principal
  redBase: number;     // ID aérodrome rouge principal
  frontLine: { lat: number; lon: number }[];  // Ligne de front approximative
  battleZone: { lat: number; lon: number; radiusKm: number };
  suggestedTask: string;
  historicalContext: string;
  decade: string;
}

export const CAUCASUS_SCENARIOS: CaucasusScenario[] = [
  {
    id: 'coast_war',
    name: '⚔️ Guerre côtière — Batumi vs Anapa',
    description: 'Conflit en mer Noire. La coalition bleue défend la côte géorgienne face aux forces russes depuis Anapa et Krasnodar.',
    blueBase: 22,    // Batumi
    redBase: 12,     // Anapa
    frontLine: [
      { lat: 43.5, lon: 39.5 }, { lat: 43.0, lon: 40.5 }, { lat: 42.5, lon: 41.2 },
    ],
    battleZone: { lat: 43.2, lon: 40.0, radiusKm: 80 },
    suggestedTask: 'cas',
    historicalContext: 'Inspiré du conflit russo-géorgien de 2008. La mer Noire devient un enjeu stratégique.',
    decade: '2000',
  },
  {
    id: 'tbilisi_push',
    name: '🛡 Défense de Tbilissi',
    description: 'Forces russes progressent depuis le nord. La coalition bleue défend Tbilissi-Lochini et Vaziani contre des frappes.',
    blueBase: 29,    // Lochini
    redBase: 28,     // Mozdok
    frontLine: [
      { lat: 42.8, lon: 43.5 }, { lat: 43.0, lon: 44.0 }, { lat: 43.2, lon: 44.8 },
    ],
    battleZone: { lat: 42.8, lon: 44.5, radiusKm: 100 },
    suggestedTask: 'dca',
    historicalContext: 'Guerre des 5 jours 2008 — avancée russe vers Tbilissi stoppée par l\'OTAN.',
    decade: '2000',
  },
  {
    id: 'south_ossetia',
    name: '🏔 Ossétie du Sud — Guerre de montagne',
    description: 'Combat en haute altitude autour de Gori et Tskhinvali. Appui sol intensif dans le relief caucasien.',
    blueBase: 25,    // Kutaisi
    redBase: 32,     // Beslan
    frontLine: [
      { lat: 42.4, lon: 43.8 }, { lat: 42.2, lon: 44.2 }, { lat: 42.0, lon: 44.7 },
    ],
    battleZone: { lat: 42.2, lon: 44.0, radiusKm: 70 },
    suggestedTask: 'cas',
    historicalContext: 'Terrain montagneux, SAM russes sur les cols, JTAC au sol.',
    decade: '2000',
  },
  {
    id: 'abkhazia_sea',
    name: '🌊 Abkhazie — Assaut amphibie',
    description: 'Débarquement amphibie depuis la mer Noire. La flotte russe menace Soukhoumi et Poti.',
    blueBase: 20,    // Sukhumi
    redBase: 18,     // Sochi
    frontLine: [
      { lat: 43.1, lon: 40.8 }, { lat: 42.9, lon: 41.2 }, { lat: 42.7, lon: 41.8 },
    ],
    battleZone: { lat: 43.0, lon: 41.3, radiusKm: 90 },
    suggestedTask: 'anti_ship',
    historicalContext: 'Scénario naval — croiseurs et destroyers russes appuient les forces terrestres abkhaziennes.',
    decade: '2010',
  },
  {
    id: 'red_flag_caucasus',
    name: '🎯 Red Flag Caucase — Entraînement OTAN',
    description: 'Exercice OTAN réaliste. Pénétration dans un environnement A2/AD dense avec IADS, CAP et SAM intégrés.',
    blueBase: 31,    // Vaziani
    redBase: 27,     // Nalchik
    frontLine: [
      { lat: 42.8, lon: 43.0 }, { lat: 43.0, lon: 44.0 }, { lat: 43.3, lon: 45.0 },
    ],
    battleZone: { lat: 43.0, lon: 43.8, radiusKm: 120 },
    suggestedTask: 'sead',
    historicalContext: 'Entraînement inspiré des exercices Red Flag — IADS russe complet, SAM SA-10/SA-11.',
    decade: '2020',
  },
  {
    id: 'krasnodar_strike',
    name: '💣 Strike sur Krasnodar',
    description: 'Mission de frappe profonde depuis Géorgie contre les infrastructures militaires de Krasnodar.',
    blueBase: 29,    // Lochini
    redBase: 13,     // Krasnodar
    frontLine: [
      { lat: 43.5, lon: 41.0 }, { lat: 43.8, lon: 42.0 }, { lat: 44.2, lon: 43.0 },
    ],
    battleZone: { lat: 44.5, lon: 38.5, radiusKm: 100 },
    suggestedTask: 'strike',
    historicalContext: 'Frappe stratégique profonde avec escorte SEAD. Distance aller-retour ~600 km.',
    decade: '2020',
  },
  {
    id: 'iran_proxy',
    name: '🇮🇷 Proxy War — Front caucasien',
    description: 'Conflit par procuration : Iran et Russie soutiennent les forces séparatistes contre l\'OTAN.',
    blueBase: 23,    // Senaki
    redBase: 26,     // Mineralnyye Vody
    frontLine: [
      { lat: 42.5, lon: 43.5 }, { lat: 43.0, lon: 44.0 }, { lat: 43.5, lon: 44.5 },
    ],
    battleZone: { lat: 43.0, lon: 43.8, radiusKm: 100 },
    suggestedTask: 'cap',
    historicalContext: 'Équipement iranien (F-14, MiG-29) aux côtés des forces russes.',
    decade: '1990',
  },
  {
    id: 'ww2_eastern_front',
    name: '✈️ Front Oriental WWII',
    description: 'Guerre aérienne 1943 en Caucase. Bf-109 et FW-190 contre Spitfires et P-51.',
    blueBase: 22,    // Batumi
    redBase: 12,     // Anapa
    frontLine: [
      { lat: 44.0, lon: 39.0 }, { lat: 43.5, lon: 40.0 }, { lat: 43.0, lon: 41.0 },
    ],
    battleZone: { lat: 43.5, lon: 40.0, radiusKm: 150 },
    suggestedTask: 'cap',
    historicalContext: 'Batalla del Cáucaso 1942-43 — Luftwaffe vs VVS au-dessus du Kouban.',
    decade: '1940',
  },
];

// ── Pools d'unités par époque et côté ────────────────────────────────────

interface UnitPool {
  fighters: string[];
  attackers: string[];
  bombers: string[];
  transports: string[];
  awacs: string[];
  helis: string[];
  tanks: string[];
  sams: string[];
  ships: string[];
}

const BLUE_UNITS_MODERN: UnitPool = {
  fighters:  ['F-15C', 'F-16C_50', 'FA-18C_hornet', 'F-14B', 'M-2000C'],
  attackers: ['A-10C', 'A-10C_2', 'AV8BNA', 'F-16C_50'],
  bombers:   ['F-15E', 'B-52H'],
  transports:['C-130'],
  awacs:     ['E-3A'],
  helis:     ['AH-64D_BLK_II', 'UH-1H'],
  tanks:     ['M-1 Abrams', 'M-2 Bradley'],
  sams:      ['Patriot AIO', 'Chaparral'],
  ships:     ['PERRY'],
};

const RED_UNITS_MODERN: UnitPool = {
  fighters:  ['Su-27', 'MiG-29A', 'MiG-29S', 'Su-33'],
  attackers: ['Su-25', 'Su-25T', 'Su-34'],
  bombers:   ['Tu-22M3', 'Tu-95MS'],
  transports:['Il-76MD'],
  awacs:     ['A-50'],
  helis:     ['Mi-24V', 'Ka-50'],
  tanks:     ['T-72B', 'T-80UD', 'BMP-2'],
  sams:      ['SA-10 Grumble', 'SA-11 Buk SR', 'SA-6 Kub STR', 'ZSU-23-4 Shilka'],
  ships:     ['Moskva'],
};

const BLUE_UNITS_WWII: UnitPool = {
  fighters:  ['P-51D', 'Spitfire', 'P-47D-30'],
  attackers: ['P-47D-30', 'A-20G'],
  bombers:   ['B-17G'],
  transports:['C-47'],
  awacs:     [],
  helis:     [],
  tanks:     ['M4_Sherman'],
  sams:      [],
  ships:     [],
};

const RED_UNITS_WWII: UnitPool = {
  fighters:  ['Bf 109K-4', 'FW-190A8', 'FW-190D9'],
  attackers: ['FW-190A8'],
  bombers:   ['He 111H-16'],
  transports:[],
  awacs:     [],
  helis:     [],
  tanks:     ['Pz_IV_H', 'Tiger'],
  sams:      ['88FlaK'],
  ships:     [],
};

function getUnitPool(coalition: 'blue' | 'red', decade: string): UnitPool {
  const isWWII = decade === '1940' || decade === '1950';
  if (coalition === 'blue') return isWWII ? BLUE_UNITS_WWII : BLUE_UNITS_MODERN;
  return isWWII ? RED_UNITS_WWII : RED_UNITS_MODERN;
}

// ── Générateur de mission .miz ────────────────────────────────────────────

export interface GeneratedMissionResult {
  blob: Blob;
  filename: string;
  summary: {
    blueAirbase: string;
    redAirbase: string;
    scenario: string;
    totalGroups: number;
    weather: string;
  };
}

let _groupIdCounter = 1;
let _unitIdCounter = 100;
// Track allocated parking spots per airdrome to éviter les collisions
const _parkingAllocated: Record<number, number> = {};

function nextGroupId() { return _groupIdCounter++; }
function nextUnitId()  { return _unitIdCounter++; }


function makeAircraftGroup(
  name: string,
  unitType: string,
  count: number,
  startX: number,
  startZ: number,
  waypointX: number,
  waypointZ: number,
  alt: number,
  skill: string,
  isPlayer: boolean,
  startAirdromeId?: number,
) {
  const groupId = nextGroupId();
  // Alloue des spots de parking réels pour chaque unité du groupe
  const parkingSpots = startAirdromeId
    ? allocateParkingSpots(startAirdromeId, count)
    : [];

  const units = Array.from({ length: count }, (_, i) => {
    const parkingId = parkingSpots[i];
    return {
      unitId: nextUnitId(),
      name: `${name} #${i + 1}`,
      type: unitType,
      // Quand en parking, x/y = position de l'aérodrome (DCS place l'unité au spot)
      x: startX,
      y: startZ,
      alt: 0,
      heading: 0,
      skill: isPlayer ? 'Player' : skill,
      onboard_num: String(10 + i).padStart(3, '0'),
      callsign: {
        [1]: name.split(' ')[0].substring(0, 3).toUpperCase(),
        [2]: 1,
        [3]: i + 1,
        name: `${name.substring(0, 3).toUpperCase()}${i + 1}`,
      },
      payload: { fuel: 100, flare: 60, chaff: 60, gun: 100, pylons: {} },
      // Champs parking DCS (clés avec strings pour sérialisation Lua)
      ...(parkingId !== undefined ? { parking: parkingId } : {}),
      ...(parkingId !== undefined ? { parking_landing: parkingId } : {}),
    };
  });

  // Waypoint de départ : TakeOffParking si aérodrome connu
  const takeoffWP = startAirdromeId ? {
    x: startX, y: startZ, alt: 0,
    type: 'TakeOffParking',
    action: 'From Parking Area',
    speed: 0, ETA: 0, ETA_locked: true, speed_locked: true,
    airdromeId: startAirdromeId,
    name: 'Départ',
  } : {
    x: startX, y: startZ, alt,
    type: 'Turning Point', action: 'Turning Point',
    speed: 200, name: 'WP1',
  };

  return {
    groupId,
    name,
    x: startX,
    y: startZ,
    hidden: false,
    uncontrolled: false,
    communication: true,
    frequency: 251000000,
    modulation: 0,
    task: 'CAP',
    units,
    route: {
      points: [
        takeoffWP,
        {
          x: waypointX, y: waypointZ, alt,
          type: 'Turning Point', action: 'Turning Point',
          speed: 220, name: 'Objectif',
        },
      ],
    },
  };
}

function makeGroundGroup(
  name: string,
  unitType: string,
  count: number,
  x: number,
  z: number,
  skill: string,
) {
  const groupId = nextGroupId();
  return {
    groupId,
    name,
    x, y: z,
    hidden: false,
    units: Array.from({ length: count }, (_, i) => ({
      unitId: nextUnitId(),
      name: `${name} #${i + 1}`,
      type: unitType,
      x: x + (i % 3) * 60,
      y: z + Math.floor(i / 3) * 60,
      alt: 0,
      heading: 0,
      skill,
      playerCanDrive: false,
    })),
    route: { points: [{ x, y: z, alt: 0, type: 'Turning Point', action: 'Stopping', speed: 0 }] },
  };
}

function makeWeather(config: MissionGeneratorConfig) {
  const w = WEATHER_PRESETS.find(p => p.id === config.weatherId);
  const isStorm = config.weatherId === 'storm';
  const isFog   = config.weatherId === 'fog';
  const isDust  = config.weatherId === 'dust';

  return {
    atmosphere_type: 0,
    wind: {
      atGround: { speed: w?.wind ?? (isStorm ? 12 : 2), dir: 45 },
      at2000:   { speed: (w?.wind ?? 2) + 5, dir: 50 },
      at8000:   { speed: (w?.wind ?? 2) + 15, dir: 60 },
    },
    enable_fog: isFog,
    fog: { visibility: isFog ? 800 : 6000, thickness: isFog ? 500 : 0, density: isFog ? 7 : 0 },
    haze: { visibility: 4000, density: 4 },
    clouds: {
      density: isStorm ? 10 : (config.weatherId === 'overcast' ? 8 : (config.weatherId === 'few' ? 3 : 0)),
      base: w?.cloudBase ?? 3000,
      thickness: isStorm ? 2000 : 500,
      iprecptns: isStorm ? 1 : 0,
    },
    visibility: { distance: Math.round((w?.visibility ?? 80) * 1000) },
    dust_density: isDust ? 3000 : 0,
    enable_dust: isDust,
    qnh: 760,
    season: { temperature: getTemperature(config) },
    type_weather: 0,
  };
}

function getTemperature(config: MissionGeneratorConfig): number {
  const season = SEASONS.find(s => s.id === config.seasonId);
  const temps: Record<number, number> = { 1: 2, 4: 14, 7: 28, 10: 12 };
  return temps[season?.month ?? 7] ?? 20;
}

function getMissionDate(config: MissionGeneratorConfig): { Day: number; Month: number; Year: number } {
  const season = SEASONS.find(s => s.id === config.seasonId);
  const decade = parseInt(config.decadeId);
  const year = decade === 1940 ? 1943 : decade === 1950 ? 1953 : decade + 5;
  return { Day: 15, Month: season?.month ?? 7, Year: year };
}

function getStartTime(config: MissionGeneratorConfig): number {
  const t = TIMES_OF_DAY.find(td => td.id === config.timeOfDay);
  return (t?.hour ?? 9) * 3600;
}

function makeWarehouseEntry(_airfieldName: string, side: string) {
  return {
    coalition: side,
    OperatingLevel_Air: 0.5,
    OperatingLevel_Eqp: 0.5,
    OperatingLevel_Fuel: 0.5,
    planes: {},
    helicopters: {},
    weapons: {},
    fuel: {
      'Jet': { InitFuel: 100000 },
      'Diesel': { InitFuel: 50000 },
    },
  };
}

// ── Fonction principale ───────────────────────────────────────────────────

export async function generateCaucasusMiz(
  config: MissionGeneratorConfig,
  scenarioId?: string,
): Promise<GeneratedMissionResult> {
  // Reset counters
  _groupIdCounter = 1;
  _unitIdCounter = 100;
  Object.keys(_parkingAllocated).forEach(k => delete _parkingAllocated[Number(k)]);

  const scenario = CAUCASUS_SCENARIOS.find(s => s.id === scenarioId) ?? CAUCASUS_SCENARIOS[0];
  const task = MISSION_TASKS.find(t => t.id === config.taskId) ?? MISSION_TASKS[0];
  const difficulty = DIFFICULTY_LEVELS.find(d => d.id === config.difficultyId) ?? DIFFICULTY_LEVELS[2];
  const aiSkill = difficulty.aiSkill;

  const blueAirfield = CAUCASUS_AIRFIELDS.find(a => a.id === scenario.blueBase)!;
  const redAirfield  = CAUCASUS_AIRFIELDS.find(a => a.id === scenario.redBase)!;

  const bluePool = getUnitPool('blue', config.decadeId);
  const redPool  = getUnitPool('red', config.decadeId);

  // Positions de départ (autour des bases)
  const bx = blueAirfield.x, bz = blueAirfield.z;
  const rx = redAirfield.x,  rz = redAirfield.z;

  // Zone de combat (milieu entre les deux bases)
  const battleX = (bx + rx) / 2;
  const battleZ = (bz + rz) / 2;
  const offsetX = (battleX - bx) * 0.6;
  const offsetZ = (battleZ - bz) * 0.6;

  const blueGroups: unknown[] = [];
  const redGroups: unknown[]  = [];

  // ── Groupes BLEUS ────────────────────────────────────────────────────────

  // 1 — Groupe joueur (chasseur / rôle de la mission)
  const playerType = bluePool.fighters[0] ?? 'F-16C_50';
  blueGroups.push(makeAircraftGroup(
    `Player Flight`, playerType, 2,
    bx, bz,
    bx + offsetX, bz + offsetZ,
    5000, 'Player', true,
    blueAirfield.id,
  ));

  // 2 — Escorte alliée (si non mission de chasse pure)
  if (task.id !== 'cap' && bluePool.fighters.length > 0) {
    blueGroups.push(makeAircraftGroup(
      `Blue CAP Flight`, bluePool.fighters[0], 2,
      bx + 500, bz + 500,
      bx + offsetX * 0.8, bz + offsetZ * 0.8,
      6000, aiSkill, false,
      blueAirfield.id,
    ));
  }

  // 3 — AWACS si feature activée
  if (config.features.includes('awacs_blue') && bluePool.awacs.length > 0) {
    blueGroups.push(makeAircraftGroup(
      `Blue AWACS`, bluePool.awacs[0], 1,
      bx - 20000, bz - 20000,
      bx - 25000, bz - 25000,
      9000, aiSkill, false,
    ));
  }

  // 4 — Tanker si feature activée
  if (config.features.includes('tanker_blue') && bluePool.transports.length > 0) {
    blueGroups.push(makeAircraftGroup(
      `Blue Tanker`, 'KC-135', 1,
      bx - 15000, bz - 15000,
      bx - 18000, bz - 18000,
      8000, aiSkill, false,
    ));
  }

  // 5 — Blindés alliés si feature activée
  if (config.features.includes('friendly_armor') && bluePool.tanks.length > 0) {
    const { x: armX, z: armZ } = latLonToDcsXZ(
      scenario.frontLine[0].lat + 0.1,
      scenario.frontLine[0].lon + 0.1,
    );
    blueGroups.push(makeGroundGroup(`Blue Armor`, bluePool.tanks[0], 4, armX, armZ, aiSkill));
  }

  // ── Groupes ROUGES ───────────────────────────────────────────────────────

  // 1 — CAP ennemie
  const capStrength = { none: 0, weak: 1, medium: 2, strong: 3, overwhelming: 4 };
  const capCount = capStrength[difficulty.capStrength as keyof typeof capStrength] ?? 2;
  for (let i = 0; i < capCount; i++) {
    const fighterType = redPool.fighters[i % redPool.fighters.length] ?? 'MiG-29A';
    redGroups.push(makeAircraftGroup(
      `Red CAP ${i + 1}`, fighterType, 2,
      rx + (i * 1000), rz + (i * 1000),
      battleX + (Math.random() - 0.5) * 30000,
      battleZ + (Math.random() - 0.5) * 30000,
      5500 + i * 500, aiSkill, false,
      redAirfield.id,
    ));
  }

  // 2 — SAM selon densité
  const samDensityMap = { none: 0, low: 1, medium: 2, high: 3, extreme: 5 };
  const samCount = samDensityMap[difficulty.samDensity as keyof typeof samDensityMap] ?? 2;
  const samTypes = redPool.sams;
  for (let i = 0; i < samCount && samTypes.length > 0; i++) {
    const samType = samTypes[i % samTypes.length];
    const spread = 20000;
    const samX = battleX + (Math.random() - 0.5) * spread;
    const samZ = battleZ + (Math.random() - 0.5) * spread;
    const offset = i * 5000;
    redGroups.push(makeGroundGroup(`Red SAM ${i + 1}`, samType, 1, samX + offset, samZ + offset, aiSkill));
  }

  // 3 — Blindés ennemis
  if (config.features.includes('enemy_armor') && redPool.tanks.length > 0) {
    const { x: armX, z: armZ } = latLonToDcsXZ(
      scenario.frontLine[0].lat - 0.1,
      scenario.frontLine[0].lon - 0.1,
    );
    redGroups.push(makeGroundGroup(`Red Armor`, redPool.tanks[0], 6, armX, armZ, aiSkill));
  }

  // 4 — Bombardiers ennemis si feature
  if (config.features.includes('bomber_attack') && redPool.bombers.length > 0) {
    redGroups.push(makeAircraftGroup(
      `Red Bombers`, redPool.bombers[0], 2,
      rx + 2000, rz + 2000,
      bx + offsetX * 0.9, bz + offsetZ * 0.9,
      4000, aiSkill, false,
      redAirfield.id,
    ));
  }

  // ── Bullseyes ────────────────────────────────────────────────────────────
  const blueBullseye = { x: bx + offsetX * 0.5, y: bz + offsetZ * 0.5 };
  const redBullseye  = { x: rx - offsetX * 0.5, y: rz - offsetZ * 0.5 };

  // ── Zones trigger ────────────────────────────────────────────────────────
  const zones = {
    1: {
      name: 'Zone Objectif',
      type: 0,
      x: battleX,
      y: battleZ,
      radius: 15000,
      color: [1, 0, 0, 0.5],
    },
    2: {
      name: 'Zone Sécurisée Bleue',
      type: 0,
      x: bx,
      y: bz,
      radius: 20000,
      color: [0, 0, 1, 0.3],
    },
  };

  // ── Coalitions DCS ────────────────────────────────────────────────────────
  // Pays USA pour bleu, Russie pour rouge
  const blueCoalition = {
    bullseye: blueBullseye,
    nav_points: [],
    country: [{
      id: 2,
      name: 'USA',
      plane: { group: blueGroups.filter((g: unknown) => {
        const gg = g as { units: { alt: number }[] };
        return gg.units?.[0]?.alt === 0 || gg.units?.[0]?.alt > 0;
      }).filter((g: unknown) => {
        const gg = g as { units: { type: string }[] };
        const t = gg.units?.[0]?.type ?? '';
        return !['M-1 Abrams','T-72B','BMP-2','M-2 Bradley','Patriot AIO','Chaparral','M4_Sherman'].includes(t);
      }) },
      vehicle: { group: blueGroups.filter((g: unknown) => {
        const gg = g as { units: { type: string }[] };
        const t = gg.units?.[0]?.type ?? '';
        return ['M-1 Abrams','T-72B','BMP-2','M-2 Bradley','Patriot AIO','Chaparral','M4_Sherman'].includes(t);
      }) },
    }],
  };

  const redCoalition = {
    bullseye: redBullseye,
    nav_points: [],
    country: [{
      id: 0,
      name: 'Russia',
      plane: { group: redGroups.filter((g: unknown) => {
        const gg = g as { units: { type: string }[] };
        const t = gg.units?.[0]?.type ?? '';
        return !['T-72B','T-80UD','BMP-2','SA-10 Grumble','SA-11 Buk SR','SA-6 Kub STR','ZSU-23-4 Shilka','88FlaK','Tiger','Pz_IV_H'].includes(t);
      }) },
      vehicle: { group: redGroups.filter((g: unknown) => {
        const gg = g as { units: { type: string }[] };
        const t = gg.units?.[0]?.type ?? '';
        return ['T-72B','T-80UD','BMP-2','SA-10 Grumble','SA-11 Buk SR','SA-6 Kub STR','ZSU-23-4 Shilka','88FlaK','Tiger','Pz_IV_H'].includes(t);
      }) },
    }],
  };

  // ── Mission Lua ───────────────────────────────────────────────────────────
  const mission = {
    theatre: 'Caucasus',
    version: 1,
    date: getMissionDate(config),
    start_time: getStartTime(config),
    sortie: config.missionName || scenario.name,
    descriptionText: buildBriefingText(config, scenario, blueAirfield, redAirfield),
    descriptionBlueTask: `${task.label}\n\n${task.objectives.join('\n')}`,
    descriptionRedTask: `Défendre votre territoire contre l'attaque ennemie.`,
    coalition: {
      blue:     blueCoalition,
      red:      redCoalition,
      neutrals: { bullseye: { x: 0, y: 0 }, nav_points: [], country: [] },
    },
    triggers: { zones },
    trigrules: [],
    result: { blueScore: 0, redScore: 0, neutralScore: 0 },
    weather: makeWeather(config),
    groundControl: { isPilotControlVehicles: false, roles: { Instructor: 0, ArtilleryCommander: 0, ForwardObserver: 0, Spectrator: 0 } },
    forcedOptions: {},
    failures: [],
    pictureFileNameB: [],
    pictureFileNameR: [],
  };

  // ── Warehouses ────────────────────────────────────────────────────────────
  const airports: Record<string, unknown> = {};
  CAUCASUS_AIRFIELDS.forEach(a => {
    const side = a.defaultSide === 'blue' ? 'BLUE' : a.defaultSide === 'red' ? 'RED' : 'NEUTRAL';
    airports[a.name] = makeWarehouseEntry(a.name, side);
  });

  const warehouses = { airports, warehouses: {} };

  // ── Options ───────────────────────────────────────────────────────────────
  const options = {
    difficulty: {
      padlock: false,
      birds: 0,
      cockpitVisualRM: false,
      easyCommunication: false,
      immortal: false,
      invulnerableVehicles: false,
      unrestrictedSATNAV: true,
      hideTargetInfo: false,
    },
    views: {},
  };

  // ── Assemblage .miz ───────────────────────────────────────────────────────
  const zip = new JSZip();
  zip.file('mission',    `mission =\n${serializeLuaTable(mission)}\n`);
  zip.file('warehouses', `warehouses =\n${serializeLuaTable(warehouses)}\n`);
  zip.file('options',    `options =\n${serializeLuaTable(options)}\n`);
  zip.file('theatre', 'Caucasus');
  zip.file('l10n/DEFAULT/dictionary', `dictionary =\n${serializeLuaTable({ ['DictKey_descriptionText_0']: mission.descriptionText })}\n`);
  zip.file('l10n/DEFAULT/mapResource', 'mapResource = {}');

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const totalGroups = blueGroups.length + redGroups.length;
  const filename = `${(config.missionName || scenario.id).replace(/[^a-z0-9_]/gi, '_')}_Caucasus.miz`;

  return {
    blob,
    filename,
    summary: {
      blueAirbase: blueAirfield.name,
      redAirbase: redAirfield.name,
      scenario: scenario.name,
      totalGroups,
      weather: WEATHER_PRESETS.find(w => w.id === config.weatherId)?.label ?? 'CAVOK',
    },
  };
}

// ── Briefing texte ────────────────────────────────────────────────────────

function buildBriefingText(
  config: MissionGeneratorConfig,
  scenario: CaucasusScenario,
  blueBase: CaucasusAirfield,
  redBase: CaucasusAirfield,
): string {
  const task = MISSION_TASKS.find(t => t.id === config.taskId);
  const diff = DIFFICULTY_LEVELS.find(d => d.id === config.difficultyId);
  const weather = WEATHER_PRESETS.find(w => w.id === config.weatherId);
  const season  = SEASONS.find(s => s.id === config.seasonId);
  const time    = TIMES_OF_DAY.find(t => t.id === config.timeOfDay);

  return [
    `=== ${config.missionName || scenario.name} ===`,
    ``,
    `THÉÂTRE : Caucase (${scenario.name})`,
    `DATE    : ${season?.label}, ${time?.label}`,
    `MÉTÉO   : ${weather?.label} — vis ${weather?.visibility} km`,
    ``,
    `SITUATION :`,
    scenario.historicalContext,
    ``,
    `VOTRE MISSION : ${task?.label}`,
    ...(task?.objectives.map(o => `• ${o}`) ?? []),
    ``,
    `BASE BLEUE   : ${blueBase.name} (TACAN ${blueBase.tacan ? blueBase.tacan.channel + '/' + blueBase.tacan.callsign : 'N/A'})`,
    `  ATC UHF ${blueBase.radioUHF} MHz · VHF ${blueBase.radioVHF} MHz`,
    `  Piste(s) : ${blueBase.runways.map(r => `${r.hdg1}°/${r.hdg2}°`).join(', ')}`,
    ``,
    `BASE ROUGE   : ${redBase.name}`,
    ``,
    `DIFFICULTÉ   : ${diff?.label} — IA ${diff?.aiSkill}, SAM ${diff?.samDensity}`,
    ``,
    `Bonne chance. Restez sur la fréquence.`,
  ].join('\n');
}
