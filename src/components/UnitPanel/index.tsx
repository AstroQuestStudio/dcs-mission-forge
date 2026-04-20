import { useMissionStore, extractAllGroups } from '../../store/missionStore';
import { SKILLS, getUnitByType } from '../../utils/dcsUnits';
import type { DCSGroup, DCSUnit, Skill } from '../../types/dcs';
import { useState, useEffect, useMemo } from 'react';
import { dcsToLatLng } from '../../utils/dcsCoords';

interface UnitDBEntry { type: string; name: string; nato?: string | null; country?: string | null }
interface UnitsDB { plane: UnitDBEntry[]; helicopter: UnitDBEntry[]; vehicle: UnitDBEntry[]; ship: UnitDBEntry[] }

const SKILL_COLORS: Record<string, string> = {
  Average: 'text-red-400',
  Good: 'text-orange-400',
  High: 'text-yellow-400',
  Excellent: 'text-green-400',
  Random: 'text-slate-400',
  Player: 'text-blue-400',
  Client: 'text-purple-400',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-slate-800 text-slate-100 text-xs px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 transition-colors";
const selectCls = `${inputCls} cursor-pointer`;

export default function UnitPanel() {
  const { miz, selectedEntity, updateGroup } = useMissionStore();
  const [activeUnit, setActiveUnit] = useState(0);
  const [unitsDB, setUnitsDB] = useState<UnitsDB | null>(null);
  const [unitSearch, setUnitSearch] = useState('');

  // Charger la DB d'unités enrichie
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/units_db.json`)
      .then(r => r.json())
      .then(d => setUnitsDB(d as UnitsDB))
      .catch(() => setUnitsDB(null));
  }, []);

  // Reset unité active quand sélection change
  useEffect(() => { setActiveUnit(0); }, [selectedEntity]);

  if (!miz || !selectedEntity || selectedEntity.type !== 'group') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-600 text-xs p-6 text-center gap-3">
        <span className="text-4xl">🖱</span>
        <span>Cliquez sur un groupe<br />sur la carte ou dans<br />la liste pour l'éditer</span>
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

  const save = (updates: Partial<DCSGroup>) =>
    updateGroup(coalition, countryIdx, category, groupIdx, { ...group, ...updates });

  const saveUnit = (updates: Partial<DCSUnit>) => {
    if (!unit) return;
    const units = [...group.units];
    units[activeUnit] = { ...unit, ...updates };
    save({ units });
  };

  // Liste d'unités filtrée depuis la DB enrichie
  const availableUnits = useMemo(() => {
    const catKey = category as keyof UnitsDB;
    const list: UnitDBEntry[] = unitsDB?.[catKey] ?? [];
    if (!unitSearch) return list.slice(0, 60);
    const q = unitSearch.toLowerCase();
    return list.filter(u =>
      u.name?.toLowerCase().includes(q) ||
      u.type?.toLowerCase().includes(q) ||
      u.nato?.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [unitsDB, category, unitSearch]);

  // Position GPS groupe
  const gx = group.x ?? group.units?.[0]?.x ?? 0;
  const gy = group.y ?? group.units?.[0]?.y ?? 0;
  const [lat, lon] = dcsToLatLng(gx, gy);
  const unitInfo = getUnitByType(unit?.type ?? '');

  const headingDeg = unit ? Math.round((unit.heading ?? 0) * 180 / Math.PI) : 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto text-xs">

      {/* ── En-tête groupe ── */}
      <div className="p-3 border-b border-slate-700/60 bg-slate-800/50">
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
            coalition === 'blue' ? 'bg-blue-900 text-blue-300' :
            coalition === 'red'  ? 'bg-red-900 text-red-300' :
            'bg-slate-700 text-slate-300'
          }`}>{coalition.toUpperCase()}</span>
          <span className="text-slate-500">{entry.countryName}</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500 capitalize">{category}</span>
        </div>

        <Field label="Nom du groupe">
          <input
            className={inputCls}
            value={group.name}
            onChange={e => save({ name: e.target.value })}
          />
        </Field>

        <div className="flex gap-3 mt-2">
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
            <input type="checkbox" className="accent-amber-500"
              checked={!!group.lateActivation}
              onChange={e => save({ lateActivation: e.target.checked })} />
            Activation tardive
          </label>
          <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
            <input type="checkbox" className="accent-slate-500"
              checked={!!group.uncontrolled}
              onChange={e => save({ uncontrolled: e.target.checked })} />
            Incontrôlé
          </label>
        </div>

        {/* Position */}
        <div className="mt-2 flex gap-1 text-[10px] text-slate-500 font-mono">
          <span>📍</span>
          <span>{lat.toFixed(4)}°N {lon.toFixed(4)}°E</span>
        </div>
      </div>

      {/* ── Onglets unités ── */}
      <div className="flex gap-1 px-2 py-1.5 border-b border-slate-700/60 flex-wrap bg-slate-900">
        {group.units.map((_u, i) => (
          <button
            key={i}
            onClick={() => setActiveUnit(i)}
            className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
              i === activeUnit
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            U{i + 1}
          </button>
        ))}
      </div>

      {/* ── Éditeur unité ── */}
      {unit && (
        <div className="p-3 space-y-3">
          <Field label="Nom de l'unité">
            <input
              className={inputCls}
              value={unit.name}
              onChange={e => saveUnit({ name: e.target.value })}
            />
          </Field>

          {/* Type d'unité avec recherche */}
          <Field label="Type d'unité">
            <input
              className={`${inputCls} mb-1`}
              placeholder="Rechercher…"
              value={unitSearch}
              onChange={e => setUnitSearch(e.target.value)}
            />
            <select
              className={selectCls}
              value={unit.type}
              onChange={e => { saveUnit({ type: e.target.value }); setUnitSearch(''); }}
              size={4}
            >
              {availableUnits.map(u => (
                <option key={u.type} value={u.type} title={u.nato ?? ''}>
                  {u.name}{u.nato ? ` (${u.nato})` : ''}
                </option>
              ))}
              {!availableUnits.find(u => u.type === unit.type) && (
                <option value={unit.type}>{unit.type} ★ actuel</option>
              )}
            </select>
            <div className="mt-1 text-slate-500 text-[10px]">
              {unitInfo?.name ?? unit.type}
            </div>
          </Field>

          {/* Skill */}
          <Field label="Niveau IA">
            <select
              className={selectCls}
              value={unit.skill}
              onChange={e => saveUnit({ skill: e.target.value as Skill })}
            >
              {SKILLS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className={`mt-1 text-[10px] font-medium ${SKILL_COLORS[unit.skill] ?? 'text-slate-400'}`}>
              ● {unit.skill}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Altitude (m)">
              <input type="number" className={inputCls}
                value={Math.round(unit.alt ?? 0)}
                onChange={e => saveUnit({ alt: parseFloat(e.target.value) || 0 })} />
            </Field>
            <Field label="Cap (°)">
              <input type="number" min={0} max={360} className={inputCls}
                value={headingDeg}
                onChange={e => saveUnit({ heading: (parseFloat(e.target.value) || 0) * Math.PI / 180 })} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Waypoints ── */}
      {(group.route?.points?.length ?? 0) > 0 && (
        <div className="px-3 pb-3 border-t border-slate-700/60">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider py-2 font-bold">
            Waypoints ({group.route.points.length})
          </div>
          <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
            {group.route.points.map((wp, i) => {
              const wpPos = dcsToLatLng(wp.x, wp.y);
              return (
                <div key={i} className="flex items-center gap-2 bg-slate-800/60 rounded-lg px-2 py-1.5 text-[10px]">
                  <span className="text-slate-600 w-4 text-center font-mono">{i}</span>
                  <span className="text-slate-300 flex-1 truncate">{wp.name || wp.type || 'WP'}</span>
                  <span className="text-slate-500 font-mono">{Math.round(wp.alt ?? 0)}m</span>
                  <span className="text-slate-600 font-mono">{Math.round((wp.speed ?? 0) * 3.6)}km/h</span>
                </div>
              );
              void wpPos;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
