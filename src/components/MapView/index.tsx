/**
 * MapView — Leaflet natif uniquement, ZERO react-leaflet, ZERO hooks Zustand dans le rendu.
 * Toutes les interactions Leaflet (click, drag) passent par useMissionStore.getState()
 * pour éviter React error #310 (hooks appelés hors cycle React).
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import { flushSync } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMissionStore, extractAllGroups, extractTriggerZones } from '../../store/missionStore';
import { dcsToLatLng, latLngToDcs } from '../../utils/dcsCoords';
import type { DCSGroup, DCSUnit } from '../../types/dcs';

// Wrapper sécurisé pour appeler le store depuis des events non-React (Leaflet)
function callStore(fn: () => void) {
  flushSync(fn);
}

// ── Palette ────────────────────────────────────────────────────────────────
const COAL_COLOR: Record<string, string> = {
  blue: '#3b82f6', red: '#ef4444', neutrals: '#94a3b8',
};
const CAT_SYM: Record<string, string> = {
  plane: '✈', helicopter: '🚁', vehicle: '⬛', ship: '⚓', static: '▲',
};
const SKILL_ALPHA: Record<string, number> = {
  Excellent: 1.0, High: 0.85, Good: 0.7, Average: 0.55, Random: 0.5, Player: 1.0, Client: 1.0,
};

function makeIcon(coalition: string, category: string, selected: boolean, isLeader: boolean, skill?: string) {
  const color = COAL_COLOR[coalition] ?? '#888';
  const sym = CAT_SYM[category] ?? '•';
  const alpha = SKILL_ALPHA[skill ?? 'Good'] ?? 0.7;
  const size = selected ? (isLeader ? 38 : 30) : (isLeader ? 30 : 22);
  const borderW = selected ? 3 : isLeader ? 2 : 1.5;
  const bc = selected ? '#fbbf24' : color;
  const bg = selected ? '#0f172a' : `rgba(15,23,42,${0.7 + alpha * 0.3})`;
  const shadow = selected ? '0 0 12px 3px rgba(251,191,36,.6)' : isLeader ? '0 2px 8px rgba(0,0,0,.6)' : '0 1px 4px rgba(0,0,0,.5)';
  const fs = isLeader ? Math.round(size * 0.48) : Math.round(size * 0.52);
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;border-radius:${isLeader ? '50%' : '4px'};background:${bg};border:${borderW}px solid ${bc};display:flex;align-items:center;justify-content:center;font-size:${fs}px;box-shadow:${shadow};cursor:pointer;opacity:${alpha}">${sym}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function makeAirportIcon() {
  return L.divIcon({
    html: `<div style="width:28px;height:28px;border-radius:6px;background:#0f172a;border:2px solid #334155;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,.5)">✈</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Airport { id: number; name: string; lat: number; lon: number; parkingCount: number }
interface UnitDBEntry { type: string; name: string }

// ── Modal ajout groupe (composant React normal, pas de problème de hooks) ──
const COALITIONS = ['blue', 'red', 'neutrals'] as const;
const CATEGORIES = ['plane', 'helicopter', 'vehicle', 'ship', 'static'] as const;
const SKILLS = ['Average', 'Good', 'High', 'Excellent', 'Random', 'Player', 'Client'] as const;
type CoalType = (typeof COALITIONS)[number];
type CatType = (typeof CATEGORIES)[number];

function AddGroupModal({ lat, lon, onClose }: { lat: number; lon: number; onClose: () => void }) {
  const [coal, setCoal] = useState<CoalType>('blue');
  const [cat, setCat] = useState<CatType>('plane');
  const [name, setName] = useState('Nouveau Groupe');
  const [unitType, setUnitType] = useState('');
  const [skill, setSkill] = useState<(typeof SKILLS)[number]>('Good');
  const [count, setCount] = useState(1);
  const [db, setDb] = useState<Record<string, UnitDBEntry[]> | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/units_db.json`)
      .then(r => r.json()).then(d => setDb(d as Record<string, UnitDBEntry[]>)).catch(() => {});
  }, []);

  const unitList = useMemo(() => {
    const list = db?.[cat] ?? [];
    if (!search) return list.slice(0, 60);
    const q = search.toLowerCase();
    return list.filter(u => u.name?.toLowerCase().includes(q) || u.type?.toLowerCase().includes(q)).slice(0, 40);
  }, [db, cat, search]);

  useEffect(() => { setUnitType(db?.[cat]?.[0]?.type ?? ''); setSearch(''); }, [cat, db]);

  const handleAdd = () => {
    const { x, y } = latLngToDcs(lat, lon);
    const id = Date.now();
    const units: DCSUnit[] = Array.from({ length: count }, (_, i) => ({
      unitId: id + i, name: `${name} #${i + 1}`, type: unitType || 'generic',
      x: x + i * 80, y: y + i * 80,
      alt: cat === 'plane' ? 5000 : cat === 'helicopter' ? 500 : 0,
      heading: 0, skill,
    }));
    const grp: DCSGroup = {
      groupId: id, name, x, y, hidden: false, units,
      route: { points: [{ x, y, alt: units[0].alt, type: 'Turning Point', action: 'Turning Point', speed: cat === 'plane' ? 200 : 10, name: 'WP1' }] },
    };
    useMissionStore.getState().addGroup(coal, 0, cat, grp);
    onClose();
  };

  const COAL_ACTIVE: Record<CoalType, string> = {
    blue: 'bg-blue-700 border-blue-500 text-white',
    red: 'bg-red-800 border-red-600 text-white',
    neutrals: 'bg-slate-700 border-slate-500 text-white',
  };

  return (
    <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60">
          <h2 className="font-bold text-slate-100">Nouveau groupe</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">✕</button>
        </div>
        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Nom</label>
            <input className="w-full bg-slate-800 text-slate-100 px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 text-sm"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Coalition</label>
            <div className="flex gap-2">
              {COALITIONS.map(c => (
                <button key={c} onClick={() => setCoal(c)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs transition-colors ${coal === c ? COAL_ACTIVE[c] : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}>
                  {c === 'blue' ? '🔵 BLEU' : c === 'red' ? '🔴 ROUGE' : '⚪ NEUTRE'}
                </button>
              ))}
            </div>
          </div>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Niveau IA</label>
              <select className="w-full bg-slate-800 text-slate-100 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                value={skill} onChange={e => setSkill(e.target.value as typeof skill)}>
                {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">Nb unités</label>
              <input type="number" min={1} max={16}
                className="w-full bg-slate-800 text-slate-100 px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                value={count} onChange={e => setCount(Math.max(1, Math.min(16, parseInt(e.target.value) || 1)))} />
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg px-3 py-2 text-[10px] text-slate-500 font-mono">
            📍 {lat.toFixed(5)}°N · {lon.toFixed(5)}°E
          </div>
        </div>
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={onClose} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-xl text-sm">Annuler</button>
          <button onClick={handleAdd} disabled={!unitType}
            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white py-2 rounded-xl text-sm font-medium">
            ✚ Créer
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MapView principal ──────────────────────────────────────────────────────
export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const addModeRef = useRef(false);

  // État local React uniquement — pas de hooks Zustand ici
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showAirports, setShowAirports] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ lat: number; lon: number } | null>(null);

  // Stats affichées dans l'overlay — lues via getState() pour ne pas créer de subscription
  const [statGroups, setStatGroups] = useState(0);
  const [statUnits, setStatUnits] = useState(0);

  // Garder addMode en ref pour les handlers Leaflet
  useEffect(() => { addModeRef.current = addMode; }, [addMode]);

  // ── Init carte une fois ──────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = L.map(containerRef.current, {
      center: [42.5, 41.5],
      zoom: 7,
      zoomControl: false,
      preferCanvas: true,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Click carte — flushSync pour rester dans le cycle React
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (addModeRef.current) {
        flushSync(() => {
          setPendingAdd({ lat: e.latlng.lat, lon: e.latlng.lng });
          setAddMode(false);
        });
      } else {
        callStore(() => useMissionStore.getState().selectEntity(null));
      }
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Charger aérodromes ───────────────────────────────────────────────
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/airports_caucasus.json`)
      .then(r => r.json()).then(d => setAirports(d as Airport[])).catch(() => {});
  }, []);

  // ── Subscribe au store Zustand de façon impérative (pas de hook) ─────
  // Redessiner la carte quand le store change
  useEffect(() => {
    // Dessiner immédiatement
    redrawAll();

    // Subscribe aux changements
    const unsub = useMissionStore.subscribe(() => {
      redrawAll();
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAirports, showZones, showRoutes, airports]);

  // ── Layers refs (gérés impérativement, jamais via React state) ────────
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const zonesLayerRef = useRef<L.LayerGroup | null>(null);
  const airportsLayerRef = useRef<L.LayerGroup | null>(null);

  function ensureLayers(map: L.Map) {
    if (!markersLayerRef.current) { markersLayerRef.current = L.layerGroup().addTo(map); }
    if (!routesLayerRef.current) { routesLayerRef.current = L.layerGroup().addTo(map); }
    if (!zonesLayerRef.current) { zonesLayerRef.current = L.layerGroup().addTo(map); }
    if (!airportsLayerRef.current) { airportsLayerRef.current = L.layerGroup().addTo(map); }
  }

  function redrawAll() {
    const map = mapRef.current;
    if (!map) return;
    ensureLayers(map);

    const state = useMissionStore.getState();
    const { miz, selectedEntity } = state;

    if (!miz) {
      markersLayerRef.current!.clearLayers();
      routesLayerRef.current!.clearLayers();
      zonesLayerRef.current!.clearLayers();
      airportsLayerRef.current!.clearLayers();
      flushSync(() => { setStatGroups(0); setStatUnits(0); });
      return;
    }

    const groups = extractAllGroups(miz);
    const zones = extractTriggerZones(miz);

    let totalUnits = 0;
    groups.forEach(e => { totalUnits += e.group.units?.length ?? 0; });
    // flushSync pour que les setState locaux soient dans le cycle React
    flushSync(() => {
      setStatGroups(groups.length);
      setStatUnits(totalUnits);
    });

    // Redessiner marqueurs + routes
    markersLayerRef.current!.clearLayers();
    routesLayerRef.current!.clearLayers();

    groups.forEach(entry => {
      const isSelected =
        selectedEntity?.type === 'group' &&
        selectedEntity.coalition === entry.coalition &&
        selectedEntity.countryIdx === entry.countryIdx &&
        selectedEntity.category === entry.category &&
        selectedEntity.groupIdx === entry.groupIdx;

      // Route
      if (showRoutes) {
        const wps = (entry.group.route?.points ?? [])
          .filter(wp => wp.x != null && wp.y != null)
          .map(wp => dcsToLatLng(wp.x, wp.y) as L.LatLngTuple);
        if (wps.length > 1) {
          L.polyline(wps, {
            color: COAL_COLOR[entry.coalition] ?? '#888',
            weight: isSelected ? 2.5 : 1,
            opacity: isSelected ? 0.85 : 0.25,
            dashArray: isSelected ? '8 4' : '3 6',
          }).addTo(routesLayerRef.current!);
        }
      }

      // Marqueurs — un par unité
      (entry.group.units ?? []).forEach((unit, ui) => {
        const isLeader = ui === 0;
        const [lat, lon] = dcsToLatLng(unit.x ?? 0, unit.y ?? 0);
        const icon = makeIcon(entry.coalition, entry.category, isSelected && isLeader, isLeader, unit.skill);
        const marker = L.marker([lat, lon], {
          icon,
          draggable: true,
          zIndexOffset: isSelected ? (isLeader ? 300 : 200) : (isLeader ? 10 : 0),
        });

        const color = COAL_COLOR[entry.coalition] ?? '#888';
        marker.bindTooltip(`<div style="font-family:monospace;font-size:11px;line-height:1.5">
          ${isLeader ? `<div style="font-weight:bold;color:${color}">${entry.group.name}</div>` : ''}
          <div style="color:#cbd5e1">${unit.name ?? ''}</div>
          <div style="color:#64748b">${unit.type ?? ''} · ${unit.skill ?? '—'} · ${Math.round(unit.alt ?? 0)}m</div>
          ${isSelected && isLeader ? '<div style="color:#fbbf24;font-size:10px">✦ Sélectionné · glisser = déplacer</div>' : ''}
        </div>`, { direction: 'top', offset: [0, -14], opacity: 0.97 });

        // Handlers via flushSync pour rester dans le cycle React
        marker.on('click', (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e);
          callStore(() => useMissionStore.getState().selectEntity({
            type: 'group',
            coalition: entry.coalition,
            countryIdx: entry.countryIdx,
            category: entry.category,
            groupIdx: entry.groupIdx,
          }));
        });

        marker.on('dragend', () => {
          const ll = marker.getLatLng();
          const { x, y } = latLngToDcs(ll.lat, ll.lng);
          const { group, coalition, countryIdx, category, groupIdx } = entry;
          const units = [...(group.units ?? [])];
          units[ui] = { ...units[ui], x, y };
          const patch = ui === 0 ? { ...group, x, y, units } : { ...group, units };
          callStore(() => useMissionStore.getState().updateGroup(coalition, countryIdx, category, groupIdx, patch));
        });

        marker.addTo(markersLayerRef.current!);
      });
    });

    // Zones trigger
    zonesLayerRef.current!.clearLayers();
    if (showZones) {
      zones.forEach(zone => {
        if (!zone.x || !zone.y) return;
        const [lat, lon] = dcsToLatLng(zone.x, zone.y);
        const c = L.circle([lat, lon], {
          radius: zone.radius ?? 1000,
          color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4',
        });
        c.bindTooltip(`<span style="font-size:10px;color:#fbbf24;font-family:monospace">${zone.name}</span>`,
          { permanent: true, direction: 'center', opacity: 0.9 });
        c.addTo(zonesLayerRef.current!);
      });
    }

    // Aérodromes
    airportsLayerRef.current!.clearLayers();
    if (showAirports) {
      airports.forEach(ap => {
        const m = L.marker([ap.lat, ap.lon], { icon: makeAirportIcon() });
        m.bindTooltip(`<div style="font-family:monospace;font-size:11px;line-height:1.5">
          <div style="font-weight:bold;color:#94a3b8">${ap.name}</div>
          <div style="color:#64748b">${ap.parkingCount} slots parking</div>
        </div>`, { direction: 'top', offset: [0, -16], opacity: 0.97 });
        m.addTo(airportsLayerRef.current!);
      });
    }

    // FlyTo si sélection vient de changer
    if (selectedEntity?.type === 'group') {
      const entry = groups.find(g =>
        g.coalition === selectedEntity.coalition &&
        g.countryIdx === selectedEntity.countryIdx &&
        g.category === selectedEntity.category &&
        g.groupIdx === selectedEntity.groupIdx
      );
      if (entry) {
        const x = entry.group.x ?? entry.group.units?.[0]?.x ?? 0;
        const y = entry.group.y ?? entry.group.units?.[0]?.y ?? 0;
        const [lat, lon] = dcsToLatLng(x, y);
        const currentCenter = map.getCenter();
        const dist = Math.abs(currentCenter.lat - lat) + Math.abs(currentCenter.lng - lon);
        if (dist > 0.5) {
          map.flyTo([lat, lon], Math.max(map.getZoom(), 9), { duration: 0.8 });
        }
      }
    }
  }

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" style={{ background: '#0d1117' }} />

      {/* Overlay contrôles */}
      <div className="absolute top-3 left-3 z-[500] flex flex-col gap-1.5 pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl p-2 shadow-xl space-y-1">
          <div className="text-[9px] text-slate-600 uppercase tracking-widest px-1 mb-1">Affichage</div>
          {[
            { label: '✈ Aérodromes', val: showAirports, set: setShowAirports },
            { label: '⬡ Zones trigger', val: showZones, set: setShowZones },
            { label: '→ Routes', val: showRoutes, set: setShowRoutes },
          ].map(item => (
            <button key={item.label} onClick={() => item.set(v => !v)}
              className={`flex items-center gap-2 w-full text-xs px-2 py-1 rounded-lg transition-colors ${item.val ? 'bg-slate-700 text-slate-200' : 'text-slate-600 hover:text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.val ? 'bg-blue-400' : 'bg-slate-700'}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {statGroups > 0 && (
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl px-3 py-2 text-xs shadow-xl">
            <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Mission</div>
            <div className="text-slate-300">{statGroups} groupes · {statUnits} unités</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Glissez pour déplacer</div>
          </div>
        )}
      </div>

      {/* Bouton ajouter */}
      {useMissionStore.getState().miz && (
        <div className="absolute top-3 right-14 z-[500]">
          {!addMode ? (
            <button onClick={() => setAddMode(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-xl shadow-xl font-medium">
              <span className="text-base leading-none">+</span>
              <span>Ajouter un groupe</span>
            </button>
          ) : (
            <div className="bg-blue-950 border border-blue-600 text-blue-200 text-xs px-3 py-2 rounded-xl shadow-xl flex items-center gap-3">
              <span>🎯 Cliquez sur la carte</span>
              <button onClick={() => setAddMode(false)} className="text-blue-400 hover:text-white font-bold">✕</button>
            </div>
          )}
        </div>
      )}

      {/* Modal création */}
      {pendingAdd && (
        <AddGroupModal lat={pendingAdd.lat} lon={pendingAdd.lon} onClose={() => setPendingAdd(null)} />
      )}
    </div>
  );
}
