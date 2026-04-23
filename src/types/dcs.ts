export type Coalition = 'blue' | 'red' | 'neutrals';
export type UnitCategory = 'plane' | 'helicopter' | 'vehicle' | 'ship' | 'static';
export type Skill = 'Average' | 'Good' | 'High' | 'Excellent' | 'Random' | 'Player' | 'Client';

export interface DCSPoint {
  x: number;
  y: number;
  alt?: number;
}

export interface DCSWaypoint {
  x: number;
  y: number;
  alt: number;
  type: string;
  action: string;
  speed: number;
  ETA?: number;
  ETA_locked?: boolean;
  speed_locked?: boolean;
  name?: string;
  airdromeId?: number;
  task?: Record<string, unknown>;
}

export interface DCSUnit {
  unitId: number;
  name: string;
  type: string;
  x: number;
  y: number;
  alt: number;
  heading: number;
  skill: Skill;
  playerCanDrive?: boolean;
  onboard_num?: string;
  psi?: number;
  callsign?: string | Record<string, unknown>;
  payload?: {
    pylons?: Record<string, { CLSID?: string; num?: number }>;
    fuel?: number;
    flare?: number;
    chaff?: number;
    gun?: number;
    [key: string]: unknown;
  };
  hardpoint_racks?: boolean;
}

export interface DCSGroup {
  groupId: number;
  name: string;
  x: number;
  y: number;
  hidden: boolean;
  units: DCSUnit[];
  route: { points: DCSWaypoint[] };
  task?: string;
  communication?: boolean;
  start_time?: number;
  frequency?: number;
  modulation?: number;
  uncontrolled?: boolean;
  lateActivation?: boolean;
  // MIST extensions (stored in app state, injected as Lua)
  mistAutoRespawn?: boolean;
  mistRespawnDelay?: number;
  mistRespawnZone?: string;
}

export interface DCSCoalitionData {
  bullseye?: { x: number; y: number };
  nav_points?: unknown[];
  country: DCSCountry[];
}

export interface DCSCountry {
  id: number;
  name: string;
  plane?: { group: DCSGroup[] };
  helicopter?: { group: DCSGroup[] };
  vehicle?: { group: DCSGroup[] };
  ship?: { group: DCSGroup[] };
  static?: { group: DCSGroup[] };
}

export interface DCSTriggerZone {
  name: string;
  type: number; // 0=circle, 2=polygon
  x: number;
  y: number;
  radius: number;
  color?: [number, number, number, number];
  properties?: Record<string, unknown>;
}

export interface DCSCondition {
  type: 'time' | 'flag' | 'unitDead' | 'groupDead' | 'unitInZone' | 'missionStart';
  params?: Record<string, unknown>;
}

export interface DCSAction {
  type: 'setFlag' | 'message' | 'smokeMarker' | 'explosion' | 'sound' | 'stopMission' | 'lua';
  params?: Record<string, unknown>;
}

export interface DCSTrigger {
  triggerType: 'once' | 'repetitive' | 'switched' | 'missionStart' | 'noEvent';
  eventName?: string;
  condition: DCSCondition;
  actions: DCSAction[];
  comment?: string;
}

export interface DCSWeatherWind {
  speed: number;
  dir: number;
}

export interface DCSWeatherClouds {
  thickness?: number;
  density: number;
  preset?: string;
  base: number;
  iprecptns: number;
}

export interface DCSWeather {
  atmosphere_type: number;
  wind: { atGround: DCSWeatherWind; at2000: DCSWeatherWind; at8000: DCSWeatherWind };
  enable_fog: boolean;
  fog: { visibility: number; thickness: number; density: number };
  haze: { visibility: number; density: number };
  clouds: DCSWeatherClouds;
  visibility: { distance: number };
  dust_density: number;
  enable_dust: boolean;
  qnh: number;
  season: { temperature: number };
  type_weather: number;
}

export interface DCSWarehouseAirport {
  coalition: string;
  planes?: Record<string, number>;
  helicopters?: Record<string, number>;
  fuel?: Record<string, { InitFuel: number }>;
  weapons?: Record<string, { count: number; wsType: string[] }>;
  OperatingLevel_Air?: number;
  OperatingLevel_Eqp?: number;
  OperatingLevel_Fuel?: number;
}

export interface DCSOtherProperties {
  difficulty?: Record<string, unknown>;
  miscellaneous?: Record<string, unknown>;
}

export interface DCSMission {
  theatre: string;
  date: { Day: number; Month: number; Year: number };
  start_time: number;
  version: number;
  coalition: {
    blue: DCSCoalitionData;
    red: DCSCoalitionData;
    neutrals?: DCSCoalitionData;
  };
  triggers?: {
    zones?: DCSTriggersSection;
  };
  trigrules?: DCSTrigger[];
  weather: DCSWeather;
  groundControl?: Record<string, unknown>;
  result?: Record<string, unknown>;
  pictureFileNameB?: string[];
  pictureFileNameR?: string[];
  descriptionBlueTask?: string;
  descriptionRedTask?: string;
  descriptionNeutralsTask?: string;
  descriptionText?: string;
  sortie?: string;
  forcedOptions?: Record<string, unknown>;
  failures?: unknown[];
  map?: string;
}

export interface DCSTriggersSection {
  [key: string]: DCSTriggersSection | DCSTriggersSection[] | DCSTriggerZone | unknown;
}

export interface DCSWarehouses {
  airports: Record<string, DCSWarehouseAirport>;
  warehouses?: Record<string, unknown>;
}

export interface MizFile {
  mission: DCSMission;
  warehouses: DCSWarehouses;
  options: Record<string, unknown>;
  theatre: string;
  dictionary?: Record<string, string>;
}

export interface MistConfig {
  enabled: boolean;
  autoRespawnGroups: MistAutoRespawn[];
  scheduledFunctions: MistScheduled[];
  zoneRespawns: MistZoneRespawn[];
}

export interface MistAutoRespawn {
  groupName: string;
  delay: number;
  retakeTask: boolean;
}

export interface MistScheduled {
  groupName: string;
  functionCode: string;
  delay: number;
}

export interface MistZoneRespawn {
  groupName: string;
  zoneName: string;
  delay: number;
}
