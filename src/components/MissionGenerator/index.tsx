import { useState, useMemo } from 'react';
import {
  DECADES, THEATERS, MISSION_TASKS, COUNTRIES, DIFFICULTY_LEVELS,
  MISSION_FEATURES, WEATHER_PRESETS, SEASONS, TIMES_OF_DAY,
  DEFAULT_GENERATOR_CONFIG,
  type MissionGeneratorConfig,
} from '../../utils/missionGeneratorData';

// ── Styles communs ────────────────────────────────────────────────────────

const CARD = 'rounded-xl border border-slate-700/60 bg-slate-800/50 overflow-hidden';
const TITLE = 'text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2';
const BTN_ACTIVE = 'border-blue-500 bg-blue-900/40 text-blue-300';
const BTN_INACTIVE = 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500 hover:text-slate-200';
const BTN_BASE = 'rounded-lg border px-2.5 py-1.5 text-[11px] transition-all cursor-pointer select-none';
const BTN_RED_ACTIVE = 'border-red-500 bg-red-900/40 text-red-300';
const BTN_RED_INACTIVE = 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-red-700 hover:text-slate-200';

// ── Composant sélecteur de pays ───────────────────────────────────────────

function CountrySelector({
  label, color, selected, decade, onChange
}: {
  label: string;
  color: 'blue' | 'red';
  selected: string[];
  decade: string;
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState('');
  const available = useMemo(() => {
    const q = search.toLowerCase();
    return COUNTRIES.filter(c =>
      (color === 'blue' ? c.defaultCoalition === 'blue' : c.defaultCoalition === 'red') &&
      c.decades.includes(decade) &&
      (!q || c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
    );
  }, [color, decade, search]);

  const neutral = useMemo(() => COUNTRIES.filter(c =>
    c.defaultCoalition === 'neutral' && c.decades.includes(decade) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()))
  ), [decade, search]);

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  };

  const activeBtn = color === 'blue' ? BTN_ACTIVE : BTN_RED_ACTIVE;
  const inactiveBtn = color === 'blue' ? BTN_INACTIVE : BTN_RED_INACTIVE;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div
          className="text-[10px] uppercase tracking-widest font-bold"
          style={{ color: color === 'blue' ? '#3b82f6' : '#ef4444' }}
        >
          {label} ({selected.length} pays)
        </div>
        <button
          className="text-[9px] text-slate-600 hover:text-slate-400 transition-colors"
          onClick={() => onChange([])}
        >
          Tout déselectionner
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Filtrer…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 mb-2"
      />

      <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
        {available.map(c => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            title={c.description}
            className={`${BTN_BASE} flex items-center gap-1 ${selected.includes(c.id) ? activeBtn : inactiveBtn}`}
          >
            <span>{c.flag}</span>
            <span>{c.name}</span>
          </button>
        ))}
        {neutral.map(c => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            title={c.description}
            className={`${BTN_BASE} flex items-center gap-1 ${selected.includes(c.id) ? 'border-amber-500 bg-amber-900/30 text-amber-300' : 'border-slate-700 text-slate-500 hover:border-slate-600'}`}
          >
            <span>{c.flag}</span>
            <span className="text-[10px]">{c.name}</span>
          </button>
        ))}
        {available.length === 0 && neutral.length === 0 && (
          <div className="text-[11px] text-slate-600 italic py-1">
            Aucun pays disponible pour cette époque
          </div>
        )}
      </div>
    </div>
  );
}

// ── Preview mission ────────────────────────────────────────────────────────

function MissionPreview({ config }: { config: MissionGeneratorConfig }) {
  const task = MISSION_TASKS.find(t => t.id === config.taskId);
  const theater = THEATERS.find(t => t.id === config.theaterId);
  const decade = DECADES.find(d => d.id === config.decadeId);
  const difficulty = DIFFICULTY_LEVELS.find(d => d.id === config.difficultyId);
  const weather = WEATHER_PRESETS.find(w => w.id === config.weatherId);
  const season = SEASONS.find(s => s.id === config.seasonId);
  const time = TIMES_OF_DAY.find(t => t.id === config.timeOfDay);

  const blueNames = config.blueCountries.map(id => COUNTRIES.find(c => c.id === id)?.flag ?? '').join(' ');
  const redNames = config.redCountries.map(id => COUNTRIES.find(c => c.id === id)?.flag ?? '').join(' ');

  const threatColor = task?.threatLevel === 'extreme' ? '#ef4444'
    : task?.threatLevel === 'high' ? '#f97316'
    : task?.threatLevel === 'medium' ? '#facc15'
    : '#4ade80';

  const selectedFeatures = MISSION_FEATURES.filter(f => config.features.includes(f.id));

  return (
    <div className={`${CARD} mt-1`}>
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60">
        <div className="text-base font-bold text-white mb-0.5">{config.missionName || 'Mission sans nom'}</div>
        <div className="text-[11px] text-slate-400">
          {theater?.label} · {decade?.label} · {season?.icon} {time?.icon}
        </div>
      </div>

      <div className="px-4 py-3 space-y-3 text-xs">
        {/* Type de mission */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-slate-900 px-2 py-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest whitespace-nowrap">
            {task?.category}
          </div>
          <div>
            <div className="font-bold text-slate-200">{task?.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{task?.description}</div>
          </div>
          <div
            className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap"
            style={{ background: threatColor + '22', color: threatColor, border: `1px solid ${threatColor}44` }}
          >
            {task?.threatLevel?.toUpperCase()}
          </div>
        </div>

        {/* Coalitions */}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-blue-950/40 border border-blue-800/40 px-2.5 py-2">
            <div className="text-[9px] text-blue-500 uppercase tracking-wider mb-1">Bleu {blueNames}</div>
            <div className="text-[10px] text-blue-300 leading-relaxed">
              {config.blueCountries.map(id => COUNTRIES.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—'}
            </div>
          </div>
          <div className="rounded-lg bg-red-950/40 border border-red-800/40 px-2.5 py-2">
            <div className="text-[9px] text-red-500 uppercase tracking-wider mb-1">Rouge {redNames}</div>
            <div className="text-[10px] text-red-300 leading-relaxed">
              {config.redCountries.map(id => COUNTRIES.find(c => c.id === id)?.name).filter(Boolean).join(', ') || '—'}
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Météo', value: weather?.label, icon: weather?.icon },
            { label: 'Difficulté', value: difficulty?.label, icon: '⚔️' },
            { label: 'IA', value: difficulty?.aiSkill, icon: '🤖' },
          ].map(item => (
            <div key={item.label} className="rounded-lg bg-slate-900 px-2 py-1.5">
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">{item.label}</div>
              <div className="text-[11px] text-slate-300 mt-0.5">{item.icon} {item.value}</div>
            </div>
          ))}
        </div>

        {/* Objectifs */}
        {task?.objectives && (
          <div>
            <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1.5">Objectifs</div>
            <div className="space-y-1">
              {task.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-slate-300">
                  <span className="text-slate-600 mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Features actives */}
        {selectedFeatures.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedFeatures.map(f => (
              <span
                key={f.id}
                className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-400"
                title={f.description}
              >
                {f.icon} {f.label}
              </span>
            ))}
          </div>
        )}

        {/* Rôle joueur */}
        {task?.recommendedAircraft && (
          <div className="rounded-lg bg-slate-900 px-3 py-2">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider mb-1">
              Rôle joueur · {task.playerRole}
            </div>
            <div className="text-[11px] text-slate-400">
              {task.recommendedAircraft.slice(0, 5).join(' · ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────

export default function MissionGenerator() {
  const [config, setConfig] = useState<MissionGeneratorConfig>(DEFAULT_GENERATOR_CONFIG);
  const [step, setStep] = useState<'coalitions' | 'context' | 'environment' | 'features' | 'preview'>('coalitions');
  const [generated, setGenerated] = useState(false);

  const set = <K extends keyof MissionGeneratorConfig>(key: K, val: MissionGeneratorConfig[K]) =>
    setConfig(c => ({ ...c, [key]: val }));

  const toggleFeature = (id: string) => {
    set('features', config.features.includes(id)
      ? config.features.filter(f => f !== id)
      : [...config.features, id]);
  };

  const selectedDecade = DECADES.find(d => d.id === config.decadeId);
  const selectedDiff = DIFFICULTY_LEVELS.find(d => d.id === config.difficultyId);

  const steps = [
    { id: 'coalitions', label: 'Coalitions', icon: '⚔️' },
    { id: 'context',    label: 'Contexte',   icon: '🗺' },
    { id: 'environment',label: 'Environnem.', icon: '🌤' },
    { id: 'features',   label: 'Features',   icon: '⚙️' },
    { id: 'preview',    label: 'Aperçu',     icon: '👁' },
  ] as const;

  const availableFeatures = useMemo(() =>
    MISSION_FEATURES.filter(f =>
      !f.compatibleDecades || f.compatibleDecades.includes(config.decadeId)
    ),
  [config.decadeId]);

  return (
    <div className="flex flex-col h-full text-xs overflow-hidden">
      {/* ── Header ── */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/60 flex-shrink-0">
        <div className="text-sm font-bold text-white">Générateur de Mission</div>
        <div className="text-[10px] text-slate-500 mt-0.5">Configurez et générez une mission DCS complète</div>
      </div>

      {/* ── Stepper ── */}
      <div className="flex border-b border-slate-700/60 bg-slate-900 flex-shrink-0">
        {steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(s.id)}
            className={`flex-1 py-2 flex flex-col items-center gap-0.5 text-[9px] uppercase tracking-wider transition-all border-b-2 ${
              step === s.id
                ? 'border-blue-500 text-blue-400 bg-blue-950/20'
                : 'border-transparent text-slate-600 hover:text-slate-400'
            }`}
          >
            <span className="text-base leading-none">{s.icon}</span>
            <span className="hidden sm:block">{i + 1}. {s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Contenu ── */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">

        {/* ── Étape 1 : Coalitions ── */}
        {step === 'coalitions' && (
          <>
            <div>
              <div className={TITLE}>Nom de la mission</div>
              <input
                className="w-full bg-slate-800 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                placeholder="Op. Thunder…"
                value={config.missionName}
                onChange={e => set('missionName', e.target.value)}
              />
            </div>

            <div>
              <div className={TITLE}>Époque</div>
              <div className="grid grid-cols-3 gap-1.5">
                {DECADES.map(d => (
                  <button
                    key={d.id}
                    onClick={() => set('decadeId', d.id)}
                    title={d.description}
                    className={`${BTN_BASE} text-center ${config.decadeId === d.id ? BTN_ACTIVE : BTN_INACTIVE}`}
                  >
                    <div className="font-bold">{d.label}</div>
                    <div className="text-[9px] text-slate-600 mt-0.5">{d.years}</div>
                  </button>
                ))}
              </div>
              {selectedDecade && (
                <div className="text-[10px] text-slate-500 mt-1 italic">{selectedDecade.description}</div>
              )}
            </div>

            <div>
              <div className={TITLE}>Coalition bleue (alliés)</div>
              <CountrySelector
                label="Coalition Bleue"
                color="blue"
                selected={config.blueCountries}
                decade={config.decadeId}
                onChange={ids => set('blueCountries', ids)}
              />
            </div>

            <div>
              <div className={TITLE}>Coalition rouge (OPFOR)</div>
              <CountrySelector
                label="Coalition Rouge"
                color="red"
                selected={config.redCountries}
                decade={config.decadeId}
                onChange={ids => set('redCountries', ids)}
              />
            </div>

            <div>
              <div className={TITLE}>Vous jouez en tant que</div>
              <div className="flex gap-2">
                <button
                  onClick={() => set('playerCoalition', 'blue')}
                  className={`flex-1 ${BTN_BASE} ${config.playerCoalition === 'blue' ? BTN_ACTIVE : BTN_INACTIVE}`}
                >
                  🔵 Coalition Bleue
                </button>
                <button
                  onClick={() => set('playerCoalition', 'red')}
                  className={`flex-1 ${BTN_BASE} ${config.playerCoalition === 'red' ? BTN_RED_ACTIVE : BTN_RED_INACTIVE}`}
                >
                  🔴 Coalition Rouge
                </button>
              </div>
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2.5 text-xs font-bold transition-colors"
              onClick={() => setStep('context')}
            >
              Suivant → Contexte
            </button>
          </>
        )}

        {/* ── Étape 2 : Contexte ── */}
        {step === 'context' && (
          <>
            <div>
              <div className={TITLE}>Théâtre d'opération</div>
              <div className="grid grid-cols-1 gap-1.5">
                {THEATERS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => set('theaterId', t.id)}
                    className={`${BTN_BASE} flex items-start gap-3 text-left py-2 ${config.theaterId === t.id ? BTN_ACTIVE : BTN_INACTIVE}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{t.label}</span>
                        <span className="text-[9px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">{t.region}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t.description}</div>
                    </div>
                    {config.theaterId === t.id && <span className="text-blue-400 flex-shrink-0">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={TITLE}>Type de mission</div>
              <div className="space-y-1.5">
                {MISSION_TASKS.map(t => {
                  const threatColor = t.threatLevel === 'extreme' ? '#ef4444'
                    : t.threatLevel === 'high' ? '#f97316'
                    : t.threatLevel === 'medium' ? '#facc15' : '#4ade80';
                  return (
                    <button
                      key={t.id}
                      onClick={() => set('taskId', t.id)}
                      className={`w-full ${BTN_BASE} flex items-start gap-3 text-left py-2 ${config.taskId === t.id ? BTN_ACTIVE : BTN_INACTIVE}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-[11px]">{t.label}</span>
                          <span className="text-[9px] text-slate-600 bg-slate-900 px-1.5 py-0.5 rounded">{t.category}</span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: threatColor + '22', color: threatColor }}
                          >
                            {t.threatLevel}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{t.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className={TITLE}>Niveau de difficulté</div>
              <div className="space-y-1.5">
                {DIFFICULTY_LEVELS.map(d => {
                  const colors = ['#4ade80','#facc15','#f97316','#ef4444','#7c3aed'];
                  const color = colors[DIFFICULTY_LEVELS.indexOf(d)];
                  return (
                    <button
                      key={d.id}
                      onClick={() => set('difficultyId', d.id)}
                      className={`w-full ${BTN_BASE} flex items-center gap-3 text-left ${config.difficultyId === d.id ? BTN_ACTIVE : BTN_INACTIVE}`}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <div className="flex-1">
                        <div className="font-bold">{d.label}</div>
                        <div className="text-[10px] text-slate-500">{d.description}</div>
                      </div>
                      {config.difficultyId === d.id && <span className="text-blue-400">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-xs transition-colors" onClick={() => setStep('coalitions')}>← Retour</button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-bold transition-colors" onClick={() => setStep('environment')}>Suivant → Environnement</button>
            </div>
          </>
        )}

        {/* ── Étape 3 : Environnement ── */}
        {step === 'environment' && (
          <>
            <div>
              <div className={TITLE}>Météo</div>
              <div className="grid grid-cols-2 gap-1.5">
                {WEATHER_PRESETS.map(w => (
                  <button
                    key={w.id}
                    onClick={() => set('weatherId', w.id)}
                    className={`${BTN_BASE} text-left ${config.weatherId === w.id ? BTN_ACTIVE : BTN_INACTIVE}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{w.icon}</span>
                      <span className="font-medium">{w.label}</span>
                    </div>
                    <div className="text-[9px] text-slate-600 mt-0.5">{w.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={TITLE}>Saison</div>
              <div className="grid grid-cols-4 gap-1.5">
                {SEASONS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => set('seasonId', s.id)}
                    className={`${BTN_BASE} text-center ${config.seasonId === s.id ? BTN_ACTIVE : BTN_INACTIVE}`}
                  >
                    <div className="text-xl">{s.icon}</div>
                    <div className="text-[10px] mt-0.5">{s.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={TITLE}>Heure de départ</div>
              <div className="grid grid-cols-3 gap-1.5">
                {TIMES_OF_DAY.map(t => (
                  <button
                    key={t.id}
                    onClick={() => set('timeOfDay', t.id)}
                    className={`${BTN_BASE} text-center ${config.timeOfDay === t.id ? BTN_ACTIVE : BTN_INACTIVE}`}
                  >
                    <div className="text-xl">{t.icon}</div>
                    <div className="text-[10px] mt-0.5">{t.label}</div>
                    <div className="text-[9px] text-slate-600">{t.hour}h00</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-xs transition-colors" onClick={() => setStep('context')}>← Retour</button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-bold transition-colors" onClick={() => setStep('features')}>Suivant → Features</button>
            </div>
          </>
        )}

        {/* ── Étape 4 : Features ── */}
        {step === 'features' && (
          <>
            <div className="text-[11px] text-slate-500 mb-1">
              Ajoutez des éléments optionnels à la mission. Certaines features sont limitées selon l'époque.
            </div>

            {(['support', 'threat', 'logistics', 'script'] as const).map(cat => {
              const features = availableFeatures.filter(f => f.category === cat);
              if (!features.length) return null;
              const catLabels = { support: '🟢 Support allié', threat: '🔴 Menaces ennemies', logistics: '🟡 Logistique', script: '⚙️ Scripts avancés' };
              return (
                <div key={cat}>
                  <div className={TITLE}>{catLabels[cat]}</div>
                  <div className="space-y-1.5">
                    {features.map(f => {
                      const active = config.features.includes(f.id);
                      return (
                        <button
                          key={f.id}
                          onClick={() => toggleFeature(f.id)}
                          className={`w-full ${BTN_BASE} flex items-center gap-3 text-left ${
                            active
                              ? cat === 'threat' ? BTN_RED_ACTIVE : BTN_ACTIVE
                              : BTN_INACTIVE
                          }`}
                        >
                          <span className="text-lg flex-shrink-0">{f.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{f.label}</div>
                            <div className="text-[10px] text-slate-500">{f.description}</div>
                          </div>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                            active ? 'bg-blue-600 border-blue-500' : 'border-slate-600'
                          }`}>
                            {active && <span className="text-white text-[9px]">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="flex gap-2">
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-xs transition-colors" onClick={() => setStep('environment')}>← Retour</button>
              <button className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-bold transition-colors" onClick={() => setStep('preview')}>→ Aperçu final</button>
            </div>
          </>
        )}

        {/* ── Étape 5 : Preview + Génération ── */}
        {step === 'preview' && (
          <>
            <div className="text-[11px] text-slate-500">
              Vérifiez la configuration avant de générer la mission.
            </div>

            <MissionPreview config={config} />

            {/* Résumé difficulté */}
            {selectedDiff && (
              <div className={`${CARD} p-3 space-y-2`}>
                <div className={TITLE}>Paramètres de difficulté</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                  {[
                    { label: 'IA', value: selectedDiff.aiSkill },
                    { label: 'SAM density', value: selectedDiff.samDensity },
                    { label: 'CAP force', value: selectedDiff.capStrength },
                    { label: 'Menace sol', value: selectedDiff.groundThreat },
                    { label: 'Respawn', value: selectedDiff.playerRespawn ? 'Oui' : 'Non' },
                    { label: 'Munitions limitées', value: selectedDiff.limitedAmmo ? 'Oui' : 'Non' },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="text-slate-300 font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note informatif */}
            <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 px-3 py-2.5 text-[11px] text-amber-300/70">
              <div className="font-bold text-amber-400 mb-1">ℹ️ Fonctionnement</div>
              Le générateur crée un briefing complet et exporte un fichier de configuration que vous pouvez intégrer dans DCS Mission Editor ou utiliser comme référence pour construire votre mission dans Forge.
            </div>

            {/* Description optionnelle */}
            <div>
              <div className={TITLE}>Note de mission (optionnel)</div>
              <textarea
                className="w-full bg-slate-800 text-slate-300 text-[11px] px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Notes sur le contexte tactique, restrictions d'engagement…"
                value={config.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg py-2 text-xs transition-colors" onClick={() => setStep('features')}>← Retour</button>
              <button
                className={`flex-2 ${generated ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'} text-white rounded-lg py-2.5 px-6 text-xs font-bold transition-all shadow-lg`}
                onClick={() => {
                  const blob = new Blob([generateBriefing(config)], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${config.missionName.replace(/\s+/g,'_') || 'mission'}_briefing.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  setGenerated(true);
                }}
              >
                {generated ? '✓ Briefing exporté !' : '⬇ Exporter le briefing'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Générateur de briefing texte ──────────────────────────────────────────

function generateBriefing(config: MissionGeneratorConfig): string {
  const task = MISSION_TASKS.find(t => t.id === config.taskId);
  const theater = THEATERS.find(t => t.id === config.theaterId);
  const decade = DECADES.find(d => d.id === config.decadeId);
  const difficulty = DIFFICULTY_LEVELS.find(d => d.id === config.difficultyId);
  const weather = WEATHER_PRESETS.find(w => w.id === config.weatherId);
  const season = SEASONS.find(s => s.id === config.seasonId);
  const time = TIMES_OF_DAY.find(t => t.id === config.timeOfDay);
  const selectedFeatures = MISSION_FEATURES.filter(f => config.features.includes(f.id));
  const blueNames = config.blueCountries.map(id => COUNTRIES.find(c => c.id === id)?.name).filter(Boolean);
  const redNames = config.redCountries.map(id => COUNTRIES.find(c => c.id === id)?.name).filter(Boolean);

  const lines = [
    `╔═══════════════════════════════════════════════════════════╗`,
    `║              BRIEFING DE MISSION — DCS MISSION FORGE      ║`,
    `╚═══════════════════════════════════════════════════════════╝`,
    ``,
    `MISSION : ${config.missionName}`,
    `THÉÂTRE : ${theater?.label} (${theater?.region})`,
    `ÉPOQUE  : ${decade?.label} (${decade?.years})`,
    `DATE    : ${season?.label}, ${time?.label} (${time?.hour}h00 locale)`,
    `MÉTÉO   : ${weather?.label} — Visibilité ${weather?.visibility} km${weather?.cloudBase ? `, plafond ${weather.cloudBase} ft` : ''}${weather?.wind ? `, vent ${weather.wind} m/s` : ''}`,
    ``,
    `═══════════════════════════════════════════════════════════`,
    `COALITIONS`,
    `═══════════════════════════════════════════════════════════`,
    ``,
    `BLEU (Alliés) : ${blueNames.join(', ')}`,
    `ROUGE (OPFOR) : ${redNames.join(', ')}`,
    `JOUEUR        : Coalition ${config.playerCoalition === 'blue' ? 'Bleue' : 'Rouge'}`,
    ``,
    `═══════════════════════════════════════════════════════════`,
    `TYPE DE MISSION : ${task?.label}`,
    `═══════════════════════════════════════════════════════════`,
    ``,
    `${task?.description}`,
    ``,
    `Rôle joueur   : ${task?.playerRole}`,
    `Niveau menace : ${task?.threatLevel?.toUpperCase()}`,
    `Catégorie     : ${task?.category}`,
    ``,
    `Aéronefs recommandés :`,
    ...(task?.recommendedAircraft ?? []).map(a => `  • ${a}`),
    ``,
    `OBJECTIFS :`,
    ...(task?.objectives ?? []).map((obj, i) => `  ${i + 1}. ${obj}`),
    ``,
    `═══════════════════════════════════════════════════════════`,
    `DIFFICULTÉ : ${difficulty?.label}`,
    `═══════════════════════════════════════════════════════════`,
    ``,
    `IA ennemie          : ${difficulty?.aiSkill}`,
    `Densité SAM         : ${difficulty?.samDensity}`,
    `Force CAP ennemie   : ${difficulty?.capStrength}`,
    `Menace sol          : ${difficulty?.groundThreat}`,
    `Respawn joueur      : ${difficulty?.playerRespawn ? 'Oui' : 'Non'}`,
    `Munitions limitées  : ${difficulty?.limitedAmmo ? 'Oui' : 'Non'}`,
    ``,
  ];

  if (selectedFeatures.length > 0) {
    lines.push(`═══════════════════════════════════════════════════════════`);
    lines.push(`FEATURES ACTIVES`);
    lines.push(`═══════════════════════════════════════════════════════════`);
    lines.push(``);
    for (const f of selectedFeatures) {
      lines.push(`${f.icon} ${f.label}`);
      lines.push(`   ${f.description}`);
      lines.push(``);
    }
  }

  if (config.description) {
    lines.push(`═══════════════════════════════════════════════════════════`);
    lines.push(`NOTES DU COMMANDANT`);
    lines.push(`═══════════════════════════════════════════════════════════`);
    lines.push(``);
    lines.push(config.description);
    lines.push(``);
  }

  lines.push(`═══════════════════════════════════════════════════════════`);
  lines.push(`Généré par DCS Mission Forge — github.com/AstroQuestStudio/dcs-mission-forge`);

  return lines.join('\n');
}
