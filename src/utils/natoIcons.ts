export const NATO_ICON_MAP: Record<string, string> = {
  // ── SAM systems ──
  'SA-2 TR': 'SA-2.png',
  'S_75M_Volhov': 'SA-2.png',
  'SNR_75V': 'SA-2.png',
  'SA-3 Neva SR': 'SA-3.png',
  'snr s-125 tr': 'SA-3.png',
  'S-125 Nevokhod': 'SA-3.png',
  'SA-5 Gammon': 'SA-5.png',
  'RLS_19Zh6': 'SA-5.png',
  'SA-6 Kub': 'SA-6.png',
  '1S91 str': 'SA-6.png',
  'Kub 1S91 str': 'SA-6.png',
  'SA-8 Osa 9A33 ln': 'SA-8.png',
  'SA-9 Gaskin': 'SA-9.png',
  'Strela-1 9P31': 'SA-9.png',
  'SA-10 Grumble': 'SA-10.png',
  '54K6': 'SA-10.png',
  '55G6': 'SA-10.png',
  'S-300PS 40B6M tr': 'SA-10.png',
  'S-300PS 40B6MD sr': 'SA-10.png',
  'S-300PS 64H6E sr': 'SA-10.png',
  'S-300PS 5P85C ln': 'SA-10.png',
  'S-300PS 5P85D ln': 'SA-10.png',
  'SA-11 Buk SR': 'SA-11.png',
  'SA-11 Buk LN 9A310M1': 'SA-11.png',
  'Buk-M1-2 str': 'SA-11.png',
  'SA-13 Strela': 'SA-13.png',
  'Strela-10M3': 'SA-13.png',
  'SA-15 Tor 9A331': 'SA-15.png',
  'SA-18 Igla manpad': 'SA-18.png',
  'SA-18 Igla-S manpad': 'SA-18.png',
  'Igla manpad': 'SA-18.png',
  'Igla-S manpad': 'SA-18.png',
  'SA-19 Tunguska': 'SA-19.png',
  '2S6 Tunguska': 'SA-19.png',
  'SA-24 Igla-S manpad': 'SA-24.png',
  // ── AAA ──
  'ZSU-23-4 Shilka': 'ZSU-23-4.png',
  'ZSU-57-2': 'ZSU-57-2.png',
  'ZU-23 Emplacement': 'ZU-23.png',
  'ZU-23 Closed Emplacement': 'ZU-23.png',
  'ZU-23 Emplacement Closed': 'ZU-23.png',
  // ── Ships ──
  'LHA_Tarawa': 'LHA.png',
  'MOSCOW': 'AMPHIB.png',
  'KUZNECOW': 'AMPHIB.png',
  'Forrestal': 'RANGER.png',
  'CVN_71': 'RANGER.png',
  'CVN_72': 'RANGER.png',
  'CVN_73': 'RANGER.png',
  'CVN_74': 'RANGER.png',
  'CVN_75': 'RANGER.png',
  'Stennis': 'RANGER.png',
  // ── Ground vehicles ──
  'JTAC': 'JTAC.png',
  'FARP': 'airdrome_supplier.png',
  'FARP Tent': 'airdrome_supplier.png',
  'FARP Ammo Dump Coating': 'airdrome_supplier.png',
};

export const NATO_CATEGORY_FALLBACK: Record<string, Record<string, string>> = {
  plane:      { blue: 'RTS_FRM_000_B.png', red: 'RTS_FRM_000_R.png', neutrals: 'RTS_FRM_000_B.png' },
  helicopter: { blue: 'RTS_FRM_001_B.png', red: 'RTS_FRM_001_R.png', neutrals: 'RTS_FRM_001_B.png' },
  vehicle:    { blue: 'RTS_FRM_002_B.png', red: 'RTS_FRM_002_R.png', neutrals: 'RTS_FRM_002_B.png' },
  ship:       { blue: 'RTS_FRM_003_B.png', red: 'RTS_FRM_003_R.png', neutrals: 'RTS_FRM_003_B.png' },
  static:     { blue: 'RTS_HQ_000_B.png',  red: 'RTS_HQ_000_R.png',  neutrals: 'RTS_HQ_000_B.png'  },
};

export function getIconForUnit(unitType: string, category: string, coalition: string): string {
  if (NATO_ICON_MAP[unitType]) return NATO_ICON_MAP[unitType];

  const t = unitType.toUpperCase();

  // SAM pattern matching (pour les MODs et variantes)
  const samMatch = unitType.match(/SA-?(\d+)/i);
  if (samMatch) return `SA-${samMatch[1]}.png`;

  if (/ZSU/i.test(t)) return 'ZSU-23-4.png';
  if (/ZU-23/i.test(t)) return 'ZU-23.png';
  if (/TUNGUSKA/i.test(t)) return 'SA-19.png';
  if (/IGLA|STRELA-1|MANPAD/i.test(t)) return 'SA-18.png';
  if (/TOR/i.test(t)) return 'SA-15.png';
  if (/BUK/i.test(t)) return 'SA-11.png';
  if (/S-300|S_300/i.test(t)) return 'SA-10.png';
  if (/JTAC|FAC/i.test(t)) return 'JTAC.png';
  if (/FARP/i.test(t)) return 'airdrome_supplier.png';

  return NATO_CATEGORY_FALLBACK[category]?.[coalition] ?? 'navigation_point.png';
}
