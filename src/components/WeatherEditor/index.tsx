import { useMissionStore } from '../../store/missionStore';
import type { DCSWeather } from '../../types/dcs';
import { useState, useEffect } from 'react';

function Slider({ label, value, min, max, step = 1, unit = '', onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span className="text-slate-200">{value}{unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

const CLOUD_PRESETS = [
  { id: 'Preset1', label: 'Clair' },
  { id: 'Preset7', label: 'Quelques nuages' },
  { id: 'Preset10', label: 'Nuageux' },
  { id: 'Preset16', label: 'Couvert' },
  { id: 'RainyPreset1', label: 'Pluie légère' },
  { id: 'RainyPreset3', label: 'Orage' },
];

export default function WeatherEditor() {
  const miz = useMissionStore(s => s.miz);
  const updateWeather = useMissionStore(s => s.updateWeather);
  const updateMissionMeta = useMissionStore(s => s.updateMissionMeta);

  const startTime = miz?.mission.start_time ?? 0;
  const [localHours, setLocalHours] = useState(Math.floor(startTime / 3600));
  const [localMinutes, setLocalMinutes] = useState(Math.floor((startTime % 3600) / 60));

  useEffect(() => {
    const t = miz?.mission.start_time ?? 0;
    setLocalHours(Math.floor(t / 3600));
    setLocalMinutes(Math.floor((t % 3600) / 60));
  }, [miz?.mission.start_time]);

  if (!miz) return (
    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
      Chargez une mission
    </div>
  );

  const w = miz.mission.weather;
  const upd = (patch: Partial<DCSWeather>) => updateWeather({ ...w, ...patch });

  const commitTime = (h: number, m: number) => {
    updateMissionMeta({ start_time: h * 3600 + m * 60 });
  };

  return (
    <div className="p-4 overflow-y-auto h-full">
      <h3 className="text-sm font-bold text-slate-300 mb-4">HEURE DE DÉPART</h3>
      <div className="flex gap-2 mb-6">
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Heure</label>
          <input
            type="number" min={0} max={23} value={localHours}
            className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
            onChange={e => {
              const h = Math.max(0, Math.min(23, parseInt(e.target.value) || 0));
              setLocalHours(h);
              commitTime(h, localMinutes);
            }}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-slate-400 block mb-1">Minutes</label>
          <input
            type="number" min={0} max={59} value={localMinutes}
            className="w-full bg-slate-700 text-slate-100 text-sm px-2 py-1 rounded border border-slate-600"
            onChange={e => {
              const m = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
              setLocalMinutes(m);
              commitTime(localHours, m);
            }}
          />
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-300 mb-3">VENT</h3>
      <Slider label="Vitesse sol (m/s)" value={w.wind?.atGround?.speed ?? 0} min={0} max={30}
        onChange={v => upd({ wind: { ...w.wind, atGround: { ...w.wind?.atGround, speed: v } } })} />
      <Slider label="Direction sol (°)" value={w.wind?.atGround?.dir ?? 0} min={0} max={359}
        onChange={v => upd({ wind: { ...w.wind, atGround: { ...w.wind?.atGround, dir: v } } })} />
      <Slider label="Vitesse 2000m (m/s)" value={w.wind?.at2000?.speed ?? 0} min={0} max={50}
        onChange={v => upd({ wind: { ...w.wind, at2000: { ...w.wind?.at2000, speed: v } } })} />

      <h3 className="text-sm font-bold text-slate-300 mb-3 mt-2">NUAGES</h3>
      <div className="mb-4">
        <label className="text-xs text-slate-400 block mb-2">Preset météo</label>
        <div className="grid grid-cols-2 gap-1">
          {CLOUD_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => upd({ clouds: { ...w.clouds, preset: p.id } })}
              className={`text-xs px-2 py-1 rounded border ${
                w.clouds?.preset === p.id
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Slider label="Base des nuages (m)" value={w.clouds?.base ?? 1000} min={300} max={5000} step={100} unit="m"
        onChange={v => upd({ clouds: { ...w.clouds, base: v } })} />

      <h3 className="text-sm font-bold text-slate-300 mb-3 mt-2">VISIBILITÉ & BROUILLARD</h3>
      <Slider label="Visibilité (km)" value={Math.round((w.visibility?.distance ?? 80000) / 1000)} min={1} max={80} unit="km"
        onChange={v => upd({ visibility: { distance: v * 1000 } })} />
      <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
        <input
          type="checkbox"
          checked={!!w.enable_fog}
          onChange={e => upd({ enable_fog: e.target.checked })}
          className="accent-blue-500"
        />
        Activer le brouillard
      </label>
      {w.enable_fog && (
        <Slider label="Visibilité brouillard (m)" value={w.fog?.visibility ?? 0} min={0} max={6000} step={100} unit="m"
          onChange={v => upd({ fog: { ...w.fog, visibility: v } })} />
      )}

      <h3 className="text-sm font-bold text-slate-300 mb-3 mt-2">TEMPÉRATURE</h3>
      <Slider label="Température (°C)" value={w.season?.temperature ?? 20} min={-30} max={45} unit="°C"
        onChange={v => upd({ season: { temperature: v } })} />

      <h3 className="text-sm font-bold text-slate-300 mb-3 mt-2">PRESSION</h3>
      <Slider label="QNH (mmHg)" value={w.qnh ?? 760} min={700} max={790} unit=" mmHg"
        onChange={v => upd({ qnh: v })} />
    </div>
  );
}
