import { useMissionStore, extractTriggerZones } from '../../store/missionStore';

export default function TriggerEditor() {
  const { miz } = useMissionStore();

  if (!miz) return (
    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
      Chargez une mission
    </div>
  );

  const zones = extractTriggerZones(miz);
  const triggersRaw = miz.mission.trigrules ?? [];
  const triggers = Array.isArray(triggersRaw) ? triggersRaw : Object.values(triggersRaw as object);

  return (
    <div className="p-4 overflow-y-auto h-full space-y-4">
      {/* Zones de trigger */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
          Zones Trigger ({zones.length})
        </h3>
        {zones.length === 0 ? (
          <div className="text-xs text-slate-500">Aucune zone trouvée</div>
        ) : (
          <div className="space-y-1">
            {zones.map((zone, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800 rounded px-3 py-2 text-xs">
                <div className="w-3 h-3 rounded-full border-2 border-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium truncate">{zone.name}</div>
                  <div className="text-slate-500">
                    r={Math.round(zone.radius)}m · x={Math.round(zone.x)} y={Math.round(zone.y)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Règles de trigger */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
          Règles Trigger ({triggers.length})
        </h3>
        {triggers.length === 0 ? (
          <div className="text-xs text-slate-500">Aucun trigger trouvé</div>
        ) : (
          <div className="space-y-1">
            {triggers.slice(0, 50).map((trig, i) => {
              const t = trig as unknown as Record<string, unknown>;
              return (
                <div key={i} className="bg-slate-800 rounded px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded text-[10px]">
                      {(t.triggerType as string) ?? '?'}
                    </span>
                    <span className="text-slate-300 font-medium">
                      {(t.comment as string) || (t.eventName as string) || `Trigger ${i + 1}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="text-xs text-slate-500 bg-slate-800 rounded p-3">
        <div className="font-bold text-slate-400 mb-1">💡 Éditeur de triggers avancé</div>
        L'édition complète des triggers (conditions, actions) est en cours de développement.
        Pour des modifications complexes, utilisez l'éditeur de mission DCS natif.
      </div>
    </div>
  );
}
