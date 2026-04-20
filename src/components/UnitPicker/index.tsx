import { useState, useMemo, useEffect } from 'react';

export interface UnitEntry {
  type: string;
  name: string;
  subcategory?: string;
  coalition?: string;
  country?: string;
  era?: string;
  role?: string;
}

interface UnitPickerProps {
  category?: 'plane' | 'helicopter' | 'vehicle' | 'ship' | 'static' | 'all';
  coalition?: 'blue' | 'red' | 'both' | null;
  selected?: string;
  onSelect: (unit: UnitEntry) => void;
  height?: string; // CSS height, default "360px"
}

// Labels pour les sous-catégories
const SUBCAT_LABELS: Record<string, string> = {
  fighter: '✈ Chasseur',
  attacker: '⚡ Attaque',
  bomber: '💣 Bombardier',
  transport: '📦 Transport',
  awacs: '👁 AWACS',
  tanker: '🛢 Ravitailleur',
  uav: '🤖 Drone',
  trainer: '🎓 Entraînement',
  ww2: '⚔ WWII',
  other: '• Autre',
  attack: '⚡ Attaque',
  // vehicle
  tank: '🛡 Chars',
  ifv: '⚡ VCI/VBL',
  sam: '🎯 SAM',
  aa: '🔫 AA',
  radar: '📡 Radar/EWR',
  artillery: '💥 Artillerie',
  apc: '🚌 APC',
  supply: '📦 Support/Autre',
  engineering: '🔧 Génie',
  // ship
  carrier: '🛳 Porte-avions',
  destroyer: '⚓ Destroyer',
  frigate: '⚓ Frégate',
  submarine: '🤿 Sous-marin',
  patrol: '⛵ Patrouilleur',
  landing: '🚢 Débarquement',
  support: '⚓ Support',
};

// Catégories principales
const CAT_LABELS: Record<string, string> = {
  plane: '✈ Avions',
  helicopter: '🚁 Hélicoptères',
  vehicle: '🛡 Véhicules',
  ship: '⚓ Navires',
  static: '▲ Statiques',
};

export default function UnitPicker({
  category = 'all',
  coalition,
  selected,
  onSelect,
  height = '360px',
}: UnitPickerProps) {
  const [search, setSearch] = useState('');
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({ plane: true });
  const [openSubcats, setOpenSubcats] = useState<Record<string, boolean>>({});
  const [db, setDb] = useState<Record<string, UnitEntry[]> | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/units_db.json`)
      .then(r => r.json())
      .then(setDb)
      .catch(() => {});
  }, []);

  // Filtrer et grouper
  const grouped = useMemo(() => {
    if (!db) return {};
    const cats =
      category === 'all'
        ? ['plane', 'helicopter', 'vehicle', 'ship', 'static']
        : [category];

    const result: Record<string, Record<string, UnitEntry[]>> = {};

    for (const cat of cats) {
      const units = (db[cat] ?? []).filter(u => {
        if (
          coalition &&
          coalition !== 'both' &&
          u.coalition &&
          u.coalition !== 'both' &&
          u.coalition !== coalition
        )
          return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          u.name?.toLowerCase().includes(q) ||
          u.type?.toLowerCase().includes(q) ||
          u.country?.toLowerCase().includes(q)
        );
      });
      if (units.length === 0) continue;

      // Grouper par sous-catégorie
      result[cat] = {};
      for (const u of units) {
        const sub = u.subcategory ?? 'other';
        if (!result[cat][sub]) result[cat][sub] = [];
        result[cat][sub].push(u);
      }
    }
    return result;
  }, [db, category, coalition, search]);

  const toggleCat = (cat: string) =>
    setOpenCats(p => ({ ...p, [cat]: !p[cat] }));
  const toggleSub = (key: string) =>
    setOpenSubcats(p => ({ ...p, [key]: !p[key] }));

  const coalColor = (c?: string) =>
    c === 'blue'
      ? 'text-blue-400'
      : c === 'red'
      ? 'text-red-400'
      : 'text-slate-400';

  return (
    <div
      style={{ height }}
      className="flex flex-col bg-slate-900 rounded overflow-hidden"
    >
      {/* Recherche */}
      <div className="px-2 py-1.5 border-b border-slate-700">
        <input
          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          placeholder="🔍 Rechercher une unité..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Arbre */}
      <div className="flex-1 overflow-y-auto text-xs">
        {!db && (
          <div className="p-4 text-slate-500 text-center">Chargement...</div>
        )}

        {Object.entries(grouped).map(([cat, subcats]) => (
          <div key={cat}>
            {/* Header catégorie */}
            <button
              className="w-full flex items-center gap-1.5 px-2 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border-b border-slate-700"
              onClick={() => toggleCat(cat)}
            >
              <span className="text-amber-500">
                {openCats[cat] ? '▼' : '▶'}
              </span>
              <span>{CAT_LABELS[cat] ?? cat}</span>
              <span className="ml-auto text-slate-500 font-normal">
                {Object.values(subcats).reduce((a, u) => a + u.length, 0)}
              </span>
            </button>

            {openCats[cat] &&
              Object.entries(subcats).map(([sub, units]) => {
                const subKey = `${cat}:${sub}`;
                return (
                  <div key={sub}>
                    {/* Header sous-catégorie */}
                    <button
                      className="w-full flex items-center gap-1.5 px-3 py-1 hover:bg-slate-800 text-slate-400 border-b border-slate-800"
                      onClick={() => toggleSub(subKey)}
                    >
                      <span className="text-slate-600">
                        {openSubcats[subKey] ? '▼' : '▶'}
                      </span>
                      <span>{SUBCAT_LABELS[sub] ?? sub}</span>
                      <span className="ml-auto text-slate-600">
                        {units.length}
                      </span>
                    </button>

                    {/* Unités */}
                    {openSubcats[subKey] &&
                      units.map(u => (
                        <button
                          key={u.type}
                          className={`w-full flex items-center gap-2 px-4 py-0.5 hover:bg-slate-700 text-left border-b border-slate-800/50 ${
                            selected === u.type
                              ? 'bg-amber-600/20 border-l-2 border-l-amber-500'
                              : ''
                          }`}
                          onClick={() => onSelect(u)}
                        >
                          <span className="text-slate-200 flex-1 truncate">
                            {u.name}
                          </span>
                          {u.country && (
                            <span
                              className={`text-[10px] ${coalColor(u.coalition)} shrink-0`}
                            >
                              {u.country}
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                );
              })}
          </div>
        ))}

        {Object.keys(grouped).length === 0 && db && (
          <div className="p-4 text-slate-500 text-center">
            Aucune unité trouvée
          </div>
        )}
      </div>
    </div>
  );
}
