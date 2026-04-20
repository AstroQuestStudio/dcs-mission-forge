/**
 * Icônes DCS Directional Icon Mod (NATO APP-6)
 * Fichiers PNG copiés depuis le mod officiel dans public/icons/
 * Rotation appliquée selon le cap de l'unité (heading en radians DCS)
 */

// ── Mapping DCS unit type → code icône PNG ─────────────────────────────────
//
// Codes trouvés dans le mod :
//   Avions (arcs directionnels) : P91000024=F, P91000063=B, P91000060=W,
//     P91000061=W(2), P91000062=S(tanker), P91000058=I, P91000059=W(awacs2)
//     P91000057=L(transport), P91000056=A(attack), P91000055=↓(helo)
//     P91000064=K(SEAD), P91000096=R(recco)
//   Sol (rectangles) : P91000073..P91000091 chars/IFV/SAM/arty/inf
//   Navires (cercles) : P91000052=CC, P91000053=DD, P91000054=FF
//   Hélicos : P91000051=helo, P91000055=helo atk
//   Civilian : Aircraft_civilian, P91000211=CIV circle

// Dossier public des icônes (relatif à BASE_URL)
const ICONS_BASE = 'icons/nato/';
const ICONS_RUSSIAN = 'icons/russian/';

// ── Correspondance type DCS → fichier PNG ──────────────────────────────────

interface IconDef {
  file: string;       // nom du fichier PNG (sans dossier)
  rotate: boolean;    // true = l'icône pointe "nord" et doit être rotée selon heading
  size: number;       // taille de base en px
}

const ICON_MAP: Record<string, IconDef> = {
  // ── Chasseurs (arc "F") ──────────────────────────────────
  fighter:       { file: 'P91000024.png', rotate: true,  size: 36 },

  // ── Chasseur lourd (arc "F" aussi, même icône) ───────────
  heavy_fighter: { file: 'P91000024.png', rotate: true,  size: 40 },

  // ── Attaque sol (arc "A") ────────────────────────────────
  attack:        { file: 'P91000056.png', rotate: true,  size: 36 },

  // ── Bombardier (arc "B") ─────────────────────────────────
  bomber:        { file: 'P91000063.png', rotate: true,  size: 40 },

  // ── Transport (arc "L") ──────────────────────────────────
  transport:     { file: 'P91000057.png', rotate: true,  size: 38 },

  // ── AWACS (arc "W") ──────────────────────────────────────
  awacs:         { file: 'P91000060.png', rotate: true,  size: 38 },

  // ── Tanker / Ravitailleur (arc "S"→cercle) ───────────────
  tanker:        { file: 'P91000062.png', rotate: true,  size: 36 },

  // ── SEAD (arc "K") ───────────────────────────────────────
  sead:          { file: 'P91000064.png', rotate: true,  size: 36 },

  // ── Intercepteur (arc "I") ───────────────────────────────
  interceptor:   { file: 'P91000058.png', rotate: true,  size: 36 },

  // ── Recco (arc "R") ──────────────────────────────────────
  recco:         { file: 'P91000096.png', rotate: true,  size: 36 },

  // ── Avion civil (arc "CIV") ──────────────────────────────
  civilian:      { file: 'Aircraft_civilian.png', rotate: true, size: 34 },

  // ── Générique avion (arc "F" par défaut) ─────────────────
  plane_generic: { file: 'P91000024.png', rotate: true,  size: 34 },

  // ── Hélico générique (cercle helo) ───────────────────────
  helo_generic:  { file: 'P91000055.png', rotate: true,  size: 34 },

  // ── Hélico attaque (cercle helo atk) ─────────────────────
  helo_attack:   { file: 'P91000051.png', rotate: true,  size: 34 },

  // ── Navires ──────────────────────────────────────────────
  ship_cv:       { file: 'P91000052.png', rotate: false, size: 36 },   // Porte-avions CC
  ship_dd:       { file: 'P91000053.png', rotate: false, size: 34 },   // Destroyer DD
  ship_ff:       { file: 'P91000054.png', rotate: false, size: 32 },   // Frégate FF
  ship_generic:  { file: 'P91000210.png', rotate: false, size: 34 },   // Navire générique (cercle down)

  // ── Char / blindé lourd (rectangle + croix) ──────────────
  tank:          { file: 'P91000077.png', rotate: true,  size: 32 },

  // ── IFV / APC (rectangle) ────────────────────────────────
  ifv:           { file: 'P91000076.png', rotate: true,  size: 30 },

  // ── SAM longue portée (rectangle antennes) ───────────────
  sam_long:      { file: 'P91000084.png', rotate: false, size: 34 },

  // ── SAM courte portée / SHORAD ────────────────────────────
  sam_short:     { file: 'P91000085.png', rotate: false, size: 32 },

  // ── AAA / Artillerie anti-aérienne ───────────────────────
  aaa:           { file: 'P91000086.png', rotate: false, size: 32 },

  // ── Artillerie sol (field artillery) ─────────────────────
  artillery:     { file: 'Field_Artillery.png', rotate: true, size: 32 },

  // ── Infanterie (rectangle simple) ────────────────────────
  infantry:      { file: 'P91000073.png', rotate: false, size: 30 },

  // ── Véhicule léger ───────────────────────────────────────
  vehicle:       { file: 'LTA_Vehicle.png', rotate: true, size: 28 },

  // ── Structure / bâtiment statique ────────────────────────
  static:        { file: 'P91000201.png', rotate: false, size: 30 },
};

// ── Sélection du bon IconDef selon type DCS + catégorie ───────────────────

function selectIconDef(unitType: string, category: string): IconDef {
  const t = unitType.toUpperCase();

  if (category === 'helicopter') {
    if (/AH-64|AH64|AH-1|KA-50|KA50|MI-24|MI24|MI-28|MI28|OH-58/.test(t))
      return ICON_MAP.helo_attack;
    return ICON_MAP.helo_generic;
  }

  if (category === 'ship') {
    if (/KUZNETSOV|CVN|CVF|CARRIER|NIMITZ/.test(t)) return ICON_MAP.ship_cv;
    if (/SLAVA|MOSKVA|CRUISER|CG|CA/.test(t)) return ICON_MAP.ship_cv;
    if (/DESTROYER|DDG|DD[^A-Z]/.test(t)) return ICON_MAP.ship_dd;
    if (/FRIGATE|FFG|FF[^A-Z]/.test(t)) return ICON_MAP.ship_ff;
    return ICON_MAP.ship_generic;
  }

  if (category === 'static') return ICON_MAP.static;

  if (category === 'vehicle' || category === 'ground' || !category || category === 'plane') {
    if (category !== 'plane') {
      // Véhicules sol
      if (/T-72|T-80|T-90|M1[^0-9]|ABRAMS|LEOPARD|CHALLENGER|LECLERC|MERKAVA|ARJUN/.test(t))
        return ICON_MAP.tank;
      if (/BMP|BTR|M2|M3|BRADLEY|MARDER|CV90|WARRIOR|PUMA|LYNX/.test(t))
        return ICON_MAP.ifv;
      if (/S-300|S-400|S-75|SA-2|SA-10|PATRIOT|HAWK|NASAMS|SAMP/.test(t))
        return ICON_MAP.sam_long;
      if (/BUK|SA-11|SA-17|TOR|SA-15|PANTSIR|SA-22|ROLAND|CROTALE/.test(t))
        return ICON_MAP.sam_short;
      if (/ZSU|SHILKA|TUNGUSKA|GEPARD|M163|VULCAN|ZA-35|CHAPARRAL/.test(t))
        return ICON_MAP.aaa;
      if (/MSTA|2S19|2S3|M109|M198|D-30|ARTILLERY|HOWITZER|CAESAR|AS90/.test(t))
        return ICON_MAP.artillery;
      if (/INFANTRY|SOLDIER|MANPAD|STINGER|IGLA|RPG/.test(t))
        return ICON_MAP.infantry;
      return ICON_MAP.vehicle;
    }
  }

  // Avions
  if (/E-3|E-2|A-50|KJ-|E-8|MAINSTAY|SENTRY/.test(t)) return ICON_MAP.awacs;
  if (/KC-135|KC-10|IL-78|S-3B|IL76|KC-130|TANKER/.test(t)) return ICON_MAP.tanker;
  if (/C-130|C-17|AN-26|AN26|IL-76[^K]|C-5|A400/.test(t)) return ICON_MAP.transport;
  if (/B-52|B-1|B-2|B-17|TU-95|TU-22|TU-160|H-6/.test(t)) return ICON_MAP.bomber;
  if (/A-10|AV-8|AV8|SU-25|SU25|MB-339|L-39|HAWK MK/.test(t)) return ICON_MAP.attack;
  if (/F-15|F-14|SU-27|SU27|SU-33|SU33|MIG-29|MIG29|J-11|F-22|SU-35|SU35/.test(t))
    return ICON_MAP.heavy_fighter;
  if (/F-16|F-18|FA-18|M-2000|MIG-21|MIG21|MIG-23|MIG-19|F-5|F-4|F-86|AJS|MIRAGE/.test(t))
    return ICON_MAP.fighter;
  if (/MIG-25|MIG25|MIG-31|MIG31|F-106|F-104/.test(t)) return ICON_MAP.interceptor;

  return ICON_MAP.plane_generic;
}

// ── Couleur overlay coalition ──────────────────────────────────────────────

const COAL_TINT: Record<string, string> = {
  blue:     'sepia(1) saturate(4) hue-rotate(190deg) brightness(1.1)',
  red:      'sepia(1) saturate(6) hue-rotate(300deg) brightness(1.1)',
  neutrals: 'sepia(0.5) brightness(0.9)',
};

const SELECTED_GLOW: Record<string, string> = {
  blue:     'drop-shadow(0 0 4px #60a5fa) drop-shadow(0 0 8px #3b82f6)',
  red:      'drop-shadow(0 0 4px #f87171) drop-shadow(0 0 8px #ef4444)',
  neutrals: 'drop-shadow(0 0 4px #cbd5e1) drop-shadow(0 0 8px #94a3b8)',
};

// ── Cap DCS → degrés CSS ──────────────────────────────────────────────────
// DCS heading : 0 = Nord, en radians, sens horaire
// Les icônes du mod pointent "vers le haut" (nord) → rotation directe

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
  baseUrl?: string,
): { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] } {
  const def = selectIconDef(unitType, category);
  const base = baseUrl ?? '/';
  const folder = (coalition === 'red') ? ICONS_RUSSIAN : ICONS_BASE;
  const src = `${base}${folder}${def.file}`;

  const sizeMult = selected ? (isLeader ? 1.4 : 1.15) : (isLeader ? 1.0 : 0.82);
  const size = Math.round(def.size * sizeMult);
  const deg = def.rotate ? headingToDeg(headingRad) : 0;

  const tint = COAL_TINT[coalition] ?? COAL_TINT.neutrals;
  const glow = selected ? (SELECTED_GLOW[coalition] ?? '') : 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))';
  const selRing = selected
    ? `<div style="position:absolute;inset:-3px;border-radius:50%;border:2px solid ${
        coalition === 'blue' ? '#60a5fa' : coalition === 'red' ? '#f87171' : '#cbd5e1'
      };opacity:0.85;animation:pulse-ring 1.5s ease-in-out infinite;pointer-events:none"></div>`
    : '';

  const html = `<div style="position:relative;width:${size}px;height:${size}px;cursor:pointer">
    ${selRing}
    <img
      src="${src}"
      width="${size}"
      height="${size}"
      style="
        transform: rotate(${deg}deg);
        transform-origin: center center;
        filter: ${tint} ${glow};
        display: block;
        image-rendering: crisp-edges;
        ${selected ? 'animation: none;' : ''}
      "
      draggable="false"
    />
  </div>`;

  return {
    html,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  };
}

export function makeAirportDivIcon(baseUrl?: string): { html: string; className: string; iconSize: [number, number]; iconAnchor: [number, number] } {
  const base = baseUrl ?? '/';
  const src = `${base}${ICONS_BASE}airdrome_class_1.png`;
  const size = 28;
  return {
    html: `<div style="cursor:pointer;filter:sepia(0.2) brightness(0.9) drop-shadow(0 1px 3px rgba(0,0,0,0.7))">
      <img src="${src}" width="${size}" height="${size}" style="display:block;image-rendering:crisp-edges" draggable="false"/>
    </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [14, 14],
  };
}

// Gardé pour compatibilité (non utilisé par mapEngine mais exporté)
export function generateUnitSVG(
  unitType: string, category: string, coalition: string, selected: boolean, isLeader: boolean,
): string {
  const { html } = makeUnitDivIcon(unitType, category, coalition, selected, isLeader);
  return html;
}
