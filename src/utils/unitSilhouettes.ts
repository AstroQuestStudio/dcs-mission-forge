import { getDCSShape } from './dcsShapes';

// ── Couleurs coalition ─────────────────────────────────────────────────────

const COAL_FILL: Record<string, string> = {
  blue:     '#3b82f6',
  red:      '#ef4444',
  neutrals: '#94a3b8',
};

const COAL_STROKE: Record<string, string> = {
  blue:     '#1d4ed8',
  red:      '#b91c1c',
  neutrals: '#64748b',
};

const SELECTED_GLOW: Record<string, string> = {
  blue:     'drop-shadow(0 0 4px #60a5fa) drop-shadow(0 0 8px #3b82f6)',
  red:      'drop-shadow(0 0 4px #f87171) drop-shadow(0 0 8px #ef4444)',
  neutrals: 'drop-shadow(0 0 4px #cbd5e1) drop-shadow(0 0 8px #94a3b8)',
};

// ── Cap DCS → degrés CSS ───────────────────────────────────────────────────
// DCS heading : 0 = Nord, en radians, sens horaire

function headingToDeg(headingRad: number | undefined): number {
  if (headingRad == null) return 0;
  return (headingRad * 180 / Math.PI + 360) % 360;
}

// ── Export principal ───────────────────────────────────────────────────────

export function makeUnitDivIcon(
  unitType: string,
  category: string,
  coalition: string,
  selected: boolean,
  isLeader: boolean,
  headingRad?: number,
  _baseUrl?: string,
): { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] } {
  const fill   = COAL_FILL[coalition]   ?? COAL_FILL.neutrals;
  const stroke = COAL_STROKE[coalition] ?? COAL_STROKE.neutrals;
  const glow   = selected
    ? (SELECTED_GLOW[coalition] ?? SELECTED_GLOW.neutrals)
    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))';

  const baseSize = isLeader ? 42 : 34;
  const size     = selected ? Math.round(baseSize * (isLeader ? 1.3 : 1.18)) : baseSize;
  const deg      = headingToDeg(headingRad);

  const shape = getDCSShape(unitType, category);

  const selRing = selected
    ? `<circle cx="24" cy="24" r="22" fill="none" stroke="${fill}" stroke-width="2" opacity="0.85" style="animation:pulse-ring 1.5s ease-in-out infinite"/>`
    : '';

  // Leader badge (étoile en bas-droite du SVG)
  const leaderBadge = isLeader
    ? `<text x="40" y="42" font-size="9" text-anchor="middle" fill="#facc15" font-weight="bold">★</text>`
    : '';

  const svgInner = `
    <g transform="rotate(${deg},24,24)" fill="${fill}" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round">
      ${shape}
    </g>
    ${selRing}
    ${leaderBadge}
  `;

  const svgEl = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}" style="filter:${glow};display:block;overflow:visible" draggable="false">${svgInner}</svg>`;

  const html = `<div style="position:relative;width:${size}px;height:${size}px;cursor:pointer">${svgEl}</div>`;

  return {
    html,
    className: '',
    iconSize:  [size, size],
    iconAnchor:[size / 2, size / 2],
  };
}

// ── Icône aérodrome ───────────────────────────────────────────────────────

export function makeAirportDivIcon(_baseUrl?: string): { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] } {
  const size = 28;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="${size}" height="${size}" style="filter:drop-shadow(0 1px 3px rgba(0,0,0,0.7));display:block" draggable="false">
    <!-- Piste principale -->
    <rect x="20" y="4" width="8" height="40" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1"/>
    <!-- Piste transversale -->
    <rect x="4" y="20" width="40" height="8" rx="2" fill="#475569" stroke="#1e293b" stroke-width="1"/>
    <!-- Centre -->
    <circle cx="24" cy="24" r="5" fill="#94a3b8" stroke="#475569" stroke-width="1"/>
  </svg>`;

  return {
    html: `<div style="cursor:pointer">${svg}</div>`,
    className: '',
    iconSize:  [size, size],
    iconAnchor:[14, 14],
  };
}

// Compatibilité (non utilisé par mapEngine mais exporté)
export function generateUnitSVG(
  unitType: string, category: string, coalition: string, selected: boolean, isLeader: boolean,
): string {
  const { html } = makeUnitDivIcon(unitType, category, coalition, selected, isLeader);
  return html;
}
