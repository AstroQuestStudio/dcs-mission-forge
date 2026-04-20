import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useMissionStore, extractAllGroups, extractTriggerZones, type GroupEntry } from '../../store/missionStore';
import { dcsToLatLng, latLngToDcs } from '../../utils/dcsCoords';
import type { LeafletMouseEvent } from 'leaflet';
import type { DCSGroup, DCSUnit } from '../../types/dcs';

// ── Constantes ─────────────────────────────────────────────────────────────
const COAL_COLOR: Record<string, string> = {
  blue: '#3b82f6', red: '#ef4444', neutrals: '#94a3b8',
};
const CAT_SYM: Record<string, string> = {
  plane: '✈', helicopter: '🚁', vehicle: '⬛', ship: '⚓', static: '▲',
};
const SKILL_ALPHA: Record<string, number> = {
  Excellent: 1.0, High: 0.85, Good: 0.7, Average: 0.55, Random: 0.5, Player: 1.0, Client: 1.0,
};

// ── Icônes SVG dynamiques ──────────────────────────────────────────────────

function makeUnitIcon(coalition: string, category: string, selected: boolean, isLeader: boolean, skill?: string) {
  const color = COAL_COLOR[coalition] ?? '#888';
  const sym = CAT_SYM[category] ?? '•';
  const alpha = SKILL_ALPHA[skill ?? 'Good'] ?? 0.7;
  const size = selected ? (isLeader ? 38 : 30) : (isLeader ? 30 : 22);
  const borderW = selected ? 3 : (isLeader ? 2 : 1.5);
  const borderColor = selected ? '#fbbf24' : color;
  const bg = selected ? '#0f172a' : `rgba(15,23,42,${0.7 + alpha * 0.3})`;
  const shadow = selected ? '0 0 12px 3px rgba(251,191,36,.6)' : isLeader ? '0 2px 8px rgba(0,0,0,.6)' : '0 1px 4px rgba(0,0,0,.5)';
  const fontSize = isLeader ? Math.round(size * 0.48) : Math.round(size * 0.52);

  return divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:${isLeader ? '50%' : '4px'};
      background:${bg};
      border:${borderW}px solid ${borderColor};
      display:flex;align-items:center;justify-content:center;
      font-size:${fontSize}px;
      box-shadow:${shadow};
      cursor:pointer;
      transition:all .12s;
      opacity:${alpha};
    ">${sym}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeAirportIcon() {
  return divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:6px;
      background:#0f172a;border:2px solid #334155;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.5);
    ">✈</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function ClickHandler({ addMode, onMapClick }: { addMode: boolean; onMapClick: (e: LeafletMouseEvent) => void }) {
  const { selectEntity } = useMissionStore();
  useMapEvents({
    click: e => { if (addMode) onMapClick(e); else selectEntity(null); },
  });
  return null;
}

function FlyTo({ groups }: { groups: GroupEntry[] }) {
  const { selectedEntity } = useMissionStore();
  const map = useMap();
  const prev = useRef('');
  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== 'group') return;
    const key = `${selectedEntity.coalition}.${selectedEntity.countryIdx}.${selectedEntity.category}.${selectedEntity.groupIdx}`;
    if (key === prev.current) return;
    prev.current = key;
    const e = groups.find(g =>
      g.coalition === selectedEntity.coalition &&
      g.countryIdx === selectedEntity.countryIdx &&
      g.category === selectedEntity.category &&
      g.groupIdx === selectedEntity.groupIdx
    );
    if (!e) return;
    const x = e.group.x ?? e.group.units?.[0]?.x ?? 0;
    const y = e.group.y ?? e.group.units?.[0]?.y ?? 0;
    map.flyTo(dcsToLatLng(x, y), Math.max(map.getZoom(), 9), { duration: 0.8 });
  }, [selectedEntity, groups, map]);
  return null;
}

// ── Marqueur d'unité individuelle ──────────────────────────────────────────
function UnitMarker({
  unit, unitIdx, entry, isGroupSelected, onSelectGroup, onMoveUnit,
}: {
  unit: DCSUnit;
  unitIdx: number;
  entry: GroupEntry;
  isGroupSelected: boolean;
  onSelectGroup: () => void;
  onMoveUnit: (unitIdx: number, x: number, y: number) => void;
}) {
  const isLeader = unitIdx === 0;
  const pos = dcsToLatLng(unit.x, unit.y);
  const icon = makeUnitIcon(entry.coalition, entry.category, isGroupSelected && isLeader, isLeader, unit.skill);

  return (
    <Marker
      position={pos}
      icon={icon}
      zIndexOffset={isGroupSelected ? (isLeader ? 300 : 200) : (isLeader ? 10 : 0)}
      draggable
      eventHandlers={{
        click: e => { e.originalEvent.stopPropagation(); onSelectGroup(); },
        dragend: e => {
          const ll = e.target.getLatLng();
          const { x, y } = latLngToDcs(ll.lat, ll.lng);
          onMoveUnit(unitIdx, x, y);
        },
      }}
    >
      <Tooltip direction="top" offset={[0, -14]} opacity={0.97}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5 }}>
          {isLeader && (
            <div style={{ fontWeight: 'bold', color: COAL_COLOR[entry.coalition] ?? '#888' }}>
              {entry.group.name}
            </div>
          )}
          <div style={{ color: '#cbd5e1' }}>{unit.name}</div>
          <div style={{ color: '#64748b' }}>
            {unit.type} · {unit.skill} · {Math.round(unit.alt ?? 0)}m
          </div>
          {isGroupSelected && isLeader && (
            <div style={{ color: '#fbbf24', fontSize: 10 }}>✦ Sélectionné · glisser = déplacer</div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
}

// ── Groupe complet (toutes ses unités + route) ─────────────────────────────
function GroupMarkers({ entry, isSelected, onSelect, onMove }: {
  entry: GroupEntry;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (unitIdx: number, x: number, y: number) => void;
}) {
  const { group } = entry;

  // Waypoints visibles si groupe sélectionné ou si peu de groupes
  const waypoints = useMemo(() =>
    (group.route?.points ?? []).filter(wp => wp.x != null && wp.y != null).map(wp => dcsToLatLng(wp.x, wp.y)),
    [group.route?.points]
  );

  return (
    <>
      {/* Route */}
      {waypoints.length > 1 && (
        <Polyline
          positions={waypoints}
          pathOptions={{
            color: COAL_COLOR[entry.coalition] ?? '#888',
            weight: isSelected ? 2.5 : 1,
            opacity: isSelected ? 0.85 : 0.25,
            dashArray: isSelected ? '8 4' : '3 6',
          }}
        />
      )}

      {/* Chaque unité individuellement */}
      {(group.units ?? []).map((unit, ui) => (
        <UnitMarker
          key={ui}
          unit={unit}
          unitIdx={ui}
          entry={entry}
          isGroupSelected={isSelected}
          onSelectGroup={onSelect}
          onMoveUnit={onMove}
        />
      ))}
    </>
  );
}

// ── Modal création de groupe ───────────────────────────────────────────────
const COALITIONS = ['blue', 'red', 'neutrals'] as const;
const CATEGORIES = ['plane', 'helicopter', 'vehicle', 'ship', 'static'] as const;
const SKILLS_OPTS = ['Average', 'Good', 'High', 'Excellent', 'Random', 'Player', 'Client'] as const;
type CoalType = typeof COALITIONS[number];
type CatType = typeof CATEGORIES[number];

interface UnitDBEntry { type: string; name: string }

function AddGroupModal({ lat, lon, onClose }: { lat: number; lon: number; onClose: () => void }) {
  const { miz, addGroup } = useMissionStore();
  const [coal, setCoal] = useState<CoalType>('blue');
  const [cat, setCat] = useState<CatType>('plane');
  const [name, setName] = useState('Nouveau Groupe');
  const [unitType, setUnitType] = useState('');
  const [skill, setSkill] = useState<typeof SKILLS_OPTS[number]>('Good');
  const [count, setCount] = useState(1);
  const [unitsDB, setUnitsDB] = useState<Record<string, UnitDBEntry[]> | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/units_db.json`)
      .then(r => r.json()).then(d => setUnitsDB(d as Record<string, UnitDBEntry[]>)).catch(() => {});
  }, []);

  const unitList = useMemo(() => {
    const list = unitsDB?.[cat] ?? [];
    if (!search) return list.slice(0, 60);
    const q = search.toLowerCase();
    return list.filter(u => u.name?.toLowerCase().includes(q) || u.type?.toLowerCase().includes(q)).slice(0, 40);
  }, [unitsDB, cat, search]);

  useEffect(() => {
    const first = unitsDB?.[cat]?.[0];
    setUnitType(first?.type ?? '');
    setSearch('');
  }, [cat, unitsDB]);

  if (!miz) return null;
  const { x, y } = latLngToDcs(lat, lon);

  const handleAdd = () => {
    const id = Date.now();
    const units: DCSUnit[] = Array.from({ length: count }, (_, i) => ({
      unitId: id + i,
      name: `${name} #${i + 1}`,
      type: unitType || 'generic',
      x: x + i * 80,
      y: y + i * 80,
      alt: cat === 'plane' ? 5000 : cat === 'helicopter' ? 500 : 0,
      heading: 0,
      skill,
    }));

    const newGroup: DCSGroup = {
      groupId: id,
      name,
      x, y,
      hidden: false,
      units,
      route: {
        points: [{
          x, y,
          alt: units[0].alt,
          type: 'Turning Point',
          action: 'Turning Point',
          speed: cat === 'plane' ? 200 : cat === 'helicopter' ? 60 : 10,
          name: 'WP1',
        }],
      },
    };

    addGroup(coal, 0, cat, newGroup);
    onClose();
  };

  const COAL_BTN: Record<CoalType, string> = {
    blue: '🔵 BLEU', red: '🔴 ROUGE', neutrals: '⚪ NEUTRE',
  };
  const COAL_ACTIVE: Record<CoalType, string> = {
    blue: 'bg-blue-700 border-blue-500 text-white',
    red: 'bg-red-800 border-red-600 text-white',
    neutrals: 'bg-slate-700 border-slate-500 text-white',
  };

  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <h2 className="font-bold text-slate-100">Nouveau groupe</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none transition-colors">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Nom */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Nom</label>
            <input className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 text-sm" value={name} onChange={e => setName(e.target.value)} />
          </div>

          {/* Coalition */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Coalition</label>
            <div className="flex gap-2">
              {COALITIONS.map(c => (
                <button key={c} onClick={() => setCoal(c)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs transition-colors ${coal === c ? COAL_ACTIVE[c] : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                  {COAL_BTN[c]}
                </button>
              ))}
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Catégorie</label>
            <div className="flex gap-1 flex-wrap">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${cat === c ? 'bg-slate-700 border-slate-500 text-white' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                  {CAT_SYM[c]} {c}
                </button>
              ))}
            </div>
          </div>

          {/* Type d'unité */}
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Type d'unité</label>
            <input className="w-full bg-slate-800 text-slate-400 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 mb-1.5"
              placeholder="🔍 Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
            <select className="w-full bg-slate-800 text-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
              size={6} value={unitType} onChange={e => setUnitType(e.target.value)}>
              {unitList.map(u => <option key={u.type} value={u.type}>{u.name}</option>)}
            </select>
            <div className="text-[10px] text-slate-600 mt-1 font-mono">{unitType}</div>
          </div>

          {/* Skill + nombre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Niveau IA</label>
              <select className="w-full bg-slate-800 text-slate-100 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                value={skill} onChange={e => setSkill(e.target.value as typeof skill)}>
                {SKILLS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Nb unités</label>
              <input type="number" min={1} max={16} className="w-full bg-slate-800 text-slate-100 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                value={count} onChange={e => setCount(Math.max(1, Math.min(16, parseInt(e.target.value) || 1)))} />
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-[10px] text-slate-500 font-mono">
            📍 {lat.toFixed(5)}°N · {lon.toFixed(5)}°E
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-sm transition-colors">Annuler</button>
          <button onClick={handleAdd} disabled={!unitType}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded-xl text-sm font-medium transition-colors">
            ✚ Créer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Composant principal MapView ────────────────────────────────────────────
interface Airport { id: number; name: string; lat: number; lon: number; parkingCount: number }

export default function MapView() {
  const { miz, selectedEntity, selectEntity, updateGroup } = useMissionStore();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showAirports, setShowAirports] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/airports_caucasus.json`)
      .then(r => r.json()).then(d => setAirports(d as Airport[])).catch(() => setAirports([]));
  }, []);

  const groups = useMemo(() => miz ? extractAllGroups(miz) : [], [miz]);
  const zones = useMemo(() => miz ? extractTriggerZones(miz) : [], [miz]);

  const handleMove = useCallback((entry: GroupEntry, unitIdx: number, x: number, y: number) => {
    const { group, coalition, countryIdx, category, groupIdx } = entry;
    const units = [...(group.units ?? [])];
    units[unitIdx] = { ...units[unitIdx], x, y };
    // Mettre à jour aussi x/y du groupe si c'est le leader
    const patch = unitIdx === 0
      ? { ...group, x, y, units }
      : { ...group, units };
    updateGroup(coalition, countryIdx, category, groupIdx, patch);
  }, [updateGroup]);

  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    setPendingAdd({ lat: e.latlng.lat, lon: e.latlng.lng });
    setAddMode(false);
  }, []);

  const totalUnits = useMemo(() => groups.reduce((a, e) => a + (e.group.units?.length ?? 0), 0), [groups]);

  return (
    <div className="relative h-full w-full">
      {/* ── Overlay contrôles ── */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl p-2 shadow-xl space-y-1">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest px-1 mb-1">Affichage</div>
          {[
            { label: '✈ Aérodromes', val: showAirports, set: setShowAirports, count: airports.length },
            { label: '⬡ Zones trigger', val: showZones, set: setShowZones, count: zones.length },
            { label: '→ Routes', val: showRoutes, set: setShowRoutes, count: null },
          ].map(item => (
            <button key={item.label} onClick={() => item.set(v => !v)}
              className={`flex items-center gap-2 w-full text-xs px-2 py-1 rounded-lg transition-colors ${item.val ? 'bg-slate-700 text-slate-200' : 'text-slate-600 hover:text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.val ? 'bg-blue-400' : 'bg-slate-700'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count !== null && item.val && <span className="text-[10px] text-slate-500">{item.count}</span>}
            </button>
          ))}
        </div>
        {miz && (
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl px-3 py-2 text-xs shadow-xl">
            <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Mission</div>
            <div className="text-slate-300">{groups.length} groupes · {totalUnits} unités</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Glissez les unités pour les déplacer</div>
          </div>
        )}
      </div>

      {/* ── Bouton ajouter ── */}
      {miz && (
        <div className="absolute top-3 right-14 z-[500]">
          {!addMode ? (
            <button onClick={() => setAddMode(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-xl shadow-xl font-medium transition-all">
              <span className="text-base leading-none">+</span>
              <span>Ajouter un groupe</span>
            </button>
          ) : (
            <div className="bg-blue-950 border border-blue-600 text-blue-200 text-xs px-3 py-2 rounded-xl shadow-xl flex items-center gap-3">
              <span>🎯 Cliquez sur la carte pour placer</span>
              <button onClick={() => setAddMode(false)} className="text-blue-400 hover:text-white font-bold">✕</button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal création ── */}
      {pendingAdd && miz && (
        <AddGroupModal lat={pendingAdd.lat} lon={pendingAdd.lon} onClose={() => setPendingAdd(null)} />
      )}

      {/* ── Carte ── */}
      <MapContainer center={[42.5, 41.5]} zoom={7}
        style={{ height: '100%', width: '100%', background: '#0d1117' }}
        zoomControl={false}>

        {/* Satellite ESRI — seul fond, pas de choix inutile */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="© Esri"
          maxZoom={18}
        />

        <ClickHandler addMode={addMode} onMapClick={handleMapClick} />
        <FlyTo groups={groups} />

        {/* Aérodromes */}
        {showAirports && airports.map(ap => (
          <Marker key={ap.id} position={[ap.lat, ap.lon]} icon={makeAirportIcon()}>
            <Tooltip direction="top" offset={[0, -16]} opacity={0.97}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 'bold', color: '#94a3b8' }}>{ap.name}</div>
                <div style={{ color: '#64748b' }}>{ap.parkingCount} slots parking</div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* Zones trigger */}
        {showZones && zones.map((zone, i) => {
          if (!zone.x || !zone.y) return null;
          return (
            <Circle key={i} center={dcsToLatLng(zone.x, zone.y)} radius={zone.radius ?? 1000}
              pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4' }}>
              <Tooltip permanent direction="center" opacity={0.9}>
                <span style={{ fontSize: 10, color: '#fbbf24', fontFamily: 'monospace' }}>{zone.name}</span>
              </Tooltip>
            </Circle>
          );
        })}

        {/* Groupes — chaque unité affichée individuellement */}
        {groups.map((entry, gi) => {
          const isSelected =
            selectedEntity?.type === 'group' &&
            selectedEntity.coalition === entry.coalition &&
            selectedEntity.countryIdx === entry.countryIdx &&
            selectedEntity.category === entry.category &&
            selectedEntity.groupIdx === entry.groupIdx;

          return (
            <GroupMarkers
              key={`${entry.coalition}.${entry.category}.${entry.groupIdx}.${gi}`}
              entry={entry}
              isSelected={isSelected}
              onSelect={() => selectEntity({
                type: 'group',
                coalition: entry.coalition,
                countryIdx: entry.countryIdx,
                category: entry.category,
                groupIdx: entry.groupIdx,
              })}
              onMove={(ui, x, y) => handleMove(entry, ui, x, y)}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
