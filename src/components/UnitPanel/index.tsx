import { useMissionStore, extractAllGroups } from '../../store/missionStore';
import { SKILLS } from '../../utils/dcsUnits';
import { getUnitInfo } from '../../utils/unitDatabase';
import type { DCSGroup, DCSUnit, DCSWaypoint, Skill } from '../../types/dcs';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { dcsToLatLng, latLngToDcs } from '../../utils/dcsCoords';
import UnitPicker from '../UnitPicker';

const SKILL_COLOR: Record<string, string> = {
  Average: '#f87171', Good: '#fb923c', High: '#facc15',
  Excellent: '#4ade80', Random: '#94a3b8', Player: '#60a5fa', Client: '#c084fc',
};

const COAL_COLOR: Record<string, string> = {
  blue: 'bg-blue-900/60 text-blue-300 border-blue-700',
  red: 'bg-red-900/60 text-red-300 border-red-700',
  neutrals: 'bg-slate-800 text-slate-300 border-slate-700',
};

const COAL_ACCENT: Record<string, string> = {
  blue: '#3b82f6', red: '#ef4444', neutrals: '#94a3b8',
};

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">{children}</label>;
}

const INP = "w-full bg-slate-800 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors";
const SEL = `${INP} cursor-pointer`;
const LBL = "text-[10px] text-slate-500 uppercase tracking-wider block mb-1";

function UnitCard({ unitType, coalition }: { unitType: string; coalition: string }) {
  const info = useMemo(() => getUnitInfo(unitType), [unitType]);
  const [imgError, setImgError] = useState(false);
  const accent = COAL_ACCENT[coalition] ?? '#94a3b8';

  if (!info && !unitType) return null;

  const displayName = info?.displayName ?? unitType;
  const hasImage = info?.imageUrl && !imgError;

  return (
    <div className="mx-3 mt-3 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-800/50">
      {/* Image */}
      {hasImage && (
        <div className="relative w-full h-32 bg-slate-900 overflow-hidden">
          <img
            src={info!.imageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.9) contrast(1.05)' }}
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-3 right-3">
            <div className="text-sm font-bold text-white drop-shadow-lg">{displayName}</div>
            {info?.role && (
              <div className="text-[10px] text-slate-300 drop-shadow">{info.role}</div>
            )}
          </div>
          <div
            className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: accent + '33', color: accent, border: `1px solid ${accent}55` }}
          >
            {info?.origin ?? ''}
          </div>
        </div>
      )}

      {/* No image fallback */}
      {!hasImage && (
        <div className="px-3 pt-3 pb-1">
          <div className="text-sm font-bold text-slate-100">{displayName}</div>
          {info?.role && <div className="text-[10px] text-slate-400 mt-0.5">{info.role}</div>}
        </div>
      )}

      {/* Specs */}
      {info && (
        <div className="px-3 pb-3 pt-2 grid grid-cols-3 gap-2">
          {info.maxSpeed && (
            <div className="text-center">
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Vmax</div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">{info.maxSpeed}</div>
            </div>
          )}
          {info.maxAlt && (
            <div className="text-center">
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Plafond</div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">{info.maxAlt}</div>
            </div>
          )}
          {info.crew !== undefined && (
            <div className="text-center">
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Équipage</div>
              <div className="text-[11px] text-slate-300 font-mono mt-0.5">{info.crew}</div>
            </div>
          )}
        </div>
      )}

      {info?.description && (
        <div className="px-3 pb-3 text-[10px] text-slate-500 leading-relaxed border-t border-slate-700/40 pt-2">
          {info.description}
        </div>
      )}
    </div>
  );
}

function LoadoutPanel({ unitType, coalition }: { unitType: string; coalition: string }) {
  const info = useMemo(() => getUnitInfo(unitType), [unitType]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const accent = COAL_ACCENT[coalition] ?? '#94a3b8';

  if (!info?.loadouts?.length) return null;

  return (
    <div className="mx-3 mt-3">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Loadouts de référence</div>
      <div className="space-y-1.5">
        {info.loadouts.map((lo, i) => (
          <div key={i} className="rounded-lg border border-slate-700/60 bg-slate-800/40 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-3 py-2 text-left"
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div>
                <div className="text-xs text-slate-200">{lo.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: accent }}>{lo.role}</div>
              </div>
              <div className="text-slate-600 text-xs">{expanded === i ? '▲' : '▼'}</div>
            </button>
            {expanded === i && (
              <div className="border-t border-slate-700/40 px-3 pb-2.5 pt-2 space-y-1">
                {lo.pylons.map((p, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-600 font-mono w-12">S{p.station}</span>
                    <span className="text-[10px] text-slate-300 flex-1">{p.weapon}</span>
                    <span className="text-[9px] text-slate-500">×{p.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UnitPanel() {
  const miz = useMissionStore(s => s.miz);
  const selectedEntity = useMissionStore(s => s.selectedEntity);
  const updateGroup = useMissionStore(s => s.updateGroup);
  const deleteGroup = useMissionStore(s => s.deleteGroup);
  const [activeUnit, setActiveUnit] = useState(0);
  const [tab, setTab] = useState<'group' | 'unit' | 'waypoints' | 'loadout'>('group');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { setActiveUnit(0); setTab('group'); }, [selectedEntity]);

  const sel = selectedEntity?.type === 'group' ? selectedEntity : null;
  const allGroups = useMemo(() => miz ? extractAllGroups(miz) : [], [miz]);

  const entry = useMemo(() => sel
    ? allGroups.find(e =>
        e.coalition === sel.coalition &&
        e.countryIdx === sel.countryIdx &&
        e.category === sel.category &&
        e.groupIdx === sel.groupIdx
      )
    : undefined,
  [allGroups, sel]);

  const group = entry?.group;
  const coalition = entry?.coalition ?? 'blue';
  const countryIdx = entry?.countryIdx ?? 0;
  const category = entry?.category ?? 'plane';
  const groupIdx = entry?.groupIdx ?? 0;
  const unit = group?.units[activeUnit] as DCSUnit | undefined;

  const save = useCallback((updates: Partial<DCSGroup>) => {
    if (!group) return;
    updateGroup(coalition, countryIdx, category, groupIdx, { ...group, ...updates });
  }, [updateGroup, coalition, countryIdx, category, groupIdx, group]);

  const saveUnit = useCallback((updates: Partial<DCSUnit>) => {
    if (!unit || !group) return;
    const units = [...group.units];
    units[activeUnit] = { ...unit, ...updates };
    save({ units });
  }, [unit, group, activeUnit, save]);

  // Early returns APRÈS tous les hooks
  if (!miz || !sel || !entry || !group) {
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

  const gx = group.x ?? group.units?.[0]?.x ?? 0;
  const gy = group.y ?? group.units?.[0]?.y ?? 0;
  const [lat, lon] = dcsToLatLng(gx, gy);

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
          ...(category === 'plane' || category === 'helicopter' ? [{ id: 'loadout' as const, label: 'Armement' }] : []),
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
          <div className="pb-4">
            <div className="p-3 space-y-3">
              <div>
                <Label>Nom du groupe</Label>
                <input className={INP} value={group.name}
                  onChange={e => save({ name: e.target.value })} />
              </div>

              {/* Fréquence radio */}
              <div>
                <label className={LBL}>Fréquence (MHz)</label>
                <input
                  type="number" step="0.025" min="100" max="400"
                  className={INP}
                  value={group.frequency ? (group.frequency / 1e6).toFixed(3) : ''}
                  placeholder="ex: 251.000"
                  onChange={e => save({ frequency: Math.round(parseFloat(e.target.value) * 1e6) })}
                />
              </div>
              {/* Modulation */}
              {group.frequency !== undefined && (
                <div>
                  <label className={LBL}>Modulation</label>
                  <select className={SEL} value={group.modulation ?? 0} onChange={e => save({ modulation: parseInt(e.target.value) })}>
                    <option value={0}>AM</option>
                    <option value={1}>FM</option>
                  </select>
                </div>
              )}

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

            {/* ── Fiche unité leader ── */}
            {group.units[0]?.type && (
              <>
                <UnitCard unitType={group.units[0].type} coalition={coalition} />
                <LoadoutPanel unitType={group.units[0].type} coalition={coalition} />
              </>
            )}
          </div>
        )}

        {/* ── Tab Unité ── */}
        {tab === 'unit' && (
          <div>
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
              <div className="pb-4">
                {/* Fiche de l'unité sélectionnée */}
                <UnitCard unitType={unit.type ?? ''} coalition={coalition} />

                <div className="p-3 space-y-3 mt-1">
                  <div>
                    <Label>Nom de l'unité</Label>
                    <input className={INP} value={unit.name}
                      onChange={e => saveUnit({ name: e.target.value })} />
                  </div>

                  <div>
                    <label className={LBL}>Type d'unité</label>
                    {/* Bouton d'affichage du type actuel */}
                    <button
                      className="w-full flex items-center justify-between bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-left hover:border-amber-500 focus:outline-none focus:border-amber-500"
                      onClick={() => setShowPicker(!showPicker)}
                    >
                      <span className="text-slate-200 truncate">{unit.type || 'Choisir une unité...'}</span>
                      <span className="text-slate-500 ml-2">{showPicker ? '▲' : '▼'}</span>
                    </button>

                    {/* UnitPicker déroulable */}
                    {showPicker && (
                      <div className="mt-1">
                        <UnitPicker
                          category={category as 'plane' | 'helicopter' | 'vehicle' | 'ship' | 'static'}
                          selected={unit.type}
                          onSelect={(u) => {
                            saveUnit({ type: u.type });
                            setShowPicker(false);
                          }}
                          height="280px"
                        />
                      </div>
                    )}
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

                <LoadoutPanel unitType={unit.type ?? ''} coalition={coalition} />
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

        {/* ── Tab Armement ── */}
        {tab === 'loadout' && unit && (
          <LoadoutEditorPanel
            unit={unit}
            unitType={unit.type ?? ''}
            coalition={coalition}
            onSave={saveUnit}
          />
        )}
      </div>
    </div>
  );
}

// ── Éditeur de loadout ────────────────────────────────────────────────────

function LoadoutEditorPanel({
  unit, unitType, coalition, onSave,
}: {
  unit: import('../../types/dcs').DCSUnit;
  unitType: string;
  coalition: string;
  onSave: (u: Partial<import('../../types/dcs').DCSUnit>) => void;
}) {
  const info = useMemo(() => getUnitInfo(unitType), [unitType]);
  const accent = COAL_ACCENT[coalition] ?? '#94a3b8';

  const pylons = useMemo(() => {
    const raw = unit.payload?.pylons;
    if (!raw || typeof raw !== 'object') return {};
    return raw as Record<string, { CLSID?: string; num?: number }>;
  }, [unit.payload]);

  const applyPreset = (loadout: { pylons: { station: number; weapon: string; count: number }[] }) => {
    const newPylons: Record<string, { CLSID: string; num: number }> = {};
    for (const p of loadout.pylons) {
      newPylons[String(p.station)] = { CLSID: p.weapon, num: p.count };
    }
    onSave({ payload: { ...unit.payload, pylons: newPylons } });
  };

  const clearPylon = (station: string) => {
    const newPylons = { ...pylons };
    delete newPylons[station];
    onSave({ payload: { ...unit.payload, pylons: newPylons } });
  };

  const pylonStations = Object.keys(pylons).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="pb-4">
      {/* Pylones actuels */}
      <div className="px-3 pt-3">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Chargement actuel</div>
        {pylonStations.length === 0 ? (
          <div className="text-xs text-slate-600 italic py-2">Aucun armement configuré</div>
        ) : (
          <div className="space-y-1">
            {pylonStations.map(s => {
              const p = pylons[s];
              return (
                <div key={s} className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-1.5">
                  <span className="text-[9px] text-slate-600 font-mono w-10">S{s}</span>
                  <span className="text-xs text-slate-300 flex-1 truncate">{p.CLSID ?? '—'}</span>
                  {p.num !== undefined && p.num > 0 && (
                    <span className="text-[10px] text-slate-500">×{p.num}</span>
                  )}
                  <button
                    onClick={() => clearPylon(s)}
                    className="text-slate-600 hover:text-red-400 text-sm flex-shrink-0"
                    title="Vider ce pylon"
                  >×</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Carburant / compteurs */}
      {unit.payload && (
        <div className="px-3 pt-3 grid grid-cols-3 gap-2">
          {(['fuel', 'flare', 'chaff'] as const).map(k => {
            const val = unit.payload?.[k];
            if (val === undefined) return null;
            return (
              <div key={k}>
                <label className="text-[9px] text-slate-600 uppercase tracking-wider block mb-0.5">{k}</label>
                <input
                  type="number" min={0}
                  className="w-full bg-slate-800 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-blue-500"
                  value={Number(val)}
                  onChange={e => onSave({ payload: { ...unit.payload, [k]: parseFloat(e.target.value) || 0 } })}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Presets */}
      {info?.loadouts && info.loadouts.length > 0 && (
        <div className="px-3 pt-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-bold">Appliquer un preset</div>
          <div className="space-y-1.5">
            {info.loadouts.map((lo, i) => (
              <button
                key={i}
                onClick={() => applyPreset(lo)}
                className="w-full flex items-center gap-2.5 rounded-lg border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-left hover:border-slate-600 hover:bg-slate-800 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-200 font-medium">{lo.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: accent }}>{lo.role} · {lo.pylons.length} stations</div>
                </div>
                <span className="text-slate-600 group-hover:text-slate-400 text-xs">Appliquer →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!info?.loadouts?.length && (
        <div className="px-3 pt-3 text-[10px] text-slate-600 italic">
          Pas de loadouts de référence pour {unitType}.<br/>
          Modifiez les pylones directement dans DCS Mission Editor après import.
        </div>
      )}
    </div>
  );
}
