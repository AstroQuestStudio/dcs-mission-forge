/**
 * Silhouettes SVG top-view des unités DCS.
 * Toutes générées en code — zéro image externe, zéro requête réseau.
 * Colorées dynamiquement par coalition.
 */

// ── Formes SVG top-view (viewBox 0 0 40 40) ────────────────────────────────

const SHAPES: Record<string, string> = {
  // Avion générique (delta wing)
  plane_generic: `<polygon points="20,2 24,16 38,20 24,24 22,38 20,32 18,38 16,24 2,20 16,16" />`,

  // Fighter (F-16, F/A-18 style — aile delta fine)
  fighter: `<polygon points="20,3 23,14 36,19 30,21 23,30 22,37 20,33 18,37 17,30 10,21 4,19 17,14"/>
    <rect x="18" y="3" width="4" height="10" rx="2"/>`,

  // Heavy fighter / F-15 style (twin tail)
  heavy_fighter: `<polygon points="20,2 24,13 36,18 29,21 25,31 22,37 20,34 18,37 15,31 11,21 4,18 16,13"/>
    <rect x="17" y="2" width="6" height="9" rx="3"/>
    <rect x="13" y="27" width="4" height="8" rx="1"/>
    <rect x="23" y="27" width="4" height="8" rx="1"/>`,

  // Attaque sol / A-10 style (aile droite)
  attack: `<rect x="4" y="18" width="32" height="4" rx="2"/>
    <rect x="18" y="3" width="4" height="34" rx="2"/>
    <rect x="12" y="28" width="4" height="8" rx="1"/>
    <rect x="24" y="28" width="4" height="8" rx="1"/>`,

  // Bombardier / B-52 style
  bomber: `<rect x="2" y="17" width="36" height="6" rx="3"/>
    <rect x="18" y="4" width="4" height="32" rx="2"/>
    <rect x="7" y="20" width="4" height="10" rx="1"/>
    <rect x="29" y="20" width="4" height="10" rx="1"/>`,

  // Transport / C-130 style
  transport: `<rect x="5" y="16" width="30" height="8" rx="4"/>
    <rect x="17" y="5" width="6" height="30" rx="3"/>
    <ellipse cx="20" cy="6" rx="3" ry="4"/>`,

  // AWACS / E-3 (avec radome)
  awacs: `<rect x="5" y="16" width="30" height="8" rx="4"/>
    <rect x="17" y="5" width="6" height="30" rx="3"/>
    <ellipse cx="20" cy="14" rx="10" ry="3"/>`,

  // Hélicoptère générique
  helo_generic: `<ellipse cx="20" cy="20" rx="7" ry="9"/>
    <rect x="2" y="19" width="36" height="2" rx="1"/>
    <rect x="18" y="3" width="4" height="8" rx="2"/>
    <rect x="27" y="28" width="10" height="2" rx="1"/>`,

  // Hélicoptère d'attaque (AH-64, Ka-50)
  helo_attack: `<ellipse cx="20" cy="21" rx="6" ry="8"/>
    <rect x="2" y="20" width="36" height="2" rx="1"/>
    <rect x="18" y="4" width="4" height="7" rx="2"/>
    <polygon points="14,24 10,30 12,31 16,25"/>
    <polygon points="26,24 30,30 28,31 24,25"/>
    <rect x="28" y="28" width="9" height="2" rx="1"/>`,

  // Navire (vue top)
  ship: `<ellipse cx="20" cy="20" rx="8" ry="16"/>
    <rect x="17" y="8" width="6" height="4" rx="1"/>
    <rect x="16" y="16" width="8" height="6" rx="1"/>`,

  // Véhicule blindé (char)
  tank: `<rect x="10" y="13" width="20" height="14" rx="2"/>
    <ellipse cx="20" cy="20" rx="6" ry="5"/>
    <rect x="19" y="8" width="2" height="12" rx="1"/>`,

  // Véhicule léger
  vehicle: `<rect x="11" y="14" width="18" height="12" rx="3"/>
    <rect x="19" y="11" width="2" height="4" rx="1"/>`,

  // SAM launcher
  sam: `<rect x="10" y="16" width="20" height="8" rx="2"/>
    <rect x="17" y="8" width="3" height="12" rx="1"/>
    <rect x="20" y="8" width="3" height="12" rx="1"/>`,

  // Statique / bâtiment
  static: `<rect x="12" y="12" width="16" height="16" rx="2"/>
    <rect x="16" y="8" width="8" height="6" rx="1"/>`,
};

// ── Correspondance type DCS → forme ────────────────────────────────────────

function getShape(unitType: string, category: string): string {
  const t = unitType.toUpperCase();

  if (category === 'helicopter') {
    if (/AH-64|AH-1|KA-50|KA50|MI-24|MI-28|OH-58/.test(t)) return SHAPES.helo_attack;
    return SHAPES.helo_generic;
  }

  if (category === 'ship') return SHAPES.ship;
  if (category === 'static') return SHAPES.static;

  if (category === 'vehicle') {
    if (/T-72|T-80|T-90|M1|ABRAMS|LEOPARD|CHALLENGER|BMP|BTR|ZSU|TUNGUSKA|TOR|BUK|S-300|SA-/.test(t)) return SHAPES.sam;
    return SHAPES.tank;
  }

  // Avions
  if (/B-52|B-1|B-17|IL-76|IL-78|C-17|C-130|AN-26|H-6|KC/.test(t)) {
    if (/E-3|E-2|A-50|KJ/.test(t)) return SHAPES.awacs;
    if (/C-130|C-17|AN|IL-76|IL-78/.test(t)) return SHAPES.transport;
    return SHAPES.bomber;
  }
  if (/A-10|AV-8|AV8|SU-25|SU25|MB-339|L-39|HAWK/.test(t)) return SHAPES.attack;
  if (/F-15|F-14|SU-27|SU27|SU-33|SU33|MIG-29|MIG29|J-11|F-22/.test(t)) return SHAPES.heavy_fighter;
  if (/F-16|F-18|FA-18|M-2000|MIG-21|MIG21|MIG-23|MIG-19|F-5|F-4|F-86|AJS/.test(t)) return SHAPES.fighter;

  return SHAPES.plane_generic;
}

// ── Génération SVG ──────────────────────────────────────────────────────────

const COAL_COLORS = {
  blue:     { fill: '#3b82f6', stroke: '#1d4ed8', glow: 'rgba(59,130,246,0.5)' },
  red:      { fill: '#ef4444', stroke: '#b91c1c', glow: 'rgba(239,68,68,0.5)' },
  neutrals: { fill: '#94a3b8', stroke: '#475569', glow: 'rgba(148,163,184,0.4)' },
};

const SELECTED_RING = '#fbbf24';

export function generateUnitSVG(
  unitType: string,
  category: string,
  coalition: string,
  selected: boolean,
  isLeader: boolean,
): string {
  const size = selected ? (isLeader ? 46 : 38) : (isLeader ? 36 : 28);
  const colors = COAL_COLORS[coalition as keyof typeof COAL_COLORS] ?? COAL_COLORS.neutrals;
  const shape = getShape(unitType, category);

  // Scale le SVG shape (viewBox 40x40) vers la taille finale
  const scale = size / 40;

  const glowFilter = selected
    ? `<filter id="glow"><feGaussianBlur stdDeviation="2.5" result="blur"/>
       <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    : isLeader
    ? `<filter id="glow"><feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.7"/></filter>`
    : '';

  const ring = selected
    ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="none" stroke="${SELECTED_RING}" stroke-width="2" opacity="0.9"/>`
    : isLeader
    ? `<circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="none" stroke="${colors.stroke}" stroke-width="1.5" opacity="0.6"/>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs>${glowFilter}</defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${colors.fill}" opacity="${selected ? 0.25 : 0.15}"/>
    ${ring}
    <g transform="translate(${size/2 - 20*scale} ${size/2 - 20*scale}) scale(${scale})"
       fill="${selected ? '#fff' : colors.fill}" stroke="${selected ? SELECTED_RING : colors.stroke}"
       stroke-width="${selected ? 1.2/scale : 0.8/scale}" filter="url(#glow)">
      ${shape}
    </g>
  </svg>`;
}

export function makeUnitDivIcon(
  unitType: string,
  category: string,
  coalition: string,
  selected: boolean,
  isLeader: boolean,
): { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] } {
  const size = selected ? (isLeader ? 46 : 38) : (isLeader ? 36 : 28);
  const svg = generateUnitSVG(unitType, category, coalition, selected, isLeader);
  return {
    html: `<div style="cursor:pointer;filter:drop-shadow(0 2px 4px #0008)">${svg}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  };
}

export function makeAirportDivIcon(): { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] } {
  const size = 28;
  return {
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
      <text x="14" y="19" text-anchor="middle" font-family="system-ui" font-size="14" fill="#94a3b8">✈</text>
    </svg>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [14, 14],
  };
}
