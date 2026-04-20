/**
 * Base de données des unités DCS avec images Wikipedia (domaine public/CC)
 * et loadouts manuels pour les modules principaux.
 */

export interface UnitLoadout {
  name: string;
  role: string;
  pylons: { station: number; weapon: string; count: number }[];
}

export interface UnitInfo {
  type: string;
  displayName: string;
  imageUrl?: string;
  role: string;
  origin: string;
  maxSpeed?: string;
  maxAlt?: string;
  crew?: number;
  loadouts?: UnitLoadout[];
  description?: string;
}

const WP = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';

export const UNIT_DATABASE: Record<string, UnitInfo> = {
  // ── Avions bleus (OTAN) ────────────────────────────────────────────────

  'F-16C_50': {
    type: 'F-16C_50', displayName: 'F-16C Block 50', origin: 'USA',
    imageUrl: WP + 'c/c9/F-16_June_2008.jpg/400px-F-16_June_2008.jpg',
    role: 'Chasseur multirôle', maxSpeed: 'Mach 2.0', maxAlt: '15 000 m', crew: 1,
    description: 'Chasseur léger monoréacteur, excellence en dogfight et attaque sol.',
    loadouts: [
      { name: 'CAP — Supériorité aérienne', role: 'Air-Air',
        pylons: [{station:1,weapon:'AIM-9X',count:1},{station:2,weapon:'AIM-120C',count:1},{station:5,weapon:'AIM-120C',count:1},{station:9,weapon:'AIM-9X',count:1}] },
      { name: 'SEAD — Suppression défenses', role: 'Air-Sol',
        pylons: [{station:3,weapon:'AGM-88C HARM',count:1},{station:7,weapon:'AGM-88C HARM',count:1},{station:5,weapon:'AIM-120C',count:1}] },
      { name: 'CAS — Appui sol', role: 'Air-Sol',
        pylons: [{station:3,weapon:'GBU-12',count:1},{station:7,weapon:'GBU-12',count:1},{station:5,weapon:'AIM-9X',count:1}] },
      { name: 'Strike — Precision', role: 'Air-Sol',
        pylons: [{station:5,weapon:'JDAM GBU-38',count:1},{station:3,weapon:'JDAM GBU-38',count:1},{station:7,weapon:'JDAM GBU-38',count:1}] },
    ],
  },

  'F-16C bl.50': {
    type: 'F-16C bl.50', displayName: 'F-16C Block 50', origin: 'USA',
    imageUrl: WP + 'c/c9/F-16_June_2008.jpg/400px-F-16_June_2008.jpg',
    role: 'Chasseur multirôle', maxSpeed: 'Mach 2.0', maxAlt: '15 000 m', crew: 1,
  },

  'FA-18C_hornet': {
    type: 'FA-18C_hornet', displayName: 'F/A-18C Hornet', origin: 'USA',
    imageUrl: WP + '4/44/FA-18C_desert_refueling.jpg/400px-FA-18C_desert_refueling.jpg',
    role: 'Chasseur embarqué multirôle', maxSpeed: 'Mach 1.8', maxAlt: '15 240 m', crew: 1,
    description: 'Chasseur embarqué de la US Navy, excellent multirôle.',
    loadouts: [
      { name: 'CAP — Fleet Defense', role: 'Air-Air',
        pylons: [{station:1,weapon:'AIM-9X',count:1},{station:2,weapon:'AIM-7M',count:1},{station:5,weapon:'AIM-120C',count:2},{station:8,weapon:'AIM-7M',count:1},{station:9,weapon:'AIM-9X',count:1}] },
      { name: 'Strike — Missiles anti-navire', role: 'Anti-Ship',
        pylons: [{station:4,weapon:'AGM-84D Harpoon',count:1},{station:6,weapon:'AGM-84D Harpoon',count:1}] },
      { name: 'CAS — Guidage laser', role: 'Air-Sol',
        pylons: [{station:4,weapon:'GBU-12',count:2},{station:6,weapon:'GBU-12',count:2},{station:2,weapon:'AIM-9X',count:1},{station:8,weapon:'AIM-9X',count:1}] },
    ],
  },

  'F/A-18C': {
    type: 'F/A-18C', displayName: 'F/A-18C Hornet', origin: 'USA',
    imageUrl: WP + '4/44/FA-18C_desert_refueling.jpg/400px-FA-18C_desert_refueling.jpg',
    role: 'Chasseur embarqué multirôle', maxSpeed: 'Mach 1.8', maxAlt: '15 240 m', crew: 1,
  },

  'F-15C': {
    type: 'F-15C', displayName: 'F-15C Eagle', origin: 'USA',
    imageUrl: WP + 'a/a6/F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15%2C_2019.jpg/400px-F-15C_Eagle_from_the_44th_Fighter_Squadron_flies_during_a_routine_training_exercise_April_15%2C_2019.jpg',
    role: 'Chasseur de supériorité aérienne', maxSpeed: 'Mach 2.5', maxAlt: '18 000 m', crew: 1,
    description: 'Meilleur chasseur air-air de son époque, pas une livre pour le sol.',
    loadouts: [
      { name: 'Eagle CAP', role: 'Air-Air',
        pylons: [{station:1,weapon:'AIM-9X',count:1},{station:2,weapon:'AIM-120C',count:2},{station:3,weapon:'AIM-120C',count:2},{station:5,weapon:'AIM-7M',count:2},{station:6,weapon:'AIM-7M',count:2},{station:8,weapon:'AIM-9X',count:1}] },
    ],
  },

  'F-14A': {
    type: 'F-14A', displayName: 'F-14A Tomcat', origin: 'USA',
    imageUrl: WP + 'f/f7/US_Navy_051105-F-5480T-005_An_F-14D_Tomcat_conducts_a_mission_over_the_Persian_Gulf-region.jpg/400px-US_Navy_051105-F-5480T-005_An_F-14D_Tomcat_conducts_a_mission_over_the_Persian_Gulf-region.jpg',
    role: 'Intercepteur embarqué', maxSpeed: 'Mach 2.34', maxAlt: '15 500 m', crew: 2,
    description: 'Iconique chasseur à géométrie variable, arme le missile AIM-54 Phoenix.',
  },

  'F-14B': {
    type: 'F-14B', displayName: 'F-14B Tomcat', origin: 'USA',
    imageUrl: WP + 'f/f7/US_Navy_051105-F-5480T-005_An_F-14D_Tomcat_conducts_a_mission_over_the_Persian_Gulf-region.jpg/400px-US_Navy_051105-F-5480T-005_An_F-14D_Tomcat_conducts_a_mission_over_the_Persian_Gulf-region.jpg',
    role: 'Intercepteur embarqué', maxSpeed: 'Mach 2.34', maxAlt: '15 500 m', crew: 2,
  },

  'A-10C': {
    type: 'A-10C', displayName: 'A-10C Thunderbolt II', origin: 'USA',
    imageUrl: WP + '8/80/Fairchild_Republic_A-10_Thunderbolt_II_-_32156159151.jpg/400px-Fairchild_Republic_A-10_Thunderbolt_II_-_32156159151.jpg',
    role: 'Appui sol rapproché', maxSpeed: '706 km/h', maxAlt: '13 700 m', crew: 1,
    description: 'La Warthog — conçue pour survivre et détruire les blindés.',
    loadouts: [
      { name: 'Tank Buster', role: 'Anti-Armor',
        pylons: [{station:2,weapon:'AGM-65D Maverick',count:3},{station:8,weapon:'AGM-65D Maverick',count:3},{station:5,weapon:'CBU-97',count:2}] },
      { name: 'JTAC — Guidage laser', role: 'CAS',
        pylons: [{station:3,weapon:'GBU-12',count:2},{station:7,weapon:'GBU-12',count:2},{station:2,weapon:'AIM-9L',count:1},{station:8,weapon:'AIM-9L',count:1}] },
    ],
  },

  'A-10C_2': {
    type: 'A-10C_2', displayName: 'A-10C II Thunderbolt', origin: 'USA',
    imageUrl: WP + '8/80/Fairchild_Republic_A-10_Thunderbolt_II_-_32156159151.jpg/400px-Fairchild_Republic_A-10_Thunderbolt_II_-_32156159151.jpg',
    role: 'Appui sol rapproché', maxSpeed: '706 km/h', maxAlt: '13 700 m', crew: 1,
  },

  'M-2000C': {
    type: 'M-2000C', displayName: 'Mirage 2000C', origin: 'France',
    imageUrl: WP + 'c/c5/Mirage_2000C_in-flight_2_%28cropped%29.jpg/400px-Mirage_2000C_in-flight_2_%28cropped%29.jpg',
    role: 'Chasseur léger', maxSpeed: 'Mach 2.2', maxAlt: '16 460 m', crew: 1,
    description: 'Chasseur delta français, agile et polyvalent.',
  },

  'AJS37': {
    type: 'AJS37', displayName: 'AJS-37 Viggen', origin: 'Suède',
    imageUrl: WP + 'f/f8/Swedish_Air_Force_Viggen_37_08.jpg/400px-Swedish_Air_Force_Viggen_37_08.jpg' ,
    role: 'Attaque / Reconnaissance', maxSpeed: 'Mach 2.0', maxAlt: '18 000 m', crew: 1,
  },

  'AV8BNA': {
    type: 'AV8BNA', displayName: 'AV-8B Harrier II N/A', origin: 'USA',
    imageUrl: WP + 'd/d6/AV-8B_Harrier_-_USMC.jpg/400px-AV-8B_Harrier_-_USMC.jpg',
    role: 'Attaque embarquée STOVL', maxSpeed: 'Mach 0.9', maxAlt: '15 000 m', crew: 1,
  },

  'B-52H': {
    type: 'B-52H', displayName: 'B-52H Stratofortress', origin: 'USA',
    imageUrl: WP + '1/16/B-52_Stratofortress_assigned_to_the_307th_Bomb_Wing_%28cropped%29.jpg/400px-B-52_Stratofortress_assigned_to_the_307th_Bomb_Wing_%28cropped%29.jpg',
    role: 'Bombardier stratégique', maxSpeed: '1 000 km/h', maxAlt: '15 000 m', crew: 5,
  },

  'C-130': {
    type: 'C-130', displayName: 'C-130 Hercules', origin: 'USA',
    imageUrl: WP + 'c/cc/Lockheed_C-130_Hercules.jpg/400px-Lockheed_C-130_Hercules.jpg',
    role: 'Transport tactique', maxSpeed: '643 km/h', maxAlt: '10 000 m', crew: 4,
  },

  // ── Avions rouges (RUS/OPFOR) ──────────────────────────────────────────

  'Su-27': {
    type: 'Su-27', displayName: 'Su-27 Flanker', origin: 'Russie',
    imageUrl: WP + '0/04/Sukhoi_Su-27SKM_at_MAKS-2005_airshow.jpg/400px-Sukhoi_Su-27SKM_at_MAKS-2005_airshow.jpg',
    role: 'Chasseur de supériorité aérienne', maxSpeed: 'Mach 2.35', maxAlt: '18 000 m', crew: 1,
    description: 'Concurrent direct du F-15, superbe manœuvrabilité.',
    loadouts: [
      { name: 'CAP Flanker', role: 'Air-Air',
        pylons: [{station:1,weapon:'R-73',count:1},{station:2,weapon:'R-27R',count:2},{station:5,weapon:'R-27ER',count:2},{station:9,weapon:'R-27R',count:2},{station:10,weapon:'R-73',count:1}] },
    ],
  },

  'MiG-29A': {
    type: 'MiG-29A', displayName: 'MiG-29A Fulcrum', origin: 'Russie',
    imageUrl: WP + 'a/af/VVS_100th_IMG_0691_%287727464290%29_%28cropped%29.jpg/400px-VVS_100th_IMG_0691_%287727464290%29_%28cropped%29.jpg',
    role: 'Chasseur léger', maxSpeed: 'Mach 2.25', maxAlt: '18 000 m', crew: 1,
    description: 'Réponse soviétique au F-16, très manœuvrable à basse altitude.',
  },

  'MiG-29S': {
    type: 'MiG-29S', displayName: 'MiG-29S Fulcrum-C', origin: 'Russie',
    imageUrl: WP + 'a/af/VVS_100th_IMG_0691_%287727464290%29_%28cropped%29.jpg/400px-VVS_100th_IMG_0691_%287727464290%29_%28cropped%29.jpg',
    role: 'Chasseur léger multirôle', maxSpeed: 'Mach 2.25', maxAlt: '18 000 m', crew: 1,
  },

  'MiG-29 Fulcrum': {
    type: 'MiG-29 Fulcrum', displayName: 'MiG-29 Fulcrum', origin: 'Russie',
    imageUrl: WP + 'a/af/VVS_100th_IMG_0691_%287727464290%29_%28cropped%29.jpg/400px-VVS_100th_IMG_0691_%287727464290%29_%28cropped%29.jpg',
    role: 'Chasseur léger', maxSpeed: 'Mach 2.25', maxAlt: '18 000 m', crew: 1,
  },

  'Su-25': {
    type: 'Su-25', displayName: 'Su-25 Frogfoot', origin: 'Russie',
    imageUrl: WP + 'f/f1/Sukhoi_Su-25_of_the_Russian_Air_Force_landing_at_Vladivostok_%288683076150%29.jpg/400px-Sukhoi_Su-25_of_the_Russian_Air_Force_landing_at_Vladivostok_%288683076150%29.jpg',
    role: 'Appui sol', maxSpeed: '950 km/h', maxAlt: '7 000 m', crew: 1,
    description: 'Équivalent soviétique du A-10, blindé et redoutable au sol.',
  },

  'Su-25T': {
    type: 'Su-25T', displayName: 'Su-25T Frogfoot', origin: 'Russie',
    imageUrl: WP + 'f/f1/Sukhoi_Su-25_of_the_Russian_Air_Force_landing_at_Vladivostok_%288683076150%29.jpg/400px-Sukhoi_Su-25_of_the_Russian_Air_Force_landing_at_Vladivostok_%288683076150%29.jpg',
    role: 'Appui sol avancé', maxSpeed: '950 km/h', maxAlt: '7 000 m', crew: 1,
  },

  'MiG-21Bis': {
    type: 'MiG-21Bis', displayName: 'MiG-21bis Fishbed', origin: 'Russie',
    imageUrl: WP + '0/0a/MiG-21bis_831_Lithuanian_Air_Force.jpg/400px-MiG-21bis_831_Lithuanian_Air_Force.jpg',
    role: 'Chasseur léger', maxSpeed: 'Mach 2.1', maxAlt: '19 000 m', crew: 1,
  },

  'J-11A': {
    type: 'J-11A', displayName: 'J-11A (Su-27SK)', origin: 'Chine',
    imageUrl: WP + '0/04/Sukhoi_Su-27SKM_at_MAKS-2005_airshow.jpg/400px-Sukhoi_Su-27SKM_at_MAKS-2005_airshow.jpg',
    role: 'Chasseur de supériorité aérienne', maxSpeed: 'Mach 2.35', maxAlt: '18 000 m', crew: 1,
  },

  'JF-17': {
    type: 'JF-17', displayName: 'JF-17 Thunder', origin: 'Pakistan/Chine',
    imageUrl: WP + 'c/c4/JF-17_Thunder_PAF.jpg/400px-JF-17_Thunder_PAF.jpg',
    role: 'Chasseur léger multirôle', maxSpeed: 'Mach 1.8', maxAlt: '16 000 m', crew: 1,
  },

  // ── Hélicoptères ────────────────────────────────────────────────────────

  'AH-64D': {
    type: 'AH-64D', displayName: 'AH-64D Apache Longbow', origin: 'USA',
    imageUrl: WP + '6/66/AH-64D_Apache_Longbow.jpg/400px-AH-64D_Apache_Longbow.jpg',
    role: 'Hélicoptère d\'attaque', maxSpeed: '293 km/h', maxAlt: '6 400 m', crew: 2,
    description: 'Le plus redoutable hélicoptère d\'attaque, radar Longbow FCR.',
    loadouts: [
      { name: 'Anti-Armor', role: 'Anti-Armor',
        pylons: [{station:1,weapon:'AGM-114K Hellfire',count:8},{station:2,weapon:'AGM-114K Hellfire',count:8}] },
      { name: 'Mixed CAS', role: 'CAS',
        pylons: [{station:1,weapon:'AGM-114K Hellfire',count:4},{station:2,weapon:'Hydra-70',count:19},{station:3,weapon:'Hydra-70',count:19},{station:4,weapon:'AGM-114K Hellfire',count:4}] },
    ],
  },

  'AH-64D_BLK_II': {
    type: 'AH-64D_BLK_II', displayName: 'AH-64D Block II', origin: 'USA',
    imageUrl: WP + '6/66/AH-64D_Apache_Longbow.jpg/400px-AH-64D_Apache_Longbow.jpg',
    role: 'Hélicoptère d\'attaque', maxSpeed: '293 km/h', maxAlt: '6 400 m', crew: 2,
  },

  'Ka-50': {
    type: 'Ka-50', displayName: 'Ka-50 Black Shark', origin: 'Russie',
    imageUrl: WP + '0/0c/Russian_Air_Force_Kamov_Ka-50.jpg/400px-Russian_Air_Force_Kamov_Ka-50.jpg',
    role: 'Hélicoptère d\'attaque', maxSpeed: '300 km/h', maxAlt: '5 500 m', crew: 1,
    description: 'Seul hélicoptère d\'attaque monoplace au monde, rotors coaxiaux.',
  },

  'Ka-50_3': {
    type: 'Ka-50_3', displayName: 'Ka-50-3 Black Shark 3', origin: 'Russie',
    imageUrl: WP + '0/0c/Russian_Air_Force_Kamov_Ka-50.jpg/400px-Russian_Air_Force_Kamov_Ka-50.jpg',
    role: 'Hélicoptère d\'attaque', maxSpeed: '300 km/h', maxAlt: '5 500 m', crew: 1,
  },

  'Mi-24V': {
    type: 'Mi-24V', displayName: 'Mi-24V Hind-E', origin: 'Russie',
    imageUrl: WP + 'c/ca/Mi24CP_%28modified%29_b.jpg/400px-Mi24CP_%28modified%29_b.jpg',
    role: 'Hélicoptère d\'attaque/transport', maxSpeed: '335 km/h', maxAlt: '4 500 m', crew: 2,
    description: 'Le Char volant — peut transporter 8 soldats tout en attaquant.',
  },

  'Mi-24P': {
    type: 'Mi-24P', displayName: 'Mi-24P Hind-F', origin: 'Russie',
    imageUrl: WP + 'c/ca/Mi24CP_%28modified%29_b.jpg/400px-Mi24CP_%28modified%29_b.jpg',
    role: 'Hélicoptère d\'attaque', maxSpeed: '335 km/h', maxAlt: '4 500 m', crew: 2,
  },

  'UH-1H': {
    type: 'UH-1H', displayName: 'UH-1H Huey', origin: 'USA',
    imageUrl: WP + 'e/ea/UH-1H_Iroquois.jpg/400px-UH-1H_Iroquois.jpg',
    role: 'Hélicoptère utilitaire', maxSpeed: '222 km/h', maxAlt: '5 910 m', crew: 2,
  },

  'Mi-8MT': {
    type: 'Mi-8MT', displayName: 'Mi-8MTV2 Hip', origin: 'Russie',
    imageUrl: WP + '1/1b/Mil_Mi-8P%2C_Baltic_Airlines_%28cropped%29.jpg/400px-Mil_Mi-8P%2C_Baltic_Airlines_%28cropped%29.jpg',
    role: 'Transport / Assault', maxSpeed: '250 km/h', maxAlt: '4 500 m', crew: 2,
  },

  'SA342M': {
    type: 'SA342M', displayName: 'SA-342M Gazelle', origin: 'France',
    imageUrl: WP + 'a/a7/SA342_Gazelle.jpg/400px-SA342_Gazelle.jpg',
    role: 'Hélicoptère léger d\'attaque', maxSpeed: '264 km/h', maxAlt: '3 200 m', crew: 2,
  },

  'AH-64A': {
    type: 'AH-64A', displayName: 'AH-64A Apache', origin: 'USA',
    imageUrl: WP + '6/66/AH-64D_Apache_Longbow.jpg/400px-AH-64D_Apache_Longbow.jpg',
    role: 'Hélicoptère d\'attaque', maxSpeed: '293 km/h', maxAlt: '6 400 m', crew: 2,
  },
};

/** Retourne les infos d'une unité, ou null si inconnue */
export function getUnitInfo(unitType: string): UnitInfo | null {
  return UNIT_DATABASE[unitType] ?? null;
}

/** Retourne l'URL de l'image ou undefined */
export function getUnitImageUrl(unitType: string): string | undefined {
  return UNIT_DATABASE[unitType]?.imageUrl;
}
