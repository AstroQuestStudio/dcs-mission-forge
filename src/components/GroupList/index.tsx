import { useMissionStore, extractAllGroups, type GroupEntry } from '../../store/missionStore';
import { useState, useMemo } from 'react';

const COAL_META: Record<string, { label: string; color: string; bg: string }> = {
  blue:     { label: 'Coalition BLEU',   color: 'text-blue-400',  bg: 'bg-blue-950/40'  },
  red:      { label: 'Coalition ROUGE',  color: 'text-red-400',   bg: 'bg-red-950/40'   },
  neutrals: { label: 'Neutres',          color: 'text-slate-400', bg: 'bg-slate-800/40' },
};

const CAT_ICONS: Record<string, string> = {
  plane: '✈', helicopter: '🚁', vehicle: '⬛', ship: '⚓', static: '▲',
};
const CAT_LABELS: Record<string, string> = {
  plane: 'Avion', helicopter: 'Hélico', vehicle: 'Véhicule', ship: 'Navire', static: 'Statique',
};

export default function GroupList() {
  const miz = useMissionStore(s => s.miz);
  const selectedEntity = useMissionStore(s => s.selectedEntity);
  const selectEntity = useMissionStore(s => s.selectEntity);
  const setActiveTab = useMissionStore(s => s.setActiveTab);
  const deleteGroup = useMissionStore(s => s.deleteGroup);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Tous les hooks AVANT tout return conditionnel
  const allGroups = useMemo(() => miz ? extractAllGroups(miz) : [], [miz]);

  const filtered = useMemo(() => allGroups.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      e.group.name.toLowerCase().includes(q) ||
      e.countryName.toLowerCase().includes(q) ||
      e.group.units?.[0]?.type?.toLowerCase().includes(q);
    const matchCat = filterCat === 'all' || e.category === filterCat;
    return matchSearch && matchCat;
  }), [allGroups, search, filterCat]);

  const byCoal = useMemo(() => {
    const g: Record<string, GroupEntry[]> = {};
    for (const e of filtered) {
      (g[e.coalition] ??= []).push(e);
    }
    return g;
  }, [filtered]);

  if (!miz) return (
    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-sm gap-2 p-8 text-center">
      <span className="text-3xl">✈</span>
      <span>Chargez une mission<br />pour voir les groupes</span>
    </div>
  );

  const toggle = (coal: string) => setCollapsed(c => ({ ...c, [coal]: !c[coal] }));
  const categories = ['all', 'plane', 'helicopter', 'vehicle', 'ship', 'static'];

  return (
    <div className="flex flex-col h-full">
      {/* Recherche */}
      <div className="p-2 space-y-1.5 border-b border-slate-700/60">
        <input
          className="w-full bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
          placeholder="🔍 Rechercher un groupe ou unité…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-[10px] px-1.5 py-0.5 rounded transition-colors ${
                filterCat === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {cat === 'all' ? 'Tous' : `${CAT_ICONS[cat]} ${CAT_LABELS[cat]}`}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {(['blue', 'red', 'neutrals'] as const).map(coal => {
          const entries = byCoal[coal];
          if (!entries?.length) return null;
          const meta = COAL_META[coal];
          const isCollapsed = collapsed[coal];

          return (
            <div key={coal}>
              <button
                onClick={() => toggle(coal)}
                className={`w-full flex items-center justify-between px-3 py-1.5 sticky top-0 z-10 ${meta.bg} border-b border-slate-700/40 transition-colors hover:brightness-110`}
              >
                <div className={`flex items-center gap-2 text-xs font-bold ${meta.color}`}>
                  <span>{isCollapsed ? '▶' : '▼'}</span>
                  <span>{meta.label}</span>
                </div>
                <span className="text-xs text-slate-500 bg-slate-800/60 rounded px-1.5 py-0.5">
                  {entries.length}
                </span>
              </button>

              {!isCollapsed && entries.map((entry, i) => {
                const isSelected =
                  selectedEntity?.type === 'group' &&
                  selectedEntity.coalition === coal &&
                  selectedEntity.countryIdx === entry.countryIdx &&
                  selectedEntity.category === entry.category &&
                  selectedEntity.groupIdx === entry.groupIdx;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      selectEntity({
                        type: 'group',
                        coalition: coal,
                        countryIdx: entry.countryIdx,
                        category: entry.category,
                        groupIdx: entry.groupIdx,
                      });
                      setActiveTab('map');
                    }}
                    className={`group flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-slate-800/60 transition-colors ${
                      isSelected
                        ? 'bg-slate-700/80 border-l-2 border-l-amber-400'
                        : 'hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="text-base w-5 text-center flex-shrink-0 opacity-70">
                      {CAT_ICONS[entry.category] ?? '•'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-slate-200 truncate font-medium">{entry.group.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {entry.countryName} · {entry.group.units.length} unité{entry.group.units.length > 1 ? 's' : ''}
                        {entry.group.units[0] && ` · ${entry.group.units[0].type}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {entry.group.lateActivation && (
                        <span title="Activation tardive" className="text-[10px] text-amber-500">⏱</span>
                      )}
                      <button
                        onClick={ev => {
                          ev.stopPropagation();
                          if (confirm(`Supprimer "${entry.group.name}" ?`)) {
                            deleteGroup(coal, entry.countryIdx, entry.category, entry.groupIdx);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 text-base leading-none transition-opacity ml-1"
                        title="Supprimer"
                      >×</button>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-slate-600 text-xs">
            {search ? `Aucun résultat pour "${search}"` : 'Aucun groupe'}
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="px-3 py-2 border-t border-slate-700/60 text-[10px] text-slate-500 flex justify-between">
        <span>{filtered.length} / {allGroups.length} groupe(s)</span>
        <span>{allGroups.reduce((a, e) => a + (e.group.units?.length ?? 0), 0)} unités total</span>
      </div>
    </div>
  );
}
