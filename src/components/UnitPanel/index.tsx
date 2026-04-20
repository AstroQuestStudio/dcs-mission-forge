import { useMissionStore, extractAllGroups } from '../../store/missionStore';
import { SKILLS } from '../../utils/dcsUnits';
import type { DCSGroup, DCSUnit, DCSWaypoint, Skill } from '../../types/dcs';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { dcsToLatLng, latLngToDcs } from '../../utils/dcsCoords';

interface UnitDBEntry { type: string; name: string; nato?: string | null }
type UnitsDB = Record<string, UnitDBEntry[]>;

const SKILL_COLOR: Record<string, string> = {
  Average: '#f87171', Good: '#fb923c', High: '#facc15',
  Excellent: '#4ade80', Random: '#94a3b8', Player: '#60a5fa', Client: '#c084fc',
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">{children}</label>;
}

const INP = "w-full bg-slate-800 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors";
const SEL = `${INP} cursor-pointer`;


export default function UnitPanel() {
  const { miz, selectedEntity, updateGroup, deleteGroup } = useMissionStore();
  const [activeUnit, setActiveUnit] = useState(0);
  const [unitsDB, setUnitsDB] = useState<UnitsDB | null>(null);
  const [unitSearch, setUnitSearch] = useState('');
  const [tab, setTab] = useState<'group' | 'unit' | 'waypoints'>('group');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/units_db.json`)
      .then(r => r.json())
      .then(d => setUnitsDB(d as UnitsDB))
      .catch(() => {});
  }, []);

  useEffect(() => { setActiveUnit(0); setTab('group'); }, [selectedEntity]);

  if (!miz || !selectedEntity || selectedEntity.type !== 'group') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl">✦</div>
        <div className="text-xs text-slate-500 leading-relaxed">
          Sélectionnez un groupe sur la<br />carte ou dans la liste
        </div>
        <div className="text-[10px] text-slate-700">
          Glissez les marqueurs pour<br />déplacer les unités
        </div>
      </div>
    );
  }

  const allGroups = extractAllGroups(miz);
  const entry = allGroups.find(e =>
    e.coalition === selectedEntity.coalition &&
    e.countryIdx === selectedEntity.countryIdx &&
    e.category === selectedEntity.category &&
    e.groupIdx === selectedEntity.groupIdx
  );
  if (!entry) return null;

  const { group, coalition, countryIdx, category, groupIdx } = entry;
  const unit = group.units[activeUnit] as DCSUnit | undefined;

  const save = useCallback((updates: Partial<DCSGroup>) =>
    updateGroup(coalition, countryIdx, category, groupIdx, { ...group, ...updates }),
    [updateGroup, coalition, countryIdx, category, groupIdx, group]
  );

  const saveUnit = useCallback((updates: Partial<DCSUnit>) => {
    if (!unit) return;
    const units = [...group.units];
    units[activeUnit] = { ...unit, ...updates };
    save({ units });
  }, [unit, group, activeUnit, save]);

  const saveWaypoint = (i: number, updates: Partial<DCSWaypoint>) => {
    const pts = [...(group.route?.points ?? [])];
    pts[i] = { ...pts[i], ...updates };
    save({ route: { ...group.route, points: pts } });
  };

  const addWaypoint = () => {
    const pts = [...(group.route?.points ?? [])];
    const last = pts[pts.length - 1];
    pts.push({
      x: (last?.x ?? group.x) + 5000,
      y: (last?.y ?? group.y) + 5000,
      alt: last?.alt ?? 3000,
      type: 'Turning Point',
      action: 'Turning Point',
      speed: last?.speed ?? 200,
      name: `WP${pts.length + 1}`,
    });
    save({ route: { ...group.route, points: pts } });
  };

  const removeWaypoint = (i: number) => {
    const pts = [...(group.route?.points ?? [])];
    pts.splice(i, 1);
    save({ route: { ...group.route, points: pts } });
  };

  const availableUnits = useMemo(() => {
    const list = unitsDB?.[category] ?? [];
    if (!unitSearch) return list.slice(0, 60);
    const q = unitSearch.toLowerCase();
    return list.filter(u =>
      u.name?.toLowerCase().includes(q) || u.type?.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [unitsDB, category, unitSearch]);

  const gx = group.x ?? group.units?.[0]?.x ?? 0;
  const gy = group.y ?? group.units?.[0]?.y ?? 0;
  const [lat, lon] = dcsToLatLng(gx, gy);

  const COAL_COLOR: Record<string, string> = {
    blue: 'bg-blue-900/60 text-blue-300 border-blue-800',
    red: 'bg-red-900/60 text-red-300 border-red-800',
    neutrals: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="flex flex-col h-full text-xs overflow-hidden">
      {/* ── Header ── */}
      <div className={`px-3 py-2.5 border-b border-slate-700/60 ${COAL_COLOR[coalition]} border-l-2`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-bold text-sm truncate text-slate-100">{group.name}</div>
            <div className="text-[10px] opacity-70 mt-0.5">
              {coalition.toUpperCase()} · {entry.countryName} · {category}
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm(`Supprimer "${group.name}" ?`)) deleteGroup(coalition, countryIdx, category, groupIdx);
            }}
            className="flex-shrink-0 text-slate-600 hover:text-red-400 transition-colors text-base mt-0.5"
            title="Supprimer ce groupe"
          >🗑</button>
        </div>
        <div className="text-[10px] text-slate-600 font-mono mt-1">
          {lat.toFixed(4)}°N · {lon.toFixed(4)}°E
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-700/60 bg-slate-900">
        {([
          { id: 'group',    label: 'Groupe' },
          { id: 'unit',     label: `Unité (${group.units.length})` },
          { id: 'waypoints',label: `Route (${group.route?.points?.length ?? 0})` },
        ] as { id: typeof tab; label: string }[]).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 text-[10px] uppercase tracking-wider transition-colors border-b-2 ${
              tab === t.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Contenu ── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Tab Groupe ── */}
        {tab === 'group' && (
          <div className="p-3 space-y-3">
            <div>
              <Label>Nom du groupe</Label>
              <input className={INP} value={group.name}
                onChange={e => save({ name: e.target.value })} />
            </div>

            <div>
              <Label>Options</Label>
              <div className="space-y-1.5">
                {[
                  { key: 'lateActivation', label: '⏱ Activation tardive', color: 'accent-amber-500' },
                  { key: 'uncontrolled',   label: '🚫 Incontrôlé',         color: 'accent-slate-400' },
                  { key: 'hidden',         label: '👁 Caché sur carte',     color: 'accent-purple-500' },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                    <input
                      type="checkbox"
                      className={opt.color}
                      checked={!!(group as unknown as Record<string, unknown>)[opt.key]}
                      onChange={e => save({ [opt.key]: e.target.checked } as Partial<DCSGroup>)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Position manuelle */}
            <div>
              <Label>Position (lat / lon)</Label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="number" step="0.0001"
                  className={INP}
                  value={lat.toFixed(4)}
                  onChange={e => {
                    const newLat = parseFloat(e.target.value);
                    if (isNaN(newLat)) return;
                    const { x, y } = latLngToDcs(newLat, lon);
                    save({ x, y, units: group.units.map(u => ({ ...u, x, y })) });
                  }}
                />
                <input
                  type="number" step="0.0001"
                  className={INP}
                  value={lon.toFixed(4)}
                  onChange={e => {
                    const newLon = parseFloat(e.target.value);
                    if (isNaN(newLon)) return;
                    const { x, y } = latLngToDcs(lat, newLon);
                    save({ x, y, units: group.units.map(u => ({ ...u, x, y })) });
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-600 mt-1">Ou glissez le marqueur sur la carte</div>
            </div>
          </div>
        )}

        {/* ── Tab Unité ── */}
        {tab === 'unit' && (
          <div>
            {/* Sélecteur unité */}
            <div className="flex gap-1 px-2 py-2 flex-wrap bg-slate-900/50 border-b border-slate-800">
              {group.units.map((_u, i) => (
                <button key={i} onClick={() => setActiveUnit(i)}
                  className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                    i === activeUnit ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}>
                  U{i + 1}
                </button>
              ))}
              <button
                onClick={() => {
                  const last = group.units[group.units.length - 1];
                  const newUnit: DCSUnit = {
                    ...last,
                    unitId: Date.now(),
                    name: `${group.name} U${group.units.length + 1}`,
                    x: (last?.x ?? group.x) + 30,
                    y: (last?.y ?? group.y) + 30,
                  };
                  save({ units: [...group.units, newUnit] });
                  setActiveUnit(group.units.length);
                }}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-green-500 hover:bg-slate-700 border border-slate-700"
                title="Ajouter une unité">
                + unité
              </button>
              {group.units.length > 1 && (
                <button
                  onClick={() => {
                    const units = [...group.units];
                    units.splice(activeUnit, 1);
                    save({ units });
                    setActiveUnit(Math.max(0, activeUnit - 1));
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-red-500 hover:bg-slate-700 border border-slate-700"
                  title="Supprimer cette unité">
                  − unité
                </button>
              )}
            </div>

            {unit && (
              <div className="p-3 space-y-3">
                <div>
                  <Label>Nom de l'unité</Label>
                  <input className={INP} value={unit.name}
                    onChange={e => saveUnit({ name: e.target.value })} />
                </div>

                <div>
                  <Label>Type d'unité</Label>
                  <input className={`${INP} mb-1.5`} placeholder="🔍 Rechercher…"
                    value={unitSearch} onChange={e => setUnitSearch(e.target.value)} />
                  <select className={SEL} value={unit.type} size={5}
                    onChange={e => { saveUnit({ type: e.target.value }); setUnitSearch(''); }}>
                    {availableUnits.map(u => (
                      <option key={u.type} value={u.type}>{u.name}</option>
                    ))}
                    {!availableUnits.find(u => u.type === unit.type) && (
                      <option value={unit.type}>★ {unit.type} (actuel)</option>
                    )}
                  </select>
                  <div className="text-[10px] text-slate-600 mt-1 font-mono">{unit.type}</div>
                </div>

                <div>
                  <Label>Niveau IA</Label>
                  <select className={SEL} value={unit.skill}
                    onChange={e => saveUnit({ skill: e.target.value as Skill })}>
                    {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ background: SKILL_COLOR[unit.skill] ?? '#888' }} />
                    <span style={{ color: SKILL_COLOR[unit.skill] ?? '#888' }} className="font-medium">{unit.skill}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Altitude (m)</Label>
                    <input type="number" className={INP}
                      value={Math.round(unit.alt ?? 0)}
                      onChange={e => saveUnit({ alt: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div>
                    <Label>Cap (°)</Label>
                    <input type="number" min={0} max={360} className={INP}
                      value={Math.round((unit.heading ?? 0) * 180 / Math.PI)}
                      onChange={e => saveUnit({ heading: (parseFloat(e.target.value) || 0) * Math.PI / 180 })} />
                  </div>
                </div>

                {unit.onboard_num !== undefined && (
                  <div>
                    <Label>Numéro de bord</Label>
                    <input className={INP} value={unit.onboard_num ?? ''}
                      onChange={e => saveUnit({ onboard_num: e.target.value })} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab Waypoints ── */}
        {tab === 'waypoints' && (
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-[10px] uppercase tracking-wider">
                {group.route?.points?.length ?? 0} waypoint(s)
              </span>
              <button
                onClick={addWaypoint}
                className="text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1 rounded-lg transition-colors"
              >
                + Ajouter WP
              </button>
            </div>

            <div className="space-y-2">
              {(group.route?.points ?? []).map((wp, i) => {
                const [wLat, wLon] = dcsToLatLng(wp.x, wp.y);
                return (
                  <div key={i} className="bg-slate-800/60 rounded-xl p-2.5 space-y-2 border border-slate-700/40">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">WP{i + 1}</span>
                      <div className="flex gap-1.5">
                        <select className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600"
                          value={wp.type ?? 'Turning Point'}
                          onChange={e => saveWaypoint(i, { type: e.target.value, action: e.target.value })}>
                          {['Turning Point', 'Landing', 'Takeoff', 'Land', 'Flyover Point'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                        {i > 0 && (
                          <button onClick={() => removeWaypoint(i)}
                            className="text-red-500 hover:text-red-300 text-sm">×</button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <div className="text-[9px] text-slate-600 mb-0.5">Lat</div>
                        <input type="number" step="0.0001" className="w-full bg-slate-700 text-slate-200 text-[10px] px-1.5 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                          value={wLat.toFixed(4)}
                          onChange={e => {
                            const { x, y } = latLngToDcs(parseFloat(e.target.value) || 0, wLon);
                            saveWaypoint(i, { x, y });
                          }} />
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-600 mb-0.5">Lon</div>
                        <input type="number" step="0.0001" className="w-full bg-slate-700 text-slate-200 text-[10px] px-1.5 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                          value={wLon.toFixed(4)}
                          onChange={e => {
                            const { x, y } = latLngToDcs(wLat, parseFloat(e.target.value) || 0);
                            saveWaypoint(i, { x, y });
                          }} />
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-600 mb-0.5">Alt (m)</div>
                        <input type="number" className="w-full bg-slate-700 text-slate-200 text-[10px] px-1.5 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                          value={Math.round(wp.alt ?? 0)}
                          onChange={e => saveWaypoint(i, { alt: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-600 mb-0.5">Vitesse (m/s)</div>
                        <input type="number" className="w-full bg-slate-700 text-slate-200 text-[10px] px-1.5 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                          value={Math.round(wp.speed ?? 0)}
                          onChange={e => saveWaypoint(i, { speed: parseFloat(e.target.value) || 0 })} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
