import { useMissionStore } from '../../store/missionStore';

export default function MissionSettings() {
  const { miz, updateMissionMeta } = useMissionStore();

  if (!miz) return (
    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
      Chargez une mission
    </div>
  );

  const m = miz.mission;

  return (
    <div className="p-4 overflow-y-auto h-full space-y-4">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Informations Mission</h3>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Nom de mission (Sortie)</label>
        <input
          className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
          value={m.sortie ?? ''}
          onChange={e => updateMissionMeta({ sortie: e.target.value })}
          placeholder="Nom de la sortie"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Théâtre</label>
        <div className="text-sm text-slate-300 bg-slate-800 px-2 py-1 rounded border border-slate-700">
          {miz.theatre}
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Date</label>
        <div className="flex gap-2">
          <input type="number" min={1} max={31} value={m.date?.Day ?? 1}
            className="w-16 bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
            placeholder="J" readOnly />
          <input type="number" min={1} max={12} value={m.date?.Month ?? 1}
            className="w-16 bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
            placeholder="M" readOnly />
          <input type="number" value={m.date?.Year ?? 2024}
            className="w-24 bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
            placeholder="A" readOnly />
        </div>
      </div>

      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide pt-2">Description</h3>
      <div>
        <label className="text-xs text-slate-400 block mb-1">Description générale</label>
        <textarea
          className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500 h-20 resize-none"
          value={m.descriptionText ?? ''}
          onChange={e => updateMissionMeta({ descriptionText: e.target.value })}
          placeholder="Description de la mission…"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Briefing BLEU</label>
        <textarea
          className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500 h-24 resize-none"
          value={m.descriptionBlueTask ?? ''}
          onChange={e => updateMissionMeta({ descriptionBlueTask: e.target.value })}
          placeholder="Objectifs coalition bleue…"
        />
      </div>

      <div>
        <label className="text-xs text-slate-400 block mb-1">Briefing ROUGE</label>
        <textarea
          className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500 h-24 resize-none"
          value={m.descriptionRedTask ?? ''}
          onChange={e => updateMissionMeta({ descriptionRedTask: e.target.value })}
          placeholder="Objectifs coalition rouge…"
        />
      </div>

      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide pt-2">Infos Coalitions</h3>
      <div className="grid grid-cols-2 gap-3">
        {(['blue', 'red'] as const).map(coal => {
          const cd = miz.mission.coalition[coal];
          const groupCount = cd?.country?.reduce((acc, c) => {
            const r = c as unknown as Record<string, { group: unknown[] }>;
            return acc + (['plane', 'helicopter', 'vehicle', 'ship', 'static'] as const).reduce(
              (a2, cat) => a2 + (r[cat]?.group?.length ?? 0), 0
            );
          }, 0) ?? 0;
          return (
            <div key={coal} className={`bg-slate-800 rounded p-3 border-l-4 ${coal === 'blue' ? 'border-blue-500' : 'border-red-500'}`}>
              <div className={`text-xs font-bold ${coal === 'blue' ? 'text-blue-400' : 'text-red-400'} mb-1`}>
                {coal.toUpperCase()}
              </div>
              <div className="text-xs text-slate-400">{cd?.country?.length ?? 0} pays</div>
              <div className="text-xs text-slate-400">{groupCount} groupes</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
