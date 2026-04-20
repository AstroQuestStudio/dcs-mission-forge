import { useMissionStore, extractAllGroups } from '../../store/missionStore';
import { DCS_UNITS, SKILLS, getUnitByType } from '../../utils/dcsUnits';
import type { DCSGroup, DCSUnit, Skill } from '../../types/dcs';
import { useState } from 'react';

export default function UnitPanel() {
  const { miz, selectedEntity, updateGroup } = useMissionStore();
  const [activeUnit, setActiveUnit] = useState(0);

  if (!miz || !selectedEntity || selectedEntity.type !== 'group') {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 text-sm p-4 text-center">
        Cliquez sur un groupe sur la carte ou dans la liste pour l'éditer
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

  const save = (updates: Partial<DCSGroup>) => {
    updateGroup(coalition, countryIdx, category, groupIdx, { ...group, ...updates });
  };

  const saveUnit = (updates: Partial<DCSUnit>) => {
    if (!unit) return;
    const units = [...group.units];
    units[activeUnit] = { ...unit, ...updates };
    save({ units });
  };

  const categoryUnits = DCS_UNITS.filter(u =>
    u.category === category &&
    (u.coalition === coalition || u.coalition === 'both')
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* En-tête groupe */}
      <div className="p-3 border-b border-slate-700 bg-slate-800">
        <div className="text-xs text-slate-400 mb-1">{coalition.toUpperCase()} · {entry.countryName} · {category}</div>
        <input
          className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500 font-mono"
          value={group.name}
          onChange={e => save({ name: e.target.value })}
        />
        <div className="flex gap-2 mt-2 text-xs">
          <label className="flex items-center gap-1 text-slate-400">
            <input type="checkbox" checked={!!group.lateActivation} onChange={e => save({ lateActivation: e.target.checked })} />
            Activation tardive
          </label>
          <label className="flex items-center gap-1 text-slate-400">
            <input type="checkbox" checked={!!group.uncontrolled} onChange={e => save({ uncontrolled: e.target.checked })} />
            Incontrôlé
          </label>
        </div>
      </div>

      {/* Onglets unités */}
      <div className="flex gap-1 p-2 border-b border-slate-700 flex-wrap">
        {group.units.map((_u, i) => (
          <button
            key={i}
            onClick={() => setActiveUnit(i)}
            className={`text-xs px-2 py-1 rounded ${
              i === activeUnit ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            U{i + 1}
          </button>
        ))}
      </div>

      {unit && (
        <div className="p-3 space-y-3">
          {/* Nom unité */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Nom de l'unité</label>
            <input
              className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              value={unit.name}
              onChange={e => saveUnit({ name: e.target.value })}
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Type d'unité</label>
            <select
              className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              value={unit.type}
              onChange={e => saveUnit({ type: e.target.value })}
            >
              {categoryUnits.map(ud => (
                <option key={ud.type} value={ud.type}>{ud.name}</option>
              ))}
              <option value={unit.type}>{unit.type} (actuel)</option>
            </select>
            <div className="text-xs text-slate-500 mt-1">
              {getUnitByType(unit.type)?.name ?? unit.type}
            </div>
          </div>

          {/* Skill */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Niveau IA</label>
            <select
              className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              value={unit.skill}
              onChange={e => saveUnit({ skill: e.target.value as Skill })}
            >
              {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Position */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Altitude (m)</label>
            <input
              type="number"
              className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              value={Math.round(unit.alt)}
              onChange={e => saveUnit({ alt: parseFloat(e.target.value) || 0 })}
            />
          </div>

          {/* Cap */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Cap (°)</label>
            <input
              type="number"
              min="0" max="360"
              className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
              value={Math.round((unit.heading * 180) / Math.PI)}
              onChange={e => saveUnit({ heading: (parseFloat(e.target.value) || 0) * Math.PI / 180 })}
            />
          </div>
        </div>
      )}

      {/* Waypoints */}
      {group.route?.points?.length > 0 && (
        <div className="p-3 border-t border-slate-700">
          <div className="text-xs text-slate-400 mb-2 font-bold">WAYPOINTS ({group.route.points.length})</div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {group.route.points.map((wp, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-slate-800 rounded px-2 py-1">
                <span className="text-slate-500 w-4">{i}</span>
                <span className="text-slate-300 flex-1">{wp.name || wp.type}</span>
                <span className="text-slate-500">{Math.round(wp.alt)}m</span>
                <span className="text-slate-500">{Math.round(wp.speed)}m/s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
