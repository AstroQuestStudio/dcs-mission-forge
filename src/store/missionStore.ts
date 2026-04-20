import { create } from 'zustand';
import type { MizFile, DCSGroup, DCSUnit, DCSTriggerZone, MistConfig } from '../types/dcs';

export type ActiveTab = 'map' | 'groups' | 'triggers' | 'weather' | 'mist' | 'settings' | 'warehouses';
export type SelectedEntity = { type: 'group'; coalition: string; countryIdx: number; category: string; groupIdx: number } | null;

interface MissionStore {
  miz: MizFile | null;
  selectedEntity: SelectedEntity;
  activeTab: ActiveTab;
  mistConfig: MistConfig;
  isDirty: boolean;

  loadMiz: (miz: MizFile) => void;
  clearMiz: () => void;
  selectEntity: (entity: SelectedEntity) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setMistConfig: (config: MistConfig) => void;
  updateGroup: (coalition: string, countryIdx: number, category: string, groupIdx: number, group: DCSGroup) => void;
  updateUnit: (coalition: string, countryIdx: number, category: string, groupIdx: number, unitIdx: number, unit: DCSUnit) => void;
  addGroup: (coalition: string, countryIdx: number, category: string, group: DCSGroup) => void;
  deleteGroup: (coalition: string, countryIdx: number, category: string, groupIdx: number) => void;
  updateWeather: (weather: MizFile['mission']['weather']) => void;
  updateMissionMeta: (meta: Partial<Pick<MizFile['mission'], 'sortie' | 'descriptionText' | 'descriptionBlueTask' | 'descriptionRedTask'>>) => void;
}

const DEFAULT_MIST: MistConfig = {
  enabled: false,
  autoRespawnGroups: [],
  scheduledFunctions: [],
  zoneRespawns: [],
};

export const useMissionStore = create<MissionStore>((set, get) => ({
  miz: null,
  selectedEntity: null,
  activeTab: 'map',
  mistConfig: DEFAULT_MIST,
  isDirty: false,

  loadMiz: (miz) => set({ miz, isDirty: false, selectedEntity: null }),
  clearMiz: () => set({ miz: null, isDirty: false, selectedEntity: null }),
  selectEntity: (entity) => set({ selectedEntity: entity }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setMistConfig: (config) => set({ mistConfig: config }),

  updateGroup: (coalition, countryIdx, category, groupIdx, group) => {
    const miz = get().miz;
    if (!miz) return;
    const countries = (miz.mission.coalition as Record<string, { country: unknown[] }>)[coalition]?.country;
    if (!countries) return;
    const country = countries[countryIdx] as unknown as Record<string, { group: DCSGroup[] }>;
    if (country?.[category]) {
      country[category].group[groupIdx] = group;
    }
    set({ miz: { ...miz }, isDirty: true });
  },

  updateUnit: (coalition, countryIdx, category, groupIdx, unitIdx, unit) => {
    const miz = get().miz;
    if (!miz) return;
    const countries = (miz.mission.coalition as Record<string, { country: unknown[] }>)[coalition]?.country;
    if (!countries) return;
    const country = countries[countryIdx] as unknown as Record<string, { group: DCSGroup[] }>;
    if (country?.[category]) {
      country[category].group[groupIdx].units[unitIdx] = unit;
    }
    set({ miz: { ...miz }, isDirty: true });
  },

  addGroup: (coalition, countryIdx, category, group) => {
    const miz = get().miz;
    if (!miz) return;
    const countries = (miz.mission.coalition as Record<string, { country: unknown[] }>)[coalition]?.country;
    if (!countries) return;
    const country = countries[countryIdx] as unknown as Record<string, { group: DCSGroup[] }>;
    if (!country[category]) country[category] = { group: [] };
    country[category].group.push(group);
    set({ miz: { ...miz }, isDirty: true });
  },

  deleteGroup: (coalition, countryIdx, category, groupIdx) => {
    const miz = get().miz;
    if (!miz) return;
    const countries = (miz.mission.coalition as Record<string, { country: unknown[] }>)[coalition]?.country;
    if (!countries) return;
    const country = countries[countryIdx] as unknown as Record<string, { group: DCSGroup[] }>;
    if (country?.[category]) {
      country[category].group.splice(groupIdx, 1);
    }
    set({ miz: { ...miz }, isDirty: true });
  },

  updateWeather: (weather) => {
    const miz = get().miz;
    if (!miz) return;
    set({ miz: { ...miz, mission: { ...miz.mission, weather } }, isDirty: true });
  },

  updateMissionMeta: (meta) => {
    const miz = get().miz;
    if (!miz) return;
    set({ miz: { ...miz, mission: { ...miz.mission, ...meta } }, isDirty: true });
  },
}));

/** Extraire tous les groupes de la mission avec leur contexte */
export interface GroupEntry {
  group: DCSGroup;
  coalition: 'blue' | 'red' | 'neutrals';
  countryName: string;
  countryIdx: number;
  category: 'plane' | 'helicopter' | 'vehicle' | 'ship' | 'static';
  groupIdx: number;
}

export function extractAllGroups(miz: MizFile): GroupEntry[] {
  const result: GroupEntry[] = [];
  const coalitions = ['blue', 'red', 'neutrals'] as const;
  const categories = ['plane', 'helicopter', 'vehicle', 'ship', 'static'] as const;

  for (const coal of coalitions) {
    const coalData = miz.mission.coalition[coal];
    if (!coalData) continue;
    for (let ci = 0; ci < coalData.country.length; ci++) {
      const country = coalData.country[ci];
      for (const cat of categories) {
        const catData = (country as unknown as Record<string, { group: DCSGroup[] }>)[cat];
        if (!catData?.group) continue;
        for (let gi = 0; gi < catData.group.length; gi++) {
          result.push({
            group: catData.group[gi],
            coalition: coal,
            countryName: country.name,
            countryIdx: ci,
            category: cat,
            groupIdx: gi,
          });
        }
      }
    }
  }
  return result;
}

export function extractTriggerZones(miz: MizFile): DCSTriggerZone[] {
  const zones: DCSTriggerZone[] = [];
  const rawZones = miz.mission.triggers?.zones;
  if (!rawZones || typeof rawZones !== 'object') return zones;
  for (const v of Object.values(rawZones)) {
    if (v && typeof v === 'object' && 'x' in v) zones.push(v as DCSTriggerZone);
  }
  return zones;
}
