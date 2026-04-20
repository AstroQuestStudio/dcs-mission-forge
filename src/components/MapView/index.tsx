import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import { divIcon, type Map as LMap, type LeafletMouseEvent } from 'leaflet';
import { useMissionStore, extractAllGroups, extractTriggerZones, type GroupEntry } from '../../store/missionStore';
import { dcsToLatLng, latLngToDcs } from '../../utils/dcsCoords';
import { getUnitByType } from '../../utils/dcsUnits';

interface Airport { id: number; name: string; lat: number; lon: number; parkingCount: number }

const COAL_COLOR: Record<string, string> = {
  blue: '#3b82f6', red: '#ef4444', neutrals: '#94a3b8',
};
const CAT_SYM: Record<string, string> = {
  plane: '✈', helicopter: '🚁', vehicle: '▣', ship: '⚓', static: '▲',
};

// ── Icônes ────────────────────────────────────────────────────────────────

function makeGroupIcon(coalition: string, category: string, selected: boolean, dragging = false) {
  const color = COAL_COLOR[coalition] ?? '#888';
  const sym = CAT_SYM[category] ?? '•';
  const size = selected ? 36 : 28;
  const bg = dragging ? '#1e40af' : selected ? '#0f172a' : '#1e293b';
  const border = selected ? `3px solid #fbbf24` : `2px solid ${color}`;
  const shadow = dragging ? '0 4px 20px rgba(59,130,246,.8)' : '0 2px 8px rgba(0,0,0,.6)';
  return divIcon({
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${bg};border:${border};
      display:flex;align-items:center;justify-content:center;
      font-size:${selected ? 16 : 13}px;
      box-shadow:${shadow};
      cursor:${dragging ? 'grabbing' : 'pointer'};
      transition:all .12s;
    ">${sym}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeAirportIcon() {
  return divIcon({
    html: `<div style="
      width:26px;height:26px;border-radius:5px;
      background:#0f172a;border:2px solid #475569;
      display:flex;align-items:center;justify-content:center;
      font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.5);
      cursor:default;
    ">✈</div>`,
    className: '',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

function makeAddIcon() {
  return divIcon({
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:#1d4ed8;border:2px dashed #93c5fd;
      display:flex;align-items:center;justify-content:center;
      font-size:18px;color:#93c5fd;
      box-shadow:0 2px 12px rgba(59,130,246,.6);
      animation:pulse 1s ease-in-out infinite;
    ">+</div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// ── Sous-composants ────────────────────────────────────────────────────────

function ClickHandler({ addMode, onMapClick }: {
  addMode: boolean;
  onMapClick: (e: LeafletMouseEvent) => void;
}) {
  const { selectEntity } = useMissionStore();
  useMapEvents({
    click: (e) => {
      if (addMode) { onMapClick(e); return; }
      selectEntity(null);
    },
  });
  return null;
}

function FlyToSelected({ groups }: { groups: GroupEntry[] }) {
  const { selectedEntity } = useMissionStore();
  const map = useMap();
  const prev = useRef('');

  useEffect(() => {
    if (!selectedEntity || selectedEntity.type !== 'group') return;
    const key = `${selectedEntity.coalition}-${selectedEntity.countryIdx}-${selectedEntity.category}-${selectedEntity.groupIdx}`;
    if (key === prev.current) return;
    prev.current = key;
    const entry = groups.find(e =>
      e.coalition === selectedEntity.coalition &&
      e.countryIdx === selectedEntity.countryIdx &&
      e.category === selectedEntity.category &&
      e.groupIdx === selectedEntity.groupIdx
    );
    if (!entry) return;
    const gx = entry.group.x ?? entry.group.units?.[0]?.x ?? 0;
    const gy = entry.group.y ?? entry.group.units?.[0]?.y ?? 0;
    map.flyTo(dcsToLatLng(gx, gy), Math.max(map.getZoom(), 9), { duration: 0.7 });
  }, [selectedEntity, groups, map]);

  return null;
}

function DraggableGroupMarker({ entry, onMoved }: {
  entry: GroupEntry;
  onMoved: (x: number, y: number) => void;
}) {
  const { selectEntity, selectedEntity } = useMissionStore();
  const { group, coalition, countryIdx, category, groupIdx } = entry;
  const [dragging, setDragging] = useState(false);

  const isSelected =
    selectedEntity?.type === 'group' &&
    selectedEntity.coalition === coalition &&
    selectedEntity.countryIdx === countryIdx &&
    selectedEntity.category === category &&
    selectedEntity.groupIdx === groupIdx;

  const gx = group.x ?? group.units?.[0]?.x ?? 0;
  const gy = group.y ?? group.units?.[0]?.y ?? 0;
  const pos = dcsToLatLng(gx, gy);

  const waypoints = (group.route?.points ?? [])
    .filter(wp => wp.x != null && wp.y != null)
    .map(wp => dcsToLatLng(wp.x, wp.y));

  return (
    <>
      {isSelected && waypoints.length > 1 && (
        <Polyline
          positions={waypoints}
          pathOptions={{
            color: COAL_COLOR[coalition] ?? '#888',
            weight: 2,
            dashArray: '8 5',
            opacity: 0.75,
          }}
        />
      )}
      <Marker
        position={pos}
        icon={makeGroupIcon(coalition, category, isSelected, dragging)}
        zIndexOffset={isSelected ? 200 : 0}
        draggable
        eventHandlers={{
          click: e => {
            e.originalEvent.stopPropagation();
            selectEntity({ type: 'group', coalition, countryIdx, category, groupIdx });
          },
          dragstart: () => setDragging(true),
          dragend: e => {
            setDragging(false);
            const ll = e.target.getLatLng();
            const { x, y } = latLngToDcs(ll.lat, ll.lng);
            onMoved(x, y);
          },
        }}
      >
        <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
          <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 'bold', color: COAL_COLOR[coalition] }}>{group.name}</div>
            <div style={{ color: '#94a3b8' }}>
              {group.units?.length ?? 0} unité(s) · {category}
            </div>
            {group.units?.[0] && (
              <div style={{ color: '#cbd5e1' }}>
                {getUnitByType(group.units[0].type)?.name ?? group.units[0].type}
              </div>
            )}
            {isSelected && (
              <div style={{ color: '#fbbf24', fontSize: 10 }}>✦ Sélectionné · Glissez pour déplacer</div>
            )}
          </div>
        </Tooltip>
      </Marker>
    </>
  );
}

// ── Composant principal ────────────────────────────────────────────────────

export default function MapView() {
  const { miz, updateGroup } = useMissionStore();
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showAirports, setShowAirports] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ lat: number; lon: number } | null>(null);
  const mapRef = useRef<LMap | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/airports_caucasus.json`)
      .then(r => r.json())
      .then(d => setAirports(d as Airport[]))
      .catch(() => setAirports([]));
  }, []);

  const groups = miz ? extractAllGroups(miz) : [];
  const zones  = miz ? extractTriggerZones(miz) : [];

  const handleGroupMoved = useCallback((entry: GroupEntry, x: number, y: number) => {
    const { group, coalition, countryIdx, category, groupIdx } = entry;
    const updatedUnits = (group.units ?? []).map(u => ({ ...u, x, y }));
    updateGroup(coalition, countryIdx, category, groupIdx, {
      ...group,
      x,
      y,
      units: updatedUnits,
    });
  }, [updateGroup]);

  const handleMapClick = useCallback((e: LeafletMouseEvent) => {
    setPendingAdd({ lat: e.latlng.lat, lon: e.latlng.lng });
    setAddMode(false);
  }, []);

  const cancelAdd = useCallback(() => {
    setPendingAdd(null);
    setAddMode(false);
  }, []);

  return (
    <div className="relative h-full w-full">
      {/* ── Contrôles overlay ── */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5">
        {/* Filtres */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl p-2 flex flex-col gap-1 shadow-xl">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest px-1 mb-0.5">Affichage</div>
          {[
            { key: 'airports', label: 'Aérodromes', value: showAirports, set: setShowAirports, count: airports.length },
            { key: 'zones',    label: 'Zones trigger', value: showZones,    set: setShowZones,    count: zones.length },
            { key: 'waypoints',label: 'Waypoints',     value: showWaypoints, set: setShowWaypoints, count: null },
          ].map(item => (
            <button
              key={item.key}
              onClick={() => item.set(v => !v)}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg transition-colors ${
                item.value
                  ? 'bg-slate-700 text-slate-200'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${item.value ? 'bg-blue-400' : 'bg-slate-700'}`} />
              {item.label}
              {item.count !== null && item.value && (
                <span className="ml-auto text-[10px] text-slate-500">{item.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Stats groupes */}
        {miz && (
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl px-3 py-2 text-xs shadow-xl">
            <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Mission</div>
            <div className="text-slate-400">
              {groups.length} groupes · {groups.reduce((a, e) => a + (e.group.units?.length ?? 0), 0)} unités
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">Glissez les marqueurs pour déplacer</div>
          </div>
        )}
      </div>

      {/* ── Mode ajout ── */}
      {miz && (
        <div className="absolute top-3 right-14 z-[500]">
          {!addMode ? (
            <button
              onClick={() => setAddMode(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-xl shadow-xl transition-all font-medium"
            >
              <span className="text-base">+</span>
              <span>Ajouter un groupe</span>
            </button>
          ) : (
            <div className="bg-blue-950 border border-blue-600 text-blue-200 text-xs px-3 py-2 rounded-xl shadow-xl flex items-center gap-3">
              <span>🎯 Cliquez sur la carte pour placer le groupe</span>
              <button onClick={cancelAdd} className="text-blue-400 hover:text-white font-bold">✕</button>
            </div>
          )}
        </div>
      )}

      {/* ── Modal ajout groupe ── */}
      {pendingAdd && miz && (
        <AddGroupModal
          lat={pendingAdd.lat}
          lon={pendingAdd.lon}
          onClose={cancelAdd}
        />
      )}

      <MapContainer
        center={[42.5, 41.5]}
        zoom={7}
        style={{ height: '100%', width: '100%', background: '#0d1117' }}
        ref={mapRef}
        zoomControl={false}
      >
        {/* Fond satellite ESRI — le meilleur pour le Caucase */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="© Esri"
          maxZoom={18}
        />

        <ClickHandler addMode={addMode} onMapClick={handleMapClick} />
        <FlyToSelected groups={groups} />

        {/* Aérodromes */}
        {showAirports && airports.map(ap => (
          <Marker key={ap.id} position={[ap.lat, ap.lon]} icon={makeAirportIcon()}>
            <Tooltip direction="top" offset={[0, -15]} opacity={0.97}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5 }}>
                <div style={{ fontWeight: 'bold', color: '#94a3b8' }}>{ap.name}</div>
                <div style={{ color: '#64748b' }}>{ap.parkingCount} slots · Caucase</div>
              </div>
            </Tooltip>
          </Marker>
        ))}

        {/* Zones trigger */}
        {showZones && zones.map((zone, i) => {
          if (!zone.x || !zone.y) return null;
          return (
            <Circle
              key={i}
              center={dcsToLatLng(zone.x, zone.y)}
              radius={zone.radius ?? 1000}
              pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4' }}
            >
              <Tooltip permanent direction="center" opacity={0.9}>
                <span style={{ fontSize: 10, color: '#fbbf24', fontFamily: 'monospace' }}>{zone.name}</span>
              </Tooltip>
            </Circle>
          );
        })}

        {/* Waypoints isolés */}
        {showWaypoints && groups.map((entry, gi) => {
          const pts = (entry.group.route?.points ?? []).filter(wp => wp.x != null && wp.y != null);
          if (pts.length < 2) return null;
          const { selectedEntity } = useMissionStore.getState();
          const isSel =
            selectedEntity?.type === 'group' &&
            selectedEntity.coalition === entry.coalition &&
            selectedEntity.groupIdx === entry.groupIdx;
          if (isSel) return null; // déjà dessiné par DraggableGroupMarker
          return (
            <Polyline
              key={gi}
              positions={pts.map(wp => dcsToLatLng(wp.x, wp.y))}
              pathOptions={{
                color: COAL_COLOR[entry.coalition] ?? '#888',
                weight: 1,
                opacity: 0.35,
                dashArray: '4 6',
              }}
            />
          );
        })}

        {/* Marqueur position ajout */}
        {addMode && (
          <Marker position={[42.5, 41.5]} icon={makeAddIcon()} />
        )}

        {/* Groupes (draggable) */}
        {groups.map((entry, i) => (
          <DraggableGroupMarker
            key={`${entry.coalition}-${entry.category}-${entry.groupIdx}-${i}`}
            entry={entry}
            onMoved={(x, y) => handleGroupMoved(entry, x, y)}
          />
        ))}
      </MapContainer>
    </div>
  );
}

// ── Modal ajout groupe ─────────────────────────────────────────────────────

import { useMemo } from 'react';
import type { DCSGroup, DCSUnit } from '../../types/dcs';

const COALITIONS = ['blue', 'red', 'neutrals'] as const;
const CATEGORIES = ['plane', 'helicopter', 'vehicle', 'ship', 'static'] as const;
const SKILLS_LIST = ['Average', 'Good', 'High', 'Excellent', 'Random', 'Player', 'Client'] as const;

function AddGroupModal({ lat, lon, onClose }: { lat: number; lon: number; onClose: () => void }) {
  const { miz, addGroup } = useMissionStore();
  const [coal, setCoal] = useState<typeof COALITIONS[number]>('blue');
  const [cat, setCat]   = useState<typeof CATEGORIES[number]>('plane');
  const [name, setName] = useState('Nouveau Groupe');
  const [unitType, setUnitType] = useState('');
  const [skill, setSkill] = useState<typeof SKILLS_LIST[number]>('Good');
  const [count, setCount] = useState(1);
  const [unitsDB, setUnitsDB] = useState<Record<string, { type: string; name: string }[]> | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/units_db.json`)
      .then(r => r.json())
      .then(d => setUnitsDB(d as Record<string, { type: string; name: string }[]>))
      .catch(() => {});
  }, []);

  const unitList = useMemo(() => {
    const list = unitsDB?.[cat] ?? [];
    if (!search) return list.slice(0, 50);
    const q = search.toLowerCase();
    return list.filter(u => u.name?.toLowerCase().includes(q) || u.type?.toLowerCase().includes(q)).slice(0, 40);
  }, [unitsDB, cat, search]);

  useEffect(() => {
    const first = unitsDB?.[cat]?.[0];
    setUnitType(first?.type ?? '');
    setSearch('');
  }, [cat, unitsDB]);

  if (!miz) return null;

  // Trouver le 1er pays de la coalition
  const coalData = (miz.mission.coalition as Record<string, { country: unknown[] }>)[coal];
  const countries = Array.isArray(coalData?.country) ? coalData.country : Object.values(coalData?.country ?? {});
  if (!countries.length) return null;

  const { x, y } = latLngToDcs(lat, lon);

  const handleAdd = () => {
    const newGroupId = Date.now();
    const units: DCSUnit[] = Array.from({ length: count }, (_, i) => ({
      unitId: newGroupId + i,
      name: `${name} U${i + 1}`,
      type: unitType || 'generic',
      x: x + i * 50,
      y: y + i * 50,
      alt: cat === 'plane' ? 5000 : cat === 'helicopter' ? 500 : 0,
      heading: 0,
      skill,
    }));

    const newGroup: DCSGroup = {
      groupId: newGroupId,
      name,
      x,
      y,
      hidden: false,
      units,
      route: { points: [{ x, y, alt: units[0].alt, type: 'Turning Point', action: 'Turning Point', speed: cat === 'plane' ? 200 : cat === 'helicopter' ? 60 : 10, name: 'WP1' }] },
      task: cat === 'plane' ? 'CAP' : cat === 'vehicle' ? 'Ground Nothing' : undefined,
    };

    addGroup(coal, 0, cat, newGroup);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-96 max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <h2 className="font-bold text-slate-100 text-sm">Ajouter un groupe</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Nom */}
          <div>
            <label className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Nom du groupe</label>
            <input
              className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Coalition + catégorie */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Coalition</label>
              <div className="flex flex-col gap-1">
                {COALITIONS.map(c => (
                  <button key={c} onClick={() => setCoal(c)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                      coal === c
                        ? c === 'blue' ? 'bg-blue-700 border-blue-500 text-white'
                          : c === 'red' ? 'bg-red-800 border-red-600 text-white'
                          : 'bg-slate-700 border-slate-500 text-slate-200'
                        : 'border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}>
                    {c === 'blue' ? '🔵 BLEU' : c === 'red' ? '🔴 ROUGE' : '⚪ NEUTRE'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Catégorie</label>
              <div className="flex flex-col gap-1">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                      cat === c ? 'bg-slate-700 border-slate-500 text-white' : 'border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}>
                    {CAT_SYM[c]} {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Type d'unité */}
          <div>
            <label className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Type d'unité</label>
            <input
              className="w-full bg-slate-800 text-slate-300 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 mb-1"
              placeholder="🔍 Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="w-full bg-slate-800 text-slate-100 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
              size={5}
              value={unitType}
              onChange={e => setUnitType(e.target.value)}
            >
              {unitList.map(u => (
                <option key={u.type} value={u.type}>{u.name}</option>
              ))}
            </select>
          </div>

          {/* Skill + nombre */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Niveau IA</label>
              <select
                className="w-full bg-slate-800 text-slate-100 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                value={skill}
                onChange={e => setSkill(e.target.value as typeof skill)}
              >
                {SKILLS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-slate-500 block mb-1 uppercase tracking-wider text-[10px]">Nombre d'unités</label>
              <input
                type="number" min={1} max={16}
                className="w-full bg-slate-800 text-slate-100 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                value={count}
                onChange={e => setCount(Math.max(1, Math.min(16, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>

          {/* Position */}
          <div className="bg-slate-800/60 rounded-lg px-3 py-2 text-[10px] text-slate-500 font-mono">
            📍 {lat.toFixed(5)}°N {lon.toFixed(5)}°E
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-sm transition-colors">
            Annuler
          </button>
          <button
            onClick={handleAdd}
            disabled={!unitType}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded-xl text-sm font-medium transition-colors"
          >
            ✚ Créer le groupe
          </button>
        </div>
      </div>
    </div>
  );
}
