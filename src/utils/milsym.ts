/**
 * Générateur d'icônes MILSYM NATO en SVG inline.
 * Aucune image externe — zéro requête réseau.
 *
 * Standard NATO APP-6A simplifié :
 *  blue     → cadre ovale/arrondi
 *  red      → cadre losange
 *  neutrals → cadre carré
 */

const SELECTED_COLOR = '#fbbf24';

const COLORS: Record<string, { frame: string; fill: string; text: string }> = {
  blue:     { frame: '#3b82f6', fill: '#1e3a5f', text: '#93c5fd' },
  red:      { frame: '#ef4444', fill: '#4c0519', text: '#fca5a5' },
  neutrals: { frame: '#94a3b8', fill: '#1e293b', text: '#cbd5e1' },
};

/** Symbole intérieur par catégorie (Unicode OTAN-ish) */
const CAT_GLYPH: Record<string, string> = {
  plane:      '✈',
  helicopter: 'H',
  vehicle:    '▮',
  ship:       '⚓',
  static:     '■',
};

/** Correspondance type d'unité → symbole spécifique */
const UNIT_GLYPH: Record<string, string> = {
  // SAM
  'SA-2': '2', 'SA-3': '3', 'SA-6': '6', 'SA-8': '8',
  'SA-10': 'S', 'SA-11': 'B', 'SA-15': 'T', 'SA-18': 'I',
  'SA-19': 'G',
  // AAA
  'ZSU-23-4': 'Z', 'ZSU-57': 'Z', 'ZU-23': 'Z',
  // Spéciaux
  'JTAC': 'J', 'FARP': 'F',
};

function getUnitGlyph(unitType: string, category: string): string {
  const upper = unitType.toUpperCase();
  // SAM pattern
  const sam = unitType.match(/SA-?(\d+)/i);
  if (sam) return sam[1].length > 1 ? sam[1].slice(0, 2) : sam[1];
  // Lookup direct
  for (const [k, v] of Object.entries(UNIT_GLYPH)) {
    if (upper.includes(k.toUpperCase())) return v;
  }
  return CAT_GLYPH[category] ?? '?';
}

/** Génère un SVG MILSYM inline en string */
export function generateMilsymSVG(
  coalition: string,
  category: string,
  unitType: string,
  selected: boolean,
  isLeader: boolean,
): string {
  const size = selected ? (isLeader ? 44 : 36) : (isLeader ? 34 : 26);
  const half = size / 2;
  const colors = COLORS[coalition as keyof typeof COLORS] ?? COLORS.neutrals;
  const frameColor = selected ? SELECTED_COLOR : colors.frame;
  const borderW = selected ? 2.5 : isLeader ? 2 : 1.5;
  const glyph = getUnitGlyph(unitType, category);
  const fontSize = Math.round(size * 0.38);
  const shadow = selected
    ? `drop-shadow(0 0 6px ${SELECTED_COLOR}aa)`
    : isLeader ? 'drop-shadow(0 2px 4px #0008)' : 'drop-shadow(0 1px 2px #0006)';

  let frame: string;
  switch (coalition) {
    case 'blue':
      // Ovale / rounded rect
      frame = `<rect x="${borderW}" y="${borderW}" width="${size - borderW * 2}" height="${size - borderW * 2}"
        rx="${half - borderW}" ry="${half - borderW}"
        fill="${colors.fill}" stroke="${frameColor}" stroke-width="${borderW}"/>`;
      break;
    case 'red': {
      // Losange
      const m = half;
      const pad = borderW + 1;
      frame = `<polygon points="${m},${pad} ${size - pad},${m} ${m},${size - pad} ${pad},${m}"
        fill="${colors.fill}" stroke="${frameColor}" stroke-width="${borderW}"/>`;
      break;
    }
    default:
      // Carré
      frame = `<rect x="${borderW}" y="${borderW}" width="${size - borderW * 2}" height="${size - borderW * 2}"
        rx="3" ry="3"
        fill="${colors.fill}" stroke="${frameColor}" stroke-width="${borderW}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="filter:${shadow}">
    ${frame}
    <text x="${half}" y="${half + fontSize * 0.38}" text-anchor="middle" dominant-baseline="middle"
      font-family="system-ui,sans-serif" font-size="${fontSize}" fill="${colors.text}"
      font-weight="${isLeader ? '700' : '500'}">${glyph}</text>
  </svg>`;
}

/** Génère un L.DivIcon Leaflet avec MILSYM SVG inline */
export function makeMilsymIcon(
  coalition: string,
  category: string,
  unitType: string,
  selected: boolean,
  isLeader: boolean,
): { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] } {
  const size = selected ? (isLeader ? 44 : 36) : (isLeader ? 34 : 26);
  const svg = generateMilsymSVG(coalition, category, unitType, selected, isLeader);
  const tooltip = selected && isLeader
    ? `<div style="position:absolute;bottom:${size + 2}px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:9px;color:#fbbf24;pointer-events:none">✦ sélectionné</div>`
    : '';
  return {
    html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:pointer">${svg}${tooltip}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  };
}

/** Icône aérodrome SVG inline */
export function makeAirportSVG(): string {
  const size = 26;
  const half = size / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect x="1.5" y="1.5" width="23" height="23" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <text x="${half}" y="${half + 5}" text-anchor="middle" dominant-baseline="middle"
      font-family="system-ui,sans-serif" font-size="14" fill="#94a3b8">✈</text>
  </svg>`;
}
