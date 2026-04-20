// ── Époques historiques ───────────────────────────────────────────────────

export interface Decade {
  id: string;
  label: string;
  years: string;
  description: string;
}

export const DECADES: Decade[] = [
  { id: '1940', label: 'WWII',     years: '1939–1945', description: 'Seconde Guerre Mondiale — hélices, bombers, intercepteurs' },
  { id: '1950', label: 'Korea',    years: '1950–1959', description: 'Guerre de Corée — premiers jets, F-86 vs MiG-15' },
  { id: '1960', label: '1960s',    years: '1960–1969', description: 'Guerre froide — supersoniques, SAM SA-2' },
  { id: '1970', label: '1970s',    years: '1970–1979', description: 'Vietnam, Yom Kippour — F-4, MiG-21, SA-6' },
  { id: '1980', label: '1980s',    years: '1980–1989', description: 'F-15, F-16, Su-27 — début du BVR moderne' },
  { id: '1990', label: '1990s',    years: '1990–1999', description: 'Tempête du Désert — coalition vs Iraq' },
  { id: '2000', label: '2000s',    years: '2000–2009', description: 'Irak, Afghanistan — drone, JDAM, précision' },
  { id: '2010', label: '2010s',    years: '2010–2019', description: 'Syrie, Ukraine — F-35, Su-35, A2/AD' },
  { id: '2020', label: 'Modern',   years: '2020+',     description: 'Conflit contemporain — stealth, frappes de précision' },
];

// ── Théâtres d'opération ──────────────────────────────────────────────────

export interface Theater {
  id: string;
  label: string;
  region: string;
  description: string;
  centerLat: number;
  centerLon: number;
  zoom: number;
}

export const THEATERS: Theater[] = [
  { id: 'caucasus',     label: 'Caucase',          region: 'Europe de l\'Est', description: 'Géorgie, Russie du Sud — terrain varié, montagnes',        centerLat: 42.0, centerLon: 43.5,  zoom: 7  },
  { id: 'persiangulf',  label: 'Golfe Persique',   region: 'Moyen-Orient',     description: 'Émirats, Iran, Oman — mer + désert',                         centerLat: 25.5, centerLon: 56.0,  zoom: 7  },
  { id: 'nevada',       label: 'Nevada NTTR',      region: 'USA',              description: 'Nellis Test Range — idéal entraînement et red flag',          centerLat: 36.5, centerLon: -116.0,zoom: 7  },
  { id: 'syria',        label: 'Syrie',            region: 'Moyen-Orient',     description: 'Méditerranée, Syrie, Liban — conflits modernes',              centerLat: 35.0, centerLon: 38.0,  zoom: 7  },
  { id: 'normandy',     label: 'Normandie',        region: 'Europe de l\'Ouest',description: 'Débarquement — WWII exclusivement',                          centerLat: 49.0, centerLon: -1.0,  zoom: 8  },
  { id: 'channel',      label: 'La Manche',        region: 'Europe de l\'Ouest',description: 'Angleterre, Nord de la France — Bataille d\'Angleterre',     centerLat: 51.0, centerLon: 1.5,   zoom: 8  },
  { id: 'marianaislands',label: 'Îles Mariannes',  region: 'Pacifique',        description: 'Guerre du Pacifique — WWII, Guam, Saipan',                    centerLat: 15.0, centerLon: 145.0, zoom: 7  },
  { id: 'afghanistan',  label: 'Afghanistan',      region: 'Asie Centrale',    description: 'Terrain montagneux — CAS, COIN, CSAR',                       centerLat: 34.0, centerLon: 66.0,  zoom: 6  },
  { id: 'sinai',        label: 'Sinaï',            region: 'Moyen-Orient',     description: 'Égypte, Israël — 1973 Yom Kippour possible',                  centerLat: 29.5, centerLon: 34.0,  zoom: 7  },
  { id: 'iraq',         label: 'Iraq',             region: 'Moyen-Orient',     description: 'Désert mesopotamien — ODS, OIF',                              centerLat: 33.0, centerLon: 43.0,  zoom: 6  },
];

// ── Types de mission ──────────────────────────────────────────────────────

export interface MissionTask {
  id: string;
  label: string;
  category: 'air' | 'ground' | 'naval' | 'mixed';
  description: string;
  playerRole: string;
  threatLevel: 'low' | 'medium' | 'high' | 'extreme';
  recommendedAircraft: string[];
  objectives: string[];
}

export const MISSION_TASKS: MissionTask[] = [
  {
    id: 'cap',
    label: 'CAP — Patrouille aérienne',
    category: 'air',
    description: 'Maintenir la supériorité aérienne sur une zone définie contre des chasseurs ennemis.',
    playerRole: 'Chasseur',
    threatLevel: 'high',
    recommendedAircraft: ['F-15C', 'F-16C_50', 'Su-27', 'MiG-29A', 'F-14A'],
    objectives: ['Éliminer les chasseurs ennemis dans la zone', 'Maintenir le contrôle aérien 30 min', 'Protéger les assets alliés'],
  },
  {
    id: 'intercept',
    label: 'INTERCEPT — Interception',
    category: 'air',
    description: 'Intercepter des bombardiers ou transports ennemis avant qu\'ils atteignent leur cible.',
    playerRole: 'Intercepteur',
    threatLevel: 'medium',
    recommendedAircraft: ['F-15C', 'MiG-31', 'F-14A', 'Su-27'],
    objectives: ['Intercepter la formation ennemie avant la zone rouge', 'Détruire 80% des bombardiers', 'Retourner à la base'],
  },
  {
    id: 'cas',
    label: 'CAS — Appui sol rapproché',
    category: 'mixed',
    description: 'Soutenir les forces amies au sol en détruisant les blindés et l\'infanterie ennemie.',
    playerRole: 'Appui sol',
    threatLevel: 'medium',
    recommendedAircraft: ['A-10C', 'Su-25', 'AV8BNA', 'F-16C_50', 'AH-64D'],
    objectives: ['Détruire les colonnes blindées ennemies', 'Protéger les forces amies', 'Identifier les cibles via JTAC'],
  },
  {
    id: 'sead',
    label: 'SEAD — Suppression des défenses',
    category: 'air',
    description: 'Neutraliser les systèmes SAM ennemis pour permettre des frappes en profondeur.',
    playerRole: 'SEAD',
    threatLevel: 'extreme',
    recommendedAircraft: ['F-16C_50', 'F/A-18C', 'Tornado GR4'],
    objectives: ['Détruire les radars de guidage SA-6/SA-10', 'Neutraliser les lanceurs SAM', 'Ouvrir le corridor aérien'],
  },
  {
    id: 'strike',
    label: 'STRIKE — Frappe stratégique',
    category: 'air',
    description: 'Frapper des objectifs fixes (dépôts, usines, QG) en profondeur dans le territoire ennemi.',
    playerRole: 'Strike',
    threatLevel: 'high',
    recommendedAircraft: ['F-15E', 'Su-34', 'F/A-18C', 'AJS37', 'Tornado GR4'],
    objectives: ['Détruire les objectifs désignés', 'Éviter les pertes civiles', 'Retour sécurisé'],
  },
  {
    id: 'anti_ship',
    label: 'ANTI-SHIP — Maritime',
    category: 'naval',
    description: 'Attaquer des navires de guerre ennemis avec des missiles anti-navires.',
    playerRole: 'Strike naval',
    threatLevel: 'high',
    recommendedAircraft: ['F/A-18C', 'Su-30', 'AV8BNA', 'Tu-22M3'],
    objectives: ['Localiser le groupe naval ennemi', 'Détruire le destroyer/croiseur', 'Éviter les SAM navals'],
  },
  {
    id: 'escort',
    label: 'ESCORT — Escorte',
    category: 'air',
    description: 'Protéger une formation de bombardiers ou de transports contre les chasseurs ennemis.',
    playerRole: 'Escorte',
    threatLevel: 'high',
    recommendedAircraft: ['F-15C', 'F-16C_50', 'Su-27', 'MiG-29A'],
    objectives: ['Escorter la formation jusqu\'à l\'objectif', 'Neutraliser les chasseurs ennemis', 'Ramener 80% des bombardiers'],
  },
  {
    id: 'csar',
    label: 'CSAR — Recherche & Sauvetage',
    category: 'mixed',
    description: 'Récupérer un pilote abattu dans une zone dangereuse sous couverture aérienne.',
    playerRole: 'Hélicoptère de sauvetage',
    threatLevel: 'high',
    recommendedAircraft: ['UH-1H', 'Mi-8MT', 'AH-64D', 'Ka-50'],
    objectives: ['Localiser le pilote abattu', 'Sécuriser la zone LZ', 'Exfiltration sécurisée'],
  },
  {
    id: 'oca',
    label: 'OCA — Attaque de base aérienne',
    category: 'air',
    description: 'Détruire les avions ennemis au sol, les pistes et les infrastructures aéroportuaires.',
    playerRole: 'Strike',
    threatLevel: 'extreme',
    recommendedAircraft: ['F-15E', 'Su-34', 'Su-24', 'Tornado GR4'],
    objectives: ['Détruire les avions au parking', 'Neutraliser les tours de contrôle', 'Cratering de piste'],
  },
  {
    id: 'recce',
    label: 'RECCO — Reconnaissance',
    category: 'air',
    description: 'Photographier et identifier des positions ennemies sans engager.',
    playerRole: 'Recco',
    threatLevel: 'medium',
    recommendedAircraft: ['F-14A', 'MiG-21Bis', 'AJS37'],
    objectives: ['Survoler les zones désignées', 'Identifier les mouvements ennemis', 'Retour avant détection'],
  },
  {
    id: 'transport',
    label: 'TRANSPORT — Logistique',
    category: 'mixed',
    description: 'Livrer des troupes ou du matériel sur une LZ sous protection aérienne.',
    playerRole: 'Transport',
    threatLevel: 'low',
    recommendedAircraft: ['UH-1H', 'Mi-8MT', 'C-130'],
    objectives: ['Charger les troupes/matériel', 'Rejoindre la LZ désignée', 'Déposer sous protection'],
  },
  {
    id: 'dca',
    label: 'DCA — Défense aérienne',
    category: 'air',
    description: 'Défendre une zone ou une base contre des vagues d\'attaque ennemies.',
    playerRole: 'Défense',
    threatLevel: 'extreme',
    recommendedAircraft: ['F-15C', 'Su-27', 'MiG-29A', 'F-16C_50'],
    objectives: ['Intercepter les vagues d\'attaque', 'Protéger la base alliée', 'Limiter les pertes au sol'],
  },
];

// ── Pays et coalitions ────────────────────────────────────────────────────

export interface CountryDef {
  id: string;
  name: string;
  flag: string;
  region: string;
  defaultCoalition: 'blue' | 'red' | 'neutral';
  decades: string[];  // Époques disponibles
  aircraftPool: string[];
  vehiclePool: string[];
  samPool: string[];
  description?: string;
}

export const COUNTRIES: CountryDef[] = [
  // ── NATO / Bleus ─────────────────────────────────────────────────────────
  {
    id: 'usa', name: 'États-Unis', flag: '🇺🇸', region: 'OTAN',
    defaultCoalition: 'blue',
    decades: ['1940','1950','1960','1970','1980','1990','2000','2010','2020'],
    aircraftPool: ['F-86F Sabre','F-4E','F-15C','F-15E','F-16C_50','FA-18C_hornet','F-14A','F-14B','A-10C','A-10C_2','AV8BNA','B-52H','C-130','KC-135','E-3A','P-51D','P-47D'],
    vehiclePool: ['M-1 Abrams','M-2 Bradley','M-113','M-109','M-270 MLRS','Stryker'],
    samPool: ['Patriot AIO','Chaparral','Hawk cw','Roland Radar'],
    description: 'Force la plus complète, couvre toutes les époques',
  },
  {
    id: 'france', name: 'France', flag: '🇫🇷', region: 'OTAN',
    defaultCoalition: 'blue',
    decades: ['1970','1980','1990','2000','2010','2020'],
    aircraftPool: ['M-2000C','M-2000-5','Mirage F1','SA342M','C-130'],
    vehiclePool: ['Leclerc','AMX-10P','Caesar'],
    samPool: ['Roland Radar','Crotale'],
    description: 'Mirage + Rafale, SAM Roland/Crotale',
  },
  {
    id: 'uk', name: 'Royaume-Uni', flag: '🇬🇧', region: 'OTAN',
    defaultCoalition: 'blue',
    decades: ['1940','1970','1980','1990','2000','2010','2020'],
    aircraftPool: ['Spitfire','Tornado GR4','AV8BNA','C-130'],
    vehiclePool: ['Challenger2','Warrior'],
    samPool: ['Rapier'],
    description: 'Spitfire WWII + Tornado modern',
  },
  {
    id: 'germany', name: 'Allemagne', flag: '🇩🇪', region: 'OTAN',
    defaultCoalition: 'blue',
    decades: ['1980','1990','2000','2010','2020'],
    aircraftPool: ['Bf 109K-4','FW-190A8','Tornado GR4','C-130'],
    vehiclePool: ['Leopard-2','Marder'],
    samPool: ['Roland Radar','Gepard'],
    description: 'WWII Luftwaffe + Bundeswehr moderne',
  },
  {
    id: 'israel', name: 'Israël', flag: '🇮🇱', region: 'Moyen-Orient',
    defaultCoalition: 'blue',
    decades: ['1970','1980','1990','2000','2010','2020'],
    aircraftPool: ['F-15C','F-15E','F-16C_50','A-4E-C'],
    vehiclePool: ['Merkava_Mk4'],
    samPool: ['Patriot AIO'],
    description: 'IAF — F-15, F-16, doctrine de frappe préventive',
  },
  {
    id: 'turkey', name: 'Turquie', flag: '🇹🇷', region: 'OTAN',
    defaultCoalition: 'blue',
    decades: ['1980','1990','2000','2010','2020'],
    aircraftPool: ['F-16C_50','F-4E'],
    vehiclePool: ['M-60','Leopard-2'],
    samPool: ['Hawk cw','S-400'],
    description: 'Armée OTAN au carrefour OTAN/Russie',
  },
  {
    id: 'greece', name: 'Grèce', flag: '🇬🇷', region: 'OTAN',
    defaultCoalition: 'blue',
    decades: ['1980','1990','2000','2010','2020'],
    aircraftPool: ['F-16C_50','Mirage F1','A-7E Corsair II'],
    vehiclePool: ['Leopard-2','M-113'],
    samPool: ['Hawk cw','S-300V'],
    description: 'FAG — F-16 + Mirage 2000',
  },
  {
    id: 'sweden', name: 'Suède', flag: '🇸🇪', region: 'Neutre/OTAN',
    defaultCoalition: 'blue',
    decades: ['1980','1990','2000','2010','2020'],
    aircraftPool: ['AJS37','F-16C_50'],
    vehiclePool: ['CV-90'],
    samPool: ['HAWK cw'],
    description: 'Viggen — doctrine défensive neutre suédoise',
  },
  {
    id: 'uae', name: 'Émirats arabes unis', flag: '🇦🇪', region: 'Golfe',
    defaultCoalition: 'blue',
    decades: ['1990','2000','2010','2020'],
    aircraftPool: ['F-16C_50','Mirage F1'],
    vehiclePool: ['Leclerc','M-3 CFV'],
    samPool: ['Hawk cw','Patriot AIO'],
    description: 'UAEAF — F-16 Block 60 Desert Falcon',
  },
  {
    id: 'south_korea', name: 'Corée du Sud', flag: '🇰🇷', region: 'Asie',
    defaultCoalition: 'blue',
    decades: ['1990','2000','2010','2020'],
    aircraftPool: ['F-15E','F-16C_50'],
    vehiclePool: ['M-1 Abrams','K2_BlackPanther'],
    samPool: ['Hawk cw','Patriot AIO'],
    description: 'ROKAF — face à la menace Nord-Coréenne',
  },
  {
    id: 'japan', name: 'Japon', flag: '🇯🇵', region: 'Asie',
    defaultCoalition: 'blue',
    decades: ['1990','2000','2010','2020'],
    aircraftPool: ['F-15C','F-16C_50'],
    vehiclePool: ['M-1 Abrams','M-2 Bradley'],
    samPool: ['Patriot AIO','Hawk cw'],
    description: 'JASDF — défense aérienne avancée',
  },

  // ── OPFOR / Rouges ────────────────────────────────────────────────────────
  {
    id: 'russia', name: 'Russie', flag: '🇷🇺', region: 'OPFOR',
    defaultCoalition: 'red',
    decades: ['1950','1960','1970','1980','1990','2000','2010','2020'],
    aircraftPool: ['MiG-15bis','MiG-21Bis','MiG-23MLD','MiG-29A','MiG-29S','Su-27','Su-25','Su-25T','Su-34','Su-30','MiG-31','Tu-95MS','Tu-22M3','Mi-24V','Mi-24P','Mi-8MT','Ka-50','Ka-50_3'],
    vehiclePool: ['T-72B','T-80UD','T-90','BMP-2','BMP-3','BTR-80','2S19 Msta','BM-21 Grad'],
    samPool: ['SA-10 Grumble','SA-11 Buk SR','SA-6 Kub STR','SA-8 Osa AK','SA-15 Tor','SA-2 Guideline Towed','ZSU-23-4 Shilka'],
    description: 'Force la plus complète OPFOR — air + sol + SAM',
  },
  {
    id: 'china', name: 'Chine', flag: '🇨🇳', region: 'OPFOR',
    defaultCoalition: 'red',
    decades: ['1960','1970','1980','1990','2000','2010','2020'],
    aircraftPool: ['J-11A','JF-17','MiG-21Bis'],
    vehiclePool: ['T-72B','BMP-2'],
    samPool: ['SA-10 Grumble','SA-11 Buk SR'],
    description: 'PLAAF — copies Su-27 + JF-17',
  },
  {
    id: 'iran', name: 'Iran', flag: '🇮🇷', region: 'Moyen-Orient',
    defaultCoalition: 'red',
    decades: ['1980','1990','2000','2010','2020'],
    aircraftPool: ['MiG-29A','Su-25','F-14A','MiG-21Bis'],
    vehiclePool: ['T-72B','T-80UD','BMP-2'],
    samPool: ['SA-6 Kub STR','SA-8 Osa AK','SA-2 Guideline Towed'],
    description: 'IRIAF — F-14 capturés + MiG soviétiques',
  },
  {
    id: 'north_korea', name: 'Corée du Nord', flag: '🇰🇵', region: 'Asie',
    defaultCoalition: 'red',
    decades: ['1950','1960','1970','1980','1990','2000'],
    aircraftPool: ['MiG-15bis','MiG-21Bis','MiG-29A'],
    vehiclePool: ['T-72B','BMP-2'],
    samPool: ['SA-2 Guideline Towed','SA-6 Kub STR'],
    description: 'KPAF — équipement soviétique des années 60-80',
  },
  {
    id: 'syria', name: 'Syrie', flag: '🇸🇾', region: 'Moyen-Orient',
    defaultCoalition: 'red',
    decades: ['1970','1980','1990','2000','2010'],
    aircraftPool: ['MiG-21Bis','MiG-23MLD','MiG-29A','Su-24M'],
    vehiclePool: ['T-72B','T-55','BMP-2'],
    samPool: ['SA-6 Kub STR','SA-8 Osa AK','SA-2 Guideline Towed','ZSU-23-4 Shilka'],
    description: 'SAAF — force de défense A2/AD en Syrie',
  },
  {
    id: 'iraq_historical', name: 'Iraq (historique)', flag: '🇮🇶', region: 'Moyen-Orient',
    defaultCoalition: 'red',
    decades: ['1980','1990'],
    aircraftPool: ['MiG-21Bis','MiG-29A','Mirage F1','Su-25'],
    vehiclePool: ['T-72B','T-55','BMP-2'],
    samPool: ['SA-6 Kub STR','SA-8 Osa AK','Roland Radar'],
    description: 'IqAF ODS — Guerre du Golfe 1991',
  },
  {
    id: 'insurgents', name: 'Insurgés / COIN', flag: '⚔️', region: 'Asymétrique',
    defaultCoalition: 'red',
    decades: ['2000','2010','2020'],
    aircraftPool: [],
    vehiclePool: ['Ural-375','UAZ-469'],
    samPool: ['ZU-23-2S Ural-375','Igla'],
    description: 'Groupes non-étatiques — MANPADS, véhicules légers',
  },

  // ── Neutres / Contextuels ─────────────────────────────────────────────────
  {
    id: 'ukraine', name: 'Ukraine', flag: '🇺🇦', region: 'Europe de l\'Est',
    defaultCoalition: 'blue',
    decades: ['1990','2000','2010','2020'],
    aircraftPool: ['MiG-29A','Su-27','Su-25'],
    vehiclePool: ['T-72B','BMP-2','T-80UD'],
    samPool: ['SA-11 Buk SR','SA-10 Grumble','ZSU-23-4 Shilka'],
    description: 'Forces ukrainiennes — arsenal soviétique modernisé',
  },
  {
    id: 'georgia', name: 'Géorgie', flag: '🇬🇪', region: 'Caucase',
    defaultCoalition: 'blue',
    decades: ['2000','2010'],
    aircraftPool: ['Su-25'],
    vehiclePool: ['T-72B','BMP-2'],
    samPool: ['SA-11 Buk SR'],
    description: 'Petite force — Su-25 + blindés russes capturés',
  },
];

// ── Niveaux de difficulté ─────────────────────────────────────────────────

export interface DifficultyLevel {
  id: string;
  label: string;
  description: string;
  aiSkill: string;
  samDensity: 'none' | 'low' | 'medium' | 'high' | 'extreme';
  capStrength: 'none' | 'weak' | 'medium' | 'strong' | 'overwhelming';
  groundThreat: 'none' | 'light' | 'medium' | 'heavy';
  playerRespawn: boolean;
  limitedAmmo: boolean;
}

export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    id: 'recruit',
    label: 'Recrue',
    description: 'Idéal pour apprendre — IA faible, peu de SAM, respawn activé',
    aiSkill: 'Average',
    samDensity: 'none',
    capStrength: 'none',
    groundThreat: 'light',
    playerRespawn: true,
    limitedAmmo: false,
  },
  {
    id: 'pilot',
    label: 'Pilote',
    description: 'IA correcte, quelques SAM SHORAD, pas de respawn',
    aiSkill: 'Good',
    samDensity: 'low',
    capStrength: 'weak',
    groundThreat: 'medium',
    playerRespawn: false,
    limitedAmmo: false,
  },
  {
    id: 'ace',
    label: 'As',
    description: 'IA haute, SAM longue portée, CAP agressive — challenge réel',
    aiSkill: 'High',
    samDensity: 'medium',
    capStrength: 'medium',
    groundThreat: 'heavy',
    playerRespawn: false,
    limitedAmmo: true,
  },
  {
    id: 'topgun',
    label: 'TOPGUN',
    description: 'IA excellente, IADS intégré, pas de mercy — mission réaliste complète',
    aiSkill: 'Excellent',
    samDensity: 'high',
    capStrength: 'strong',
    groundThreat: 'heavy',
    playerRespawn: false,
    limitedAmmo: true,
  },
  {
    id: 'hell',
    label: 'Enfer',
    description: 'IADS dense, CAP en surnombre, SAM SA-10 — survie improbable',
    aiSkill: 'Excellent',
    samDensity: 'extreme',
    capStrength: 'overwhelming',
    groundThreat: 'heavy',
    playerRespawn: false,
    limitedAmmo: true,
  },
];

// ── Features optionnelles de mission ─────────────────────────────────────

export interface MissionFeature {
  id: string;
  label: string;
  icon: string;
  description: string;
  category: 'support' | 'threat' | 'logistics' | 'script';
  compatibleDecades?: string[];
}

export const MISSION_FEATURES: MissionFeature[] = [
  { id: 'awacs_blue',      label: 'AWACS Bleu',          icon: '📡', description: 'E-3 Sentry sur fréquence 240.000 MHz, radar et contrôle aérien',                         category: 'support', compatibleDecades: ['1980','1990','2000','2010','2020'] },
  { id: 'awacs_red',       label: 'AWACS Rouge',          icon: '📡', description: 'A-50 Mainstay ennemi — contrôle des chasseurs ennemis',                                  category: 'threat',  compatibleDecades: ['1980','1990','2000','2010','2020'] },
  { id: 'tanker_blue',     label: 'Ravitailleur OTAN',    icon: '⛽', description: 'KC-135 Stratotanker sur circuit, 310 MHz, type panier',                                   category: 'support', compatibleDecades: ['1970','1980','1990','2000','2010','2020'] },
  { id: 'tanker_red',      label: 'Ravitailleur Russe',   icon: '⛽', description: 'IL-78 Midas — support ravitaillement OPFOR',                                              category: 'support', compatibleDecades: ['1980','1990','2000','2010','2020'] },
  { id: 'cap_red',         label: 'CAP ennemie agressive',icon: '✈', description: 'Patrouille de chasseurs ennemis avec engagement BVR',                                     category: 'threat'  },
  { id: 'bomber_attack',   label: 'Attaque bombardiers',  icon: '💣', description: 'Vague de Tu-22 / B-52 — intercepter ou subir des dommages',                               category: 'threat',  compatibleDecades: ['1960','1970','1980','1990','2000','2010','2020'] },
  { id: 'friendly_armor',  label: 'Blindés alliés',       icon: '🪖', description: 'Colonne de chars T-72 / M1 alliée progressant vers l\'objectif',                           category: 'support' },
  { id: 'enemy_armor',     label: 'Blindés ennemis',      icon: '🚛', description: 'Colonne de chars ennemis — cible principale CAS',                                         category: 'threat'  },
  { id: 'csar_asset',      label: 'Asset CSAR',           icon: '🚁', description: 'Hélicoptère de sauvetage disponible si pilote éjecté',                                    category: 'logistics',compatibleDecades: ['1970','1980','1990','2000','2010','2020'] },
  { id: 'iads',            label: 'Réseau IADS intégré',  icon: '🛡', description: 'Défense aérienne intégrée avec EWR + SAM coordonnés via Skynet-IADS',                    category: 'script',  compatibleDecades: ['1980','1990','2000','2010','2020'] },
  { id: 'artillery',       label: 'Appui artillerie',     icon: '💥', description: 'Batteries d\'artillerie alliées supprimant des objectifs désignés',                       category: 'support' },
  { id: 'weather_storm',   label: 'Tempête dynamique',    icon: '⛈', description: 'Conditions météo dégradées — IFR, turbulences, visibilité réduite',                       category: 'support' },
  { id: 'night_op',        label: 'Mission de nuit',      icon: '🌙', description: 'Opération nocturne — NVG requis, illuminateurs laser',                                   category: 'support' },
  { id: 'jtac',            label: 'JTAC au sol',          icon: '🎯', description: 'Forward Air Controller désignant les cibles au laser sur fréquence 30 MHz',               category: 'support' },
  { id: 'drone',           label: 'Drones ennemis',       icon: '🔭', description: 'Essaim de drones de reconnaissance ennemi — détruire avant qu\'ils exfiltrent',            category: 'threat',  compatibleDecades: ['2010','2020'] },
  { id: 'ewr_network',     label: 'Réseau EWR ennemi',    icon: '📻', description: 'Radars de surveillance longue portée — détectent tôt votre approche',                    category: 'threat',  compatibleDecades: ['1970','1980','1990','2000','2010','2020'] },
];

// ── Options météo prédéfinies ─────────────────────────────────────────────

export interface WeatherPreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  visibility: number;  // km
  cloudBase?: number;  // ft
  wind?: number;       // m/s
}

export const WEATHER_PRESETS: WeatherPreset[] = [
  { id: 'clear',    label: 'CAVOK',      icon: '☀️',  description: 'Ciel dégagé, visibilité excellente 80 km',         visibility: 80 },
  { id: 'few',      label: 'Quelques nuages', icon: '🌤', description: 'Nuages épars, bon VFR 30 km',                    visibility: 30, cloudBase: 3000 },
  { id: 'overcast', label: 'Couvert',    icon: '⛅',  description: 'Couverture nuageuse 6/8, plafond 5000 ft',          visibility: 15, cloudBase: 5000 },
  { id: 'fog',      label: 'Brouillard', icon: '🌫',  description: 'Brouillard dense, visibilité < 1 km — IFR',         visibility: 1,  wind: 0 },
  { id: 'storm',    label: 'Orage',      icon: '⛈',  description: 'Tempête avec turbulences et éclairs',                visibility: 5,  cloudBase: 2000, wind: 12 },
  { id: 'dust',     label: 'Tempête de sable', icon: '🏜', description: 'Poussière du désert, visibilité 3 km',         visibility: 3,  wind: 8 },
  { id: 'rain',     label: 'Pluie',      icon: '🌧',  description: 'Pluie modérée, plafond 4000 ft',                    visibility: 10, cloudBase: 4000, wind: 5 },
];

// ── Saisons ───────────────────────────────────────────────────────────────

export interface Season {
  id: string;
  label: string;
  icon: string;
  month: number;  // 1-12
}

export const SEASONS: Season[] = [
  { id: 'spring', label: 'Printemps', icon: '🌸', month: 4  },
  { id: 'summer', label: 'Été',       icon: '☀️', month: 7  },
  { id: 'autumn', label: 'Automne',   icon: '🍂', month: 10 },
  { id: 'winter', label: 'Hiver',     icon: '❄️', month: 1  },
];

// ── Heures de départ ──────────────────────────────────────────────────────

export interface TimeOfDay {
  id: string;
  label: string;
  icon: string;
  hour: number;
}

export const TIMES_OF_DAY: TimeOfDay[] = [
  { id: 'dawn',     label: 'Aube',       icon: '🌅', hour: 5  },
  { id: 'morning',  label: 'Matin',      icon: '🌄', hour: 9  },
  { id: 'noon',     label: 'Midi',       icon: '☀️', hour: 12 },
  { id: 'afternoon',label: 'Après-midi', icon: '🌞', hour: 15 },
  { id: 'dusk',     label: 'Crépuscule', icon: '🌇', hour: 18 },
  { id: 'night',    label: 'Nuit',       icon: '🌙', hour: 22 },
];

// ── Type du générateur ────────────────────────────────────────────────────

export interface MissionGeneratorConfig {
  // Coalitions
  blueCountries: string[];
  redCountries: string[];

  // Contexte
  theaterId: string;
  decadeId: string;
  taskId: string;

  // Environnement
  weatherId: string;
  seasonId: string;
  timeOfDay: string;

  // Difficulté
  difficultyId: string;

  // Features
  features: string[];

  // Meta
  missionName: string;
  description: string;
  playerCoalition: 'blue' | 'red';
}

export const DEFAULT_GENERATOR_CONFIG: MissionGeneratorConfig = {
  blueCountries: ['usa'],
  redCountries: ['russia'],
  theaterId: 'caucasus',
  decadeId: '2000',
  taskId: 'cap',
  weatherId: 'clear',
  seasonId: 'summer',
  timeOfDay: 'morning',
  difficultyId: 'ace',
  features: ['awacs_blue', 'tanker_blue'],
  missionName: 'Op. Thunder',
  description: '',
  playerCoalition: 'blue',
};
