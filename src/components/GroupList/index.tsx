import { useMissionStore, extractAllGroups, type GroupEntry } from '../../store/missionStore';
import { getUnitByType } from '../../utils/dcsUnits';
import { useState } from 'react';

const COALITION_LABELS: Record<string, { label: string; color: string }> = {
  blue: { label: 'BLEU', color: 'text-blue-400' },
  red: { label: 'ROUGE', color: 'text-red-400' },
  neutrals: { label: 'NEUTRE', color: 'text-gray-400' },
};

const CAT_ICONS: Record<string, string> = {
  plane: '✈', helicopter: '🚁', vehicle: '⬛', ship: '⚓', static: '▲',
};

export default function GroupList() {
  const { miz, selectedEntity, selectEntity, deleteGroup } = useMissionStore();
  const [search, setSearch] = useState('');

  if (!miz) return (
    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
      Chargez une mission pour afficher les groupes
    </div>
  );

  const allGroups = extractAllGroups(miz);
  const filtered = allGroups.filter(e =>
    e.group.name.toLowerCase().includes(search.toLowerCase()) ||
    e.coalition.includes(search.toLowerCase()) ||
    e.category.includes(search.toLowerCase())
  );

  const grouped: Record<string, GroupEntry[]> = {};
  for (const e of filtered) {
    if (!grouped[e.coalition]) grouped[e.coalition] = [];
    grouped[e.coalition].push(e);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-700">
        <input
          className="w-full bg-slate-800 text-slate-200 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
          placeholder="Rechercher un groupe…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {(['blue', 'red', 'neutrals'] as const).map(coal => {
          const entries = grouped[coal];
          if (!entries?.length) return null;
          const cl = COALITION_LABELS[coal];
          return (
            <div key={coal}>
              <div className={`px-3 py-1 text-xs font-bold ${cl.color} bg-slate-800 sticky top-0`}>
                {cl.label} ({entries.length})
              </div>
              {entries.map((entry, i) => {
                const isSelected =
                  selectedEntity?.type === 'group' &&
                  selectedEntity.coalition === coal &&
                  selectedEntity.countryIdx === entry.countryIdx &&
                  selectedEntity.category === entry.category &&
                  selectedEntity.groupIdx === entry.groupIdx;

                return (
                  <div
                    key={i}
                    onClick={() => selectEntity({
                      type: 'group',
                      coalition: coal,
                      countryIdx: entry.countryIdx,
                      category: entry.category,
                      groupIdx: entry.groupIdx,
                    })}
                    className={`px-3 py-2 cursor-pointer border-b border-slate-800 hover:bg-slate-700 ${
                      isSelected ? 'bg-slate-700 border-l-2 border-l-amber-400' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{CAT_ICONS[entry.category] ?? '•'}</span>
                        <div className="min-w-0">
                          <div className="text-sm text-slate-200 truncate">{entry.group.name}</div>
                          <div className="text-xs text-slate-500">
                            {entry.countryName} · {entry.group.units.length} unité(s)
                          </div>
                          {entry.group.units[0] && (
                            <div className="text-xs text-slate-400 truncate">
                              {getUnitByType(entry.group.units[0].type)?.name ?? entry.group.units[0].type}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={ev => {
                          ev.stopPropagation();
                          if (confirm(`Supprimer "${entry.group.name}" ?`)) {
                            deleteGroup(coal, entry.countryIdx, entry.category, entry.groupIdx);
                          }
                        }}
                        className="text-slate-600 hover:text-red-400 text-lg ml-2 flex-shrink-0"
                        title="Supprimer le groupe"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-4 text-slate-500 text-sm text-center">Aucun groupe trouvé</div>
        )}
      </div>
      <div className="p-2 border-t border-slate-700 text-xs text-slate-500 text-center">
        {allGroups.length} groupe(s) total
      </div>
    </div>
  );
}
