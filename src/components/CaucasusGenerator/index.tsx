import { useState } from 'react';
import {
  CAUCASUS_SCENARIOS, generateCaucasusMiz,
  type CaucasusScenario, type GeneratedMissionResult,
} from '../../utils/caucasusMissionGenerator';
import {
  MISSION_TASKS, DIFFICULTY_LEVELS, WEATHER_PRESETS,
  SEASONS, TIMES_OF_DAY, MISSION_FEATURES, DECADES,
  DEFAULT_GENERATOR_CONFIG, type MissionGeneratorConfig,
} from '../../utils/missionGeneratorData';
import { CAUCASUS_AIRFIELDS } from '../../utils/caucasusAirfields';
import { downloadBlob } from '../../utils/mizParser';

const CARD  = 'rounded-xl border border-slate-700/60 bg-slate-800/40 overflow-hidden';
const TITLE = 'text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2';
const BTN_A = 'border-blue-500 bg-blue-900/40 text-blue-300';
const BTN_I = 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200';
const BTN   = 'rounded-lg border px-2 py-1.5 text-[11px] transition-all cursor-pointer';

// ── Fiche aérodrome ───────────────────────────────────────────────────────

function AirfieldCard({ id, side }: { id: number; side: 'blue' | 'red' }) {
  const af = CAUCASUS_AIRFIELDS.find(a => a.id === id);
  if (!af) return null;
  const color = side === 'blue' ? '#3b82f6' : '#ef4444';
  const bg    = side === 'blue' ? 'bg-blue-950/30 border-blue-800/40' : 'bg-red-950/30 border-red-800/40';
  return (
    <div className={`rounded-lg border px-3 py-2 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="font-bold text-[12px]" style={{ color }}>{af.name}</span>
        {af.tacan && (
          <span className="text-[9px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">
            TACAN {af.tacan.channel}/{af.tacan.callsign}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
        <span>UHF {af.radioUHF} MHz</span>
        <span>VHF {af.radioVHF} MHz</span>
        <span>Piste {af.runways.map(r => `${r.hdg1}°/${r.hdg2}°`).join(' · ')}</span>
        <span>Alt {af.elevation} m MSL</span>
        {af.ils?.[0] && <span>ILS {(af.ils[0].freq / 1000).toFixed(2)} MHz rwy{af.ils[0].rwy}</span>}
        {af.vor && <span>VOR {(af.vor.freq / 1e6).toFixed(1)} {af.vor.callsign}{af.vor.channel ? ` ch${af.vor.channel}` : ''}</span>}
        <span>{af.parkingIds.length} spots parking (IDs DCS)</span>
      </div>
      {af.notes && (
        <div className="text-[10px] text-slate-600 italic mt-1">{af.notes}</div>
      )}
    </div>
  );
}

// ── Scénario card ─────────────────────────────────────────────────────────

function ScenarioCard({
  scenario, selected, onSelect
}: {
  scenario: CaucasusScenario;
  selected: boolean;
  onSelect: () => void;
}) {
  const blueAf = CAUCASUS_AIRFIELDS.find(a => a.id === scenario.blueBase);
  const redAf  = CAUCASUS_AIRFIELDS.find(a => a.id === scenario.redBase);
  const taskDef = MISSION_TASKS.find(t => t.id === scenario.suggestedTask);

  const threatColors: Record<string, string> = {
    extreme: '#ef4444', high: '#f97316', medium: '#facc15', low: '#4ade80',
  };
  const threatColor = threatColors[taskDef?.threatLevel ?? 'medium'];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl border px-3 py-3 transition-all ${
        selected
          ? 'border-amber-500 bg-amber-950/30'
          : 'border-slate-700 bg-slate-800/40 hover:border-slate-500'
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className={`font-bold text-[12px] ${selected ? 'text-amber-300' : 'text-slate-200'}`}>
            {scenario.name}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">{scenario.description}</div>
        </div>
        {selected && <span className="text-amber-400 flex-shrink-0">✓</span>}
      </div>

      <div className="flex items-center gap-2 flex-wrap text-[9px]">
        <span className="text-blue-400">🔵 {blueAf?.name}</span>
        <span className="text-slate-600">vs</span>
        <span className="text-red-400">🔴 {redAf?.name}</span>
        <span
          className="ml-auto px-1.5 py-0.5 rounded font-bold"
          style={{ background: threatColor + '22', color: threatColor }}
        >
          {taskDef?.label?.split('—')[0].trim()}
        </span>
        <span className="text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">{scenario.decade}s</span>
      </div>

      <div className="text-[10px] text-slate-600 italic mt-1.5">{scenario.historicalContext}</div>
    </button>
  );
}

// ── Résultat de génération ────────────────────────────────────────────────

function GenerationResult({ result, onDismiss }: { result: GeneratedMissionResult; onDismiss: () => void }) {
  return (
    <div className="rounded-xl border border-green-700/50 bg-green-950/30 px-4 py-3 text-xs">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">✅</span>
        <div>
          <div className="font-bold text-green-400">Mission générée !</div>
          <div className="text-[10px] text-green-700">{result.filename}</div>
        </div>
        <button onClick={onDismiss} className="ml-auto text-slate-600 hover:text-slate-400">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-y-1 text-[11px] mb-3">
        <span className="text-slate-500">Base bleue</span><span className="text-blue-300">{result.summary.blueAirbase}</span>
        <span className="text-slate-500">Base rouge</span><span className="text-red-300">{result.summary.redAirbase}</span>
        <span className="text-slate-500">Groupes</span><span className="text-slate-300">{result.summary.totalGroups}</span>
        <span className="text-slate-500">Météo</span><span className="text-slate-300">{result.summary.weather}</span>
      </div>
      <div className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] text-slate-400">
        📂 Copiez le fichier <span className="text-slate-200 font-mono">.miz</span> dans votre dossier
        <span className="text-amber-400 font-mono"> Saved Games\DCS\Missions\</span><br/>
        puis ouvrez-le via <span className="text-slate-200">DCS Mission Editor → Open</span>.
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────

export default function CaucasusGenerator() {
  const [selectedScenario, setSelectedScenario] = useState<string>(CAUCASUS_SCENARIOS[0].id);
  const [config, setConfig] = useState<MissionGeneratorConfig>({
    ...DEFAULT_GENERATOR_CONFIG,
    theaterId: 'caucasus',
    taskId: CAUCASUS_SCENARIOS[0].suggestedTask,
    decadeId: CAUCASUS_SCENARIOS[0].decade,
  });
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedMissionResult | null>(null);
  const [step, setStep] = useState<'scenario' | 'params' | 'features'>('scenario');

  const set = <K extends keyof MissionGeneratorConfig>(k: K, v: MissionGeneratorConfig[K]) =>
    setConfig(c => ({ ...c, [k]: v }));

  const toggleFeature = (id: string) =>
    set('features', config.features.includes(id)
      ? config.features.filter(f => f !== id)
      : [...config.features, id]);

  const selectedScenarioDef = CAUCASUS_SCENARIOS.find(s => s.id === selectedScenario)!;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const r = await generateCaucasusMiz(config, selectedScenario);
      setResult(r);
      downloadBlob(r.blob, r.filename);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-amber-800/30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <div>
            <div className="text-sm font-bold text-amber-200">Générateur .miz Caucase</div>
            <div className="text-[10px] text-slate-500">Génère un vrai fichier mission importable dans DCS</div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex border-b border-slate-700/60 bg-slate-900 flex-shrink-0">
        {[
          { id: 'scenario', label: '1. Scénario', icon: '🗺' },
          { id: 'params',   label: '2. Paramètres',icon: '⚙️' },
          { id: 'features', label: '3. Features', icon: '✨' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setStep(s.id as typeof step)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider transition-all border-b-2 ${
              step === s.id
                ? 'border-amber-500 text-amber-400 bg-amber-950/20'
                : 'border-transparent text-slate-600 hover:text-slate-400'
            }`}
          >
            <span className="text-sm">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* ── Étape 1 : Scénario ── */}
        {step === 'scenario' && (
          <>
            <div>
              <div className={TITLE}>Nom de la mission</div>
              <input
                className="w-full bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
                placeholder="Op. Thunder…"
                value={config.missionName}
                onChange={e => set('missionName', e.target.value)}
              />
            </div>

            <div>
              <div className={TITLE}>Choisissez un scénario Caucase</div>
              <div className="space-y-2">
                {CAUCASUS_SCENARIOS.map(s => (
                  <ScenarioCard
                    key={s.id}
                    scenario={s}
                    selected={selectedScenario === s.id}
                    onSelect={() => {
                      setSelectedScenario(s.id);
                      set('taskId', s.suggestedTask);
                      set('decadeId', s.decade);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bases du scénario sélectionné */}
            <div className={CARD}>
              <div className="px-3 py-2 border-b border-slate-700/60 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Aérodromes du scénario
              </div>
              <div className="p-3 space-y-2">
                <AirfieldCard id={selectedScenarioDef.blueBase} side="blue" />
                <AirfieldCard id={selectedScenarioDef.redBase} side="red" />
              </div>
            </div>

            <button
              className="w-full bg-amber-700 hover:bg-amber-600 text-white rounded-lg py-2.5 text-xs font-bold transition-colors"
              onClick={() => setStep('params')}
            >
              Suivant → Paramètres
            </button>
          </>
        )}

        {/* ── Étape 2 : Paramètres ── */}
        {step === 'params' && (
          <>
            {/* Époque */}
            <div>
              <div className={TITLE}>Époque</div>
              <div className="grid grid-cols-3 gap-1.5">
                {DECADES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => set('decadeId', d.id)}
                    className={`${BTN} text-center ${config.decadeId === d.id ? BTN_A : BTN_I}`}
                  >
                    <div className="font-bold">{d.label}</div>
                    <div className="text-[9px] text-slate-600">{d.years}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Type de mission */}
            <div>
              <div className={TITLE}>Type de mission</div>
              <div className="space-y-1">
                {MISSION_TASKS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => set('taskId', t.id)}
                    className={`w-full ${BTN} text-left flex items-center gap-2 ${config.taskId === t.id ? BTN_A : BTN_I}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium">{t.label}</div>
                      <div className="text-[9px] text-slate-500">{t.playerRole}</div>
                    </div>
                    {config.taskId === t.id && <span className="text-blue-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulté */}
            <div>
              <div className={TITLE}>Difficulté</div>
              <div className="space-y-1">
                {DIFFICULTY_LEVELS.map((d, i) => {
                  const colors = ['#4ade80','#facc15','#f97316','#ef4444','#7c3aed'];
                  return (
                    <button
                      key={d.id}
                      onClick={() => set('difficultyId', d.id)}
                      className={`w-full ${BTN} flex items-center gap-2 text-left ${config.difficultyId === d.id ? BTN_A : BTN_I}`}
                    >
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[i] }} />
                      <div className="flex-1">
                        <span className="font-bold">{d.label}</span>
                        <span className="text-slate-500 ml-2">IA: {d.aiSkill}</span>
                      </div>
                      {config.difficultyId === d.id && <span className="text-blue-400">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Météo */}
            <div>
              <div className={TITLE}>Météo</div>
              <div className="grid grid-cols-2 gap-1">
                {WEATHER_PRESETS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => set('weatherId', w.id)}
                    className={`${BTN} text-left ${config.weatherId === w.id ? BTN_A : BTN_I}`}
                  >
                    <span className="mr-1">{w.icon}</span>
                    <span className="font-medium">{w.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Saison + Heure */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className={TITLE}>Saison</div>
                <div className="grid grid-cols-2 gap-1">
                  {SEASONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => set('seasonId', s.id)}
                      className={`${BTN} text-center ${config.seasonId === s.id ? BTN_A : BTN_I}`}
                    >
                      <div>{s.icon}</div>
                      <div className="text-[9px]">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className={TITLE}>Heure</div>
                <div className="grid grid-cols-2 gap-1">
                  {TIMES_OF_DAY.map(t => (
                    <button
                      key={t.id}
                      onClick={() => set('timeOfDay', t.id)}
                      className={`${BTN} text-center ${config.timeOfDay === t.id ? BTN_A : BTN_I}`}
                    >
                      <div>{t.icon}</div>
                      <div className="text-[9px]">{t.hour}h</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-xs transition-colors" onClick={() => setStep('scenario')}>← Retour</button>
              <button className="flex-1 bg-amber-700 hover:bg-amber-600 text-white rounded-lg py-2 text-xs font-bold transition-colors" onClick={() => setStep('features')}>Suivant → Features</button>
            </div>
          </>
        )}

        {/* ── Étape 3 : Features + Génération ── */}
        {step === 'features' && (
          <>
            <div className={TITLE}>Options de mission</div>
            <div className="space-y-1.5">
              {MISSION_FEATURES.filter(f =>
                !f.compatibleDecades || f.compatibleDecades.includes(config.decadeId)
              ).map(f => {
                const active = config.features.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFeature(f.id)}
                    className={`w-full rounded-lg border px-3 py-2 flex items-center gap-2.5 text-left transition-all ${
                      active ? 'border-amber-600/60 bg-amber-950/20 text-amber-200' : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{f.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[11px]">{f.label}</div>
                      <div className="text-[9px] text-slate-600 truncate">{f.description}</div>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${
                      active ? 'bg-amber-600 border-amber-500' : 'border-slate-600'
                    }`}>
                      {active && <span className="text-white text-[8px]">✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Résumé avant génération */}
            <div className={`${CARD} p-3 space-y-1.5`}>
              <div className={TITLE}>Récapitulatif</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <span className="text-slate-500">Scénario</span>
                <span className="text-amber-300 truncate">{selectedScenarioDef.name.replace(/^[^\s]+\s/, '')}</span>
                <span className="text-slate-500">Mission</span>
                <span className="text-slate-300">{MISSION_TASKS.find(t => t.id === config.taskId)?.label.split('—')[0]}</span>
                <span className="text-slate-500">Difficulté</span>
                <span className="text-slate-300">{DIFFICULTY_LEVELS.find(d => d.id === config.difficultyId)?.label}</span>
                <span className="text-slate-500">Météo</span>
                <span className="text-slate-300">{WEATHER_PRESETS.find(w => w.id === config.weatherId)?.label}</span>
                <span className="text-slate-500">Époque</span>
                <span className="text-slate-300">{DECADES.find(d => d.id === config.decadeId)?.label}</span>
                <span className="text-slate-500">Features</span>
                <span className="text-slate-300">{config.features.length} actives</span>
              </div>
            </div>

            {result && <GenerationResult result={result} onDismiss={() => setResult(null)} />}

            <div className="flex gap-2">
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-xs transition-colors" onClick={() => setStep('params')}>← Retour</button>
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg py-3 px-6 text-sm font-bold transition-all shadow-lg"
              >
                {generating ? '⏳ Génération…' : '🎯 Générer le .miz'}
              </button>
            </div>

            {!result && (
              <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 px-3 py-2.5 text-[10px] text-slate-500">
                Le fichier <span className="font-mono text-slate-400">.miz</span> sera téléchargé automatiquement.
                Copiez-le dans <span className="font-mono text-amber-400">Saved Games\DCS\Missions\</span> et ouvrez-le dans DCS.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
