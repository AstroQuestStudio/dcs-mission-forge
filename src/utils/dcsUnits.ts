export interface UnitDef {
  type: string;
  name: string;
  category: 'plane' | 'helicopter' | 'vehicle' | 'ship' | 'static';
  coalition: 'blue' | 'red' | 'both';
}

export const DCS_UNITS: UnitDef[] = [
  // ── Avions OTAN (bleu)
  { type: 'F-16C_50', name: 'F-16C Fighting Falcon', category: 'plane', coalition: 'blue' },
  { type: 'FA-18C_hornet', name: 'F/A-18C Hornet', category: 'plane', coalition: 'blue' },
  { type: 'F-15C', name: 'F-15C Eagle', category: 'plane', coalition: 'blue' },
  { type: 'F-15ESE', name: 'F-15E Strike Eagle', category: 'plane', coalition: 'blue' },
  { type: 'A-10C_2', name: 'A-10C II Thunderbolt', category: 'plane', coalition: 'blue' },
  { type: 'AV8BNA', name: 'AV-8B Harrier', category: 'plane', coalition: 'blue' },
  { type: 'M-2000C', name: 'Mirage 2000C', category: 'plane', coalition: 'blue' },
  { type: 'JF-17', name: 'JF-17 Thunder', category: 'plane', coalition: 'blue' },
  { type: 'F-14A-135-GR', name: 'F-14A Tomcat', category: 'plane', coalition: 'blue' },
  { type: 'F-14B', name: 'F-14B Tomcat', category: 'plane', coalition: 'blue' },
  { type: 'C-101EB', name: 'C-101 Aviojet', category: 'plane', coalition: 'blue' },
  { type: 'L-39C', name: 'L-39C Albatros', category: 'plane', coalition: 'both' },
  { type: 'P-51D', name: 'P-51D Mustang', category: 'plane', coalition: 'blue' },
  { type: 'Spitfire', name: 'Spitfire LF Mk.IX', category: 'plane', coalition: 'blue' },
  { type: 'A-10C', name: 'A-10C Thunderbolt', category: 'plane', coalition: 'blue' },
  // ── Avions RUSSIA (rouge)
  { type: 'Su-27', name: 'Su-27 Flanker', category: 'plane', coalition: 'red' },
  { type: 'Su-33', name: 'Su-33 Flanker-D', category: 'plane', coalition: 'red' },
  { type: 'MiG-29A', name: 'MiG-29A Fulcrum', category: 'plane', coalition: 'red' },
  { type: 'MiG-29S', name: 'MiG-29S Fulcrum-C', category: 'plane', coalition: 'red' },
  { type: 'MiG-21Bis', name: 'MiG-21bis Fishbed', category: 'plane', coalition: 'red' },
  { type: 'Su-25', name: 'Su-25 Frogfoot', category: 'plane', coalition: 'red' },
  { type: 'Su-25T', name: 'Su-25T Frogfoot', category: 'plane', coalition: 'red' },
  { type: 'Su-24MR', name: 'Su-24MR Fencer', category: 'plane', coalition: 'red' },
  { type: 'Tu-22M3', name: 'Tu-22M3 Backfire', category: 'plane', coalition: 'red' },
  // ── Hélicoptères
  { type: 'UH-1H', name: 'UH-1H Huey', category: 'helicopter', coalition: 'blue' },
  { type: 'Mi-8MT', name: 'Mi-8MTV2 Hip', category: 'helicopter', coalition: 'both' },
  { type: 'Ka-50', name: 'Ka-50 Black Shark', category: 'helicopter', coalition: 'red' },
  { type: 'Ka-50_3', name: 'Ka-50-3 Black Shark 3', category: 'helicopter', coalition: 'red' },
  { type: 'AH-64D_BLK_II', name: 'AH-64D Apache', category: 'helicopter', coalition: 'blue' },
  { type: 'Mi-24P', name: 'Mi-24P Hind', category: 'helicopter', coalition: 'red' },
  { type: 'SA342M', name: 'SA342M Gazelle', category: 'helicopter', coalition: 'blue' },
  // ── Véhicules OTAN
  { type: 'M-1 Abrams', name: 'M1A2 Abrams', category: 'vehicle', coalition: 'blue' },
  { type: 'M2 Bradley', name: 'M2A2 Bradley', category: 'vehicle', coalition: 'blue' },
  { type: 'HMMWV', name: 'HMMWV', category: 'vehicle', coalition: 'blue' },
  { type: 'Hawk cwar', name: 'MIM-23 Hawk (radar)', category: 'vehicle', coalition: 'blue' },
  { type: 'Patriot str', name: 'MIM-104 Patriot (SAM)', category: 'vehicle', coalition: 'blue' },
  // ── Véhicules Russie
  { type: 'T-80UD', name: 'T-80UD', category: 'vehicle', coalition: 'red' },
  { type: 'T-72B', name: 'T-72B', category: 'vehicle', coalition: 'red' },
  { type: 'BMP-2', name: 'BMP-2', category: 'vehicle', coalition: 'red' },
  { type: 'SA-6 Kub', name: 'SA-6 Gainful (SAM)', category: 'vehicle', coalition: 'red' },
  { type: 'SA-11 Buk SR', name: 'SA-11 Buk (radar)', category: 'vehicle', coalition: 'red' },
  { type: 'SA-2 TR', name: 'SA-2 Fan Song', category: 'vehicle', coalition: 'red' },
  // ── Navires
  { type: 'CVN_71', name: 'USS Theodore Roosevelt', category: 'ship', coalition: 'blue' },
  { type: 'MOSCOW', name: 'Moskva (cruiser)', category: 'ship', coalition: 'red' },
  { type: 'LHA_Tarawa', name: 'LHA Tarawa', category: 'ship', coalition: 'blue' },
];

export function getUnitsByCategory(category: UnitDef['category']): UnitDef[] {
  return DCS_UNITS.filter(u => u.category === category);
}

export function getUnitByType(type: string): UnitDef | undefined {
  return DCS_UNITS.find(u => u.type === type);
}

export const SKILLS = ['Average', 'Good', 'High', 'Excellent', 'Random', 'Player', 'Client'] as const;
