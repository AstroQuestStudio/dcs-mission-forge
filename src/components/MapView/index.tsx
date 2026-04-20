import { useEffect, useRef, useMemo, useState } from 'react';
import { useMissionStore, extractAllGroups, extractTriggerZones } from '../../store/missionStore';
import { latLngToDcs } from '../../utils/dcsCoords';
import { createMapEngine } from './mapEngine';
import type { MapEngine } from './mapEngine';
import type { DCSGroup, DCSUnit } from '../../types/dcs';
import { CAUCASUS_AIRFIELDS } from '../../utils/caucasusAirfields';
import UnitPicker from '../UnitPicker';

import type { ParkingSpot } from '../../utils/caucasusAirfields';
interface Airport { id: number; name: string; lat: number; lon: number; parkingCount: number; parkingSpots?: ParkingSpot[] }
const CAT_SYM: Record<string, string> = { plane: '✈', helicopter: '🚁', vehicle: '⬛', ship: '⚓', static: '▲' };

// ── Modal ajout groupe ─────────────────────────────────────────────────────
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
  const [unitName, setUnitName] = useState('');
  const [skill, setSkill] = useState<(typeof SKILLS)[number]>('Good');
  const [count, setCount] = useState(1);
  const [showPicker, setShowPicker] = useState(false);

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
            {/* Bouton d'affichage du type actuel */}
            <button
              className="w-full flex items-center justify-between bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-left hover:border-amber-500 focus:outline-none focus:border-amber-500 mb-1"
              onClick={() => setShowPicker(!showPicker)}
            >
              <span className="text-slate-200 truncate">{unitName || unitType || 'Choisir une unité...'}</span>
              <span className="text-slate-500 ml-2">{showPicker ? '▲' : '▼'}</span>
            </button>

            {/* UnitPicker déroulable */}
            {showPicker && (
              <UnitPicker
                category={cat}
                selected={unitType}
                onSelect={(u) => {
                  setUnitType(u.type);
                  setUnitName(u.name);
                  setShowPicker(false);
                }}
                height="280px"
              />
            )}
            {unitType && <div className="text-[10px] text-slate-600 mt-1 font-mono">{unitType}</div>}
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

// ── MapView ────────────────────────────────────────────────────────────────
export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<MapEngine | null>(null);

  // React 18 + Zustand 4 : hooks normaux, zéro problème #310
  const miz = useMissionStore(s => s.miz);
  const selectedEntity = useMissionStore(s => s.selectedEntity);

  // État local UI
  const [airports, setAirports] = useState<Airport[]>([]);
  const [showAirports, setShowAirports] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showTopo, setShowTopo] = useState(false);
  const [showThreatRings, setShowThreatRings] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [pendingAdd, setPendingAdd] = useState<{ lat: number; lon: number } | null>(null);
  const [_mapZoom, setMapZoom] = useState(7);

  // Données dérivées (calculées dans le cycle React)
  const groups = useMemo(() => miz ? extractAllGroups(miz) : [], [miz]);
  const zones = useMemo(() => miz ? extractTriggerZones(miz) : [], [miz]);
  const totalUnits = useMemo(() => groups.reduce((a, e) => a + (e.group.units?.length ?? 0), 0), [groups]);
  const sel = selectedEntity?.type === 'group' ? selectedEntity : null;

  // Aérodromes : fetch parking_caucasus.json et merge avec CAUCASUS_AIRFIELDS
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/parking_caucasus.json`)
      .then(r => r.json())
      .then((data: Record<string, Array<{id: number; x: number; z: number; y: number; heli: boolean; plane: boolean}>>) => {
        setAirports(CAUCASUS_AIRFIELDS.map(af => {
          const spots = data[String(af.id)];
          return {
            id: af.id,
            name: af.name,
            lat: af.lat,
            lon: af.lon,
            parkingCount: spots ? spots.length : af.parkingIds.length,
            parkingSpots: spots,
          };
        }));
      })
      .catch(() => {
        // fallback sans spots
        setAirports(CAUCASUS_AIRFIELDS.map(af => ({
          id: af.id,
          name: af.name,
          lat: af.lat,
          lon: af.lon,
          parkingCount: af.parkingIds.length,
          parkingSpots: undefined,
        })));
      });
  }, []);

  // Init moteur Leaflet (une seule fois)
  useEffect(() => {
    if (!containerRef.current) return;
    const emit = (name: string, detail: unknown) =>
      window.dispatchEvent(new CustomEvent(name, { detail }));
    const engine = createMapEngine(emit, import.meta.env.BASE_URL);
    engine.init(containerRef.current);
    engineRef.current = engine;
    return () => { engine.destroy(); engineRef.current = null; };
  }, []);

  // Écouter les events du moteur Leaflet
  useEffect(() => {
    const onSelect = (e: Event) => {
      const d = (e as CustomEvent).detail as { coalition: string; countryIdx: number; category: string; groupIdx: number };
      useMissionStore.getState().selectEntity({ type: 'group', ...d });
    };
    const onMove = (e: Event) => {
      const d = (e as CustomEvent).detail as { coalition: string; countryIdx: number; category: string; groupIdx: number; unitIdx: number; x: number; y: number };
      const s = useMissionStore.getState();
      if (!s.miz) return;
      const allGroups = extractAllGroups(s.miz);
      const entry = allGroups.find(g =>
        g.coalition === d.coalition && g.countryIdx === d.countryIdx &&
        g.category === d.category && g.groupIdx === d.groupIdx
      );
      if (!entry) return;
      const units = [...(entry.group.units ?? [])];
      units[d.unitIdx] = { ...units[d.unitIdx], x: d.x, y: d.y };
      const patch = d.unitIdx === 0
        ? { ...entry.group, x: d.x, y: d.y, units }
        : { ...entry.group, units };
      s.updateGroup(d.coalition, d.countryIdx, d.category, d.groupIdx, patch);
    };
    const onMapClick = () => { useMissionStore.getState().selectEntity(null); };

    const onZoom = (e: Event) => {
      setMapZoom((e as CustomEvent).detail.zoom);
    };
    window.addEventListener('dcs:select', onSelect);
    window.addEventListener('dcs:move', onMove);
    window.addEventListener('dcs:mapclick', onMapClick);
    window.addEventListener('dcs:zoom', onZoom);
    return () => {
      window.removeEventListener('dcs:select', onSelect);
      window.removeEventListener('dcs:move', onMove);
      window.removeEventListener('dcs:mapclick', onMapClick);
      window.removeEventListener('dcs:zoom', onZoom);
    };
  }, []);

  // Passer les données au moteur après chaque render
  useEffect(() => {
    engineRef.current?.render({ groups, selectedEntity: sel, airports, showAirports, showZones, showRoutes, showTopo, showThreatRings, zones, addMode });
  }, [groups, sel, airports, showAirports, showZones, showRoutes, showTopo, showThreatRings, zones, addMode, _mapZoom]);

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
            { label: '🏔 Relief (topo)', val: showTopo, set: setShowTopo },
          ].map(item => (
            <button key={item.label} onClick={() => item.set(v => !v)}
              className={`flex items-center gap-2 w-full text-xs px-2 py-1 rounded-lg transition-colors ${item.val ? 'bg-slate-700 text-slate-200' : 'text-slate-600 hover:text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.val ? 'bg-blue-400' : 'bg-slate-700'}`} />
              <span>{item.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowThreatRings(v => !v)}
            className={`px-2 py-0.5 rounded text-xs ${showThreatRings ? 'bg-red-900/80 text-red-300' : 'bg-slate-800/80 text-slate-400'}`}
            title="Cercles portée SAM"
          >
            🎯 SAM
          </button>
        </div>

        {groups.length > 0 && (
          <div className="bg-slate-900/90 backdrop-blur border border-slate-700/60 rounded-xl px-3 py-2 text-xs shadow-xl">
            <div className="text-[9px] text-slate-600 uppercase tracking-widest mb-1">Mission</div>
            <div className="text-slate-300">{groups.length} groupes · {totalUnits} unités</div>
            <div className="text-[10px] text-slate-600 mt-0.5">Glissez pour déplacer</div>
          </div>
        )}
      </div>

      {/* Bouton ajouter */}
      {miz && (
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

      {/* Overlay pour capturer le click en mode ajout */}
      {addMode && (
        <div
          className="absolute inset-0 z-[600] cursor-crosshair"
          onClick={e => {
            const engine = engineRef.current;
            if (!engine) return;
            const rect = containerRef.current!.getBoundingClientRect();
            const coords = engine.containerPointToLatLng(e.clientX - rect.left, e.clientY - rect.top);
            if (coords) { setPendingAdd({ lat: coords.lat, lon: coords.lon }); setAddMode(false); }
          }}
        />
      )}

      {pendingAdd && (
        <AddGroupModal lat={pendingAdd.lat} lon={pendingAdd.lon} onClose={() => setPendingAdd(null)} />
      )}
    </div>
  );
}
