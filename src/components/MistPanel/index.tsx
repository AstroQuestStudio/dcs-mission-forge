import { useMissionStore, extractAllGroups } from '../../store/missionStore';
import { MIST_PRESETS } from '../../utils/mistGenerator';
import type { MistAutoRespawn, MistConfig, MistZoneRespawn } from '../../types/dcs';
import { useState } from 'react';

export default function MistPanel() {
  const miz = useMissionStore(s => s.miz);
  const mistConfig = useMissionStore(s => s.mistConfig);
  const setMistConfig = useMissionStore(s => s.setMistConfig);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [presetGroup, setPresetGroup] = useState('');
  const [presetDelay, setPresetDelay] = useState(300);
  const [presetZone, setPresetZone] = useState('');

  const allGroups = miz ? extractAllGroups(miz) : [];

  const upd = (patch: Partial<MistConfig>) => setMistConfig({ ...mistConfig, ...patch });

  const applyPreset = () => {
    if (!selectedPreset || !presetGroup) return;
    const preset = MIST_PRESETS.find(p => p.id === selectedPreset);
    if (!preset) return;
    const partial = preset.generateConfig(presetGroup, presetDelay, presetZone);
    const newConfig: MistConfig = {
      ...mistConfig,
      enabled: true,
      autoRespawnGroups: [
        ...mistConfig.autoRespawnGroups,
        ...(partial.autoRespawnGroups ?? []),
      ],
      zoneRespawns: [
        ...mistConfig.zoneRespawns,
        ...(partial.zoneRespawns ?? []),
      ],
      scheduledFunctions: [
        ...mistConfig.scheduledFunctions,
        ...(partial.scheduledFunctions ?? []),
      ],
    };
    setMistConfig(newConfig);
    setSelectedPreset(null);
    setPresetGroup('');
  };

  const removeAutoRespawn = (i: number) => {
    const arr = [...mistConfig.autoRespawnGroups];
    arr.splice(i, 1);
    upd({ autoRespawnGroups: arr });
  };

  const removeZoneRespawn = (i: number) => {
    const arr = [...mistConfig.zoneRespawns];
    arr.splice(i, 1);
    upd({ zoneRespawns: arr });
  };

  return (
    <div className="p-4 overflow-y-auto h-full space-y-6">
      {/* Activation globale */}
      <div className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
        <div>
          <div className="text-sm font-bold text-slate-200">Support MIST</div>
          <div className="text-xs text-slate-400">Active la lib MIST dans la mission exportée</div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={mistConfig.enabled}
            onChange={e => upd({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-600 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
        </label>
      </div>

      {!mistConfig.enabled && (
        <div className="text-xs text-slate-500 text-center py-4">
          Activez MIST pour accéder aux fonctionnalités avancées
        </div>
      )}

      {mistConfig.enabled && (
        <>
          {/* Presets */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wide">
              Presets Rapides
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {MIST_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset.id === selectedPreset ? null : preset.id);
                    setPresetDelay(preset.defaultDelay);
                  }}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    selectedPreset === preset.id
                      ? 'bg-blue-900 border-blue-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{preset.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{preset.name}</div>
                      <div className="text-xs text-slate-400">{preset.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {selectedPreset && (
              <div className="mt-3 p-3 bg-slate-800 rounded-lg border border-blue-700 space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Groupe cible</label>
                  <select
                    className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
                    value={presetGroup}
                    onChange={e => setPresetGroup(e.target.value)}
                  >
                    <option value="">-- Choisir un groupe --</option>
                    {allGroups.map((e, i) => (
                      <option key={i} value={e.group.name}>{e.group.name}</option>
                    ))}
                  </select>
                </div>
                {selectedPreset === 'zone_respawn' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Nom de la zone trigger</label>
                    <input
                      className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
                      value={presetZone}
                      onChange={e => setPresetZone(e.target.value)}
                      placeholder="ex: RespawnZone"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Délai (secondes)</label>
                  <input
                    type="number" min={0}
                    className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
                    value={presetDelay}
                    onChange={e => setPresetDelay(parseInt(e.target.value) || 0)}
                  />
                </div>
                <button
                  onClick={applyPreset}
                  disabled={!presetGroup}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm py-1.5 rounded transition-colors"
                >
                  Appliquer le preset
                </button>
              </div>
            )}
          </div>

          {/* Auto-respawn actifs */}
          {mistConfig.autoRespawnGroups.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Auto-Respawn Actifs ({mistConfig.autoRespawnGroups.length})
              </h3>
              <div className="space-y-1">
                {mistConfig.autoRespawnGroups.map((ar: MistAutoRespawn, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800 rounded px-3 py-2 text-xs">
                    <div>
                      <span className="text-slate-200 font-medium">{ar.groupName}</span>
                      <span className="text-slate-500 ml-2">après {ar.delay}s</span>
                      {ar.retakeTask && <span className="text-green-500 ml-2">↻ route</span>}
                    </div>
                    <button onClick={() => removeAutoRespawn(i)} className="text-red-400 hover:text-red-300">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zone respawns actifs */}
          {mistConfig.zoneRespawns.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Respawns en Zone ({mistConfig.zoneRespawns.length})
              </h3>
              <div className="space-y-1">
                {mistConfig.zoneRespawns.map((zr: MistZoneRespawn, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-slate-800 rounded px-3 py-2 text-xs">
                    <div>
                      <span className="text-slate-200 font-medium">{zr.groupName}</span>
                      <span className="text-slate-500 ml-2">→ {zr.zoneName}</span>
                      <span className="text-slate-500 ml-2">({zr.delay}s)</span>
                    </div>
                    <button onClick={() => removeZoneRespawn(i)} className="text-red-400 hover:text-red-300">×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-xs text-slate-500 bg-slate-800 rounded p-3">
            <div className="font-bold text-slate-400 mb-1">ℹ️ Comment ça fonctionne ?</div>
            Les scripts MIST sont automatiquement injectés dans votre mission lors de l'export .miz.
            Assurez-vous que <code className="bg-slate-700 px-1 rounded">mist_4_5_126.lua</code> est
            chargé en premier dans vos triggers DCS.
          </div>
        </>
      )}
    </div>
  );
}
