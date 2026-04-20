/** Portées de menace des principaux systèmes DCS (en mètres) */
export interface ThreatRange {
  engagement: number;
  detection: number;
  name: string;
}

export const THREAT_RANGES: Record<string, ThreatRange> = {
  'S-300 PS SA-10B LN 5P85C': { engagement: 120000, detection: 300000, name: 'S-300 (SA-10)' },
  'S-300 PS SA-10B LN 5P85D': { engagement: 120000, detection: 300000, name: 'S-300 (SA-10)' },
  'S-300 SR 64H6E': { engagement: 0, detection: 300000, name: 'S-300 Radar SR' },
  'Patriot AIO': { engagement: 100000, detection: 180000, name: 'Patriot' },
  'SA-11 Buk LN 9A310M1': { engagement: 45000, detection: 85000, name: 'SA-11 Buk' },
  'SA-11 Buk SR 9S18M1': { engagement: 0, detection: 85000, name: 'SA-11 Buk SR' },
  'SA-11 Buk CC 9S470M1': { engagement: 45000, detection: 85000, name: 'SA-11 Buk CC' },
  'SA-6 Kub LN 2P25': { engagement: 25000, detection: 75000, name: 'SA-6 Kub' },
  'SA-6 Kub STR 9S91': { engagement: 0, detection: 75000, name: 'SA-6 Kub STR' },
  'Hawk AIO': { engagement: 40000, detection: 90000, name: 'Hawk' },
  'SA-15 Tor': { engagement: 12000, detection: 25000, name: 'SA-15 Tor' },
  'Osa 9A33 ln': { engagement: 10000, detection: 25000, name: 'SA-8 Gecko' },
  'Strela-10M3': { engagement: 5000, detection: 15000, name: 'SA-13 Gopher' },
  '5p73 s-125 ln': { engagement: 18000, detection: 60000, name: 'SA-3 Goa' },
  'M48 Chaparral': { engagement: 9000, detection: 15000, name: 'Chaparral' },
  'ZSU-23-4 Shilka': { engagement: 2500, detection: 4000, name: 'Shilka ZSU-23-4' },
  '2S6 Tunguska': { engagement: 8000, detection: 18000, name: 'Tunguska 2S6' },
  'Gepard': { engagement: 4000, detection: 8000, name: 'Gepard AA' },
  'Vulcan': { engagement: 2000, detection: 4000, name: 'M163 Vulcan' },
  'M6 Linebacker': { engagement: 6000, detection: 12000, name: 'Linebacker' },
};

export function getThreatRange(unitType: string): ThreatRange | undefined {
  return THREAT_RANGES[unitType];
}

export function groupHasThreats(units: { type: string }[]): boolean {
  return units.some(u => THREAT_RANGES[u.type] !== undefined);
}
