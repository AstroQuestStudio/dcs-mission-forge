import { useRef, useState, useCallback, useEffect } from 'react';
import { useMissionStore } from './store/missionStore';
import { parseMiz, buildMiz, downloadBlob } from './utils/mizParser';
import { exportMizJson, importMizJson } from './utils/jsonMizFormat';
import { generateMistLua } from './utils/mistGenerator';
import type { ActiveTab } from './store/missionStore';

import MapView from './components/MapView';
import GroupList from './components/GroupList';
import UnitPanel from './components/UnitPanel';
import WeatherEditor from './components/WeatherEditor';
import MistPanel from './components/MistPanel';
import MissionSettings from './components/MissionSettings';
import TriggerEditor from './components/TriggerEditor';
import CaucasusGenerator from './components/CaucasusGenerator';
import SideNav from './components/SideNav';

const AUTOSAVE_KEY = 'dcs-forge-autosave';

export default function App() {
  const miz = useMissionStore(s => s.miz);
  const loadMiz = useMissionStore(s => s.loadMiz);
  const clearMiz = useMissionStore(s => s.clearMiz);
  const activeTab = useMissionStore(s => s.activeTab);
  const setActiveTab = useMissionStore(s => s.setActiveTab);
  const mistConfig = useMissionStore(s => s.mistConfig);
  const isDirty = useMissionStore(s => s.isDirty);
  const selectedEntity = useMissionStore(s => s.selectedEntity);

  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [hasAutosave, setHasAutosave] = useState(false);

  // Undo/Redo
  const temporal = useMissionStore.temporal;
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

  useEffect(() => {
    const unsub = temporal.subscribe(state => {
      setUndoCount(state.pastStates.length);
      setRedoCount(state.futureStates.length);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); temporal.getState().undo(); }
      else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); temporal.getState().redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!miz || !isDirty) return;
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ miz, ts: Date.now() }));
    } catch { /* quota exceeded, ignore */ }
  }, [miz, isDirty]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (saved) setHasAutosave(true);
    } catch { /* ignore */ }
  }, []);

  const restoreAutosave = () => {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return;
      const { miz: savedMiz } = JSON.parse(saved);
      loadMiz(savedMiz);
      setHasAutosave(false);
    } catch {
      setError('Impossible de restaurer la session précédente');
      setHasAutosave(false);
    }
  };

  const handleFile = useCallback(async (file: File) => {
    if (file.name.endsWith('.miz')) {
      setLoading(true);
      setError(null);
      try {
        const parsed = await parseMiz(file);
        loadMiz(parsed);
        setHasAutosave(false);
      } catch (e) {
        setError(`Erreur de lecture : ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setLoading(false);
      }
    } else if (file.name.endsWith('.json')) {
      setLoading(true);
      setError(null);
      try {
        const text = await file.text();
        const parsed = importMizJson(text);
        loadMiz(parsed);
        setHasAutosave(false);
      } catch (e) {
        setError(`Erreur JSON : ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Fichier invalide — sélectionnez un .miz ou .json');
    }
  }, [loadMiz]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleExportMiz = async () => {
    if (!miz) return;
    setLoading(true);
    try {
      const extraLua = generateMistLua(mistConfig) || undefined;
      const blob = await buildMiz(miz, extraLua);
      const base = miz.mission.sortie || 'mission';
      downloadBlob(blob, `${base}_forge.miz`);
    } catch (e) {
      setError(`Erreur export : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJson = () => {
    if (!miz) return;
    const blob = exportMizJson(miz);
    const base = miz.mission.sortie || 'mission';
    downloadBlob(blob, `${base}_forge.json`);
  };

  const panelTitle: Record<ActiveTab, string> = {
    map: 'Carte',
    groups: 'Groupes',
    triggers: 'Triggers',
    weather: 'Météo',
    mist: 'MIST',
    settings: 'Mission',
    caucasus: 'Nouvelle mission',
  };

  const showLeftPanel = activeTab !== 'map';
  const showRightPanel = !!selectedEntity;

  // Stats
  const stats = miz ? (() => {
    let groups = 0, units = 0;
    const coals = miz.mission.coalition as Record<string, { country: unknown[] }>;
    for (const coal of Object.values(coals)) {
      const countries = Array.isArray(coal?.country) ? coal.country : Object.values(coal?.country ?? {});
      for (const c of countries) {
        const country = c as Record<string, { group: unknown[] }>;
        for (const cat of ['plane', 'helicopter', 'vehicle', 'ship', 'static']) {
          const grps = Array.isArray(country[cat]?.group) ? country[cat].group : Object.values(country[cat]?.group ?? {});
          groups += grps.length;
          for (const g of grps) {
            const gg = g as Record<string, unknown[]>;
            const u = Array.isArray(gg.units) ? gg.units : Object.values((gg.units as object) ?? {});
            units += u.length;
          }
        }
      }
    }
    return { groups, units };
  })() : null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-200 flex flex-col select-none">

      {/* ── TopBar ── */}
      <header className="flex items-center gap-2 px-3 h-11 bg-slate-900 border-b border-slate-700 flex-shrink-0 shadow-lg z-50">
        <div className="flex items-center gap-2 mr-1">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-black text-white shadow">F</div>
          <span className="font-bold text-slate-100 text-sm tracking-tight hidden sm:block">DCS Mission Forge</span>
        </div>

        {miz && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-4 w-px bg-slate-700 flex-shrink-0" />
            <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded flex-shrink-0">Caucase</span>
            {miz.mission.sortie && (
              <span className="text-xs text-slate-400 truncate max-w-32">{miz.mission.sortie}</span>
            )}
            {stats && (
              <span className="text-xs text-slate-500 flex-shrink-0 hidden md:block">
                {stats.groups} grp · {stats.units} unités
              </span>
            )}
            {isDirty && (
              <span className="text-xs text-amber-400 flex items-center gap-1 flex-shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                <span className="hidden sm:block">Non sauvegardé</span>
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Undo/Redo */}
        {miz && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => temporal.getState().undo()}
              disabled={undoCount === 0}
              title={`Annuler (Ctrl+Z) — ${undoCount} actions`}
              className="flex items-center gap-1 text-xs px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              ↩ {undoCount > 0 && <span className="text-slate-500">{undoCount}</span>}
            </button>
            <button
              onClick={() => temporal.getState().redo()}
              disabled={redoCount === 0}
              title={`Rétablir (Ctrl+Y) — ${redoCount} actions`}
              className="flex items-center gap-1 text-xs px-2 py-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-colors"
            >
              {redoCount > 0 && <span className="text-slate-500">{redoCount}</span>} ↪
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          {miz && (
            <>
              <button
                onClick={handleExportJson}
                className="text-xs px-2.5 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                title="Exporter en JSON (backup)"
              >
                JSON
              </button>
              <button
                onClick={handleExportMiz}
                disabled={loading}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-all shadow"
              >
                ↓ {loading ? 'Export…' : '.miz'}
              </button>
              <button
                onClick={clearMiz}
                className="text-xs px-2.5 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
              >
                Fermer
              </button>
            </>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-all shadow"
          >
            + {loading ? 'Chargement…' : 'Ouvrir'}
          </button>
        </div>
      </header>

      {/* Erreur */}
      {error && (
        <div className="flex items-center justify-between bg-red-950 border-b border-red-800 text-red-300 text-xs px-4 py-2 flex-shrink-0">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 ml-4">✕</button>
        </div>
      )}

      {/* Banner autosave */}
      {hasAutosave && !miz && (
        <div className="flex items-center justify-between bg-amber-950/80 border-b border-amber-700/60 text-amber-300 text-xs px-4 py-2 flex-shrink-0">
          <span>💾 Session précédente détectée</span>
          <div className="flex gap-2">
            <button onClick={restoreAutosave} className="bg-amber-700 hover:bg-amber-600 text-white px-3 py-1 rounded font-medium">
              Restaurer
            </button>
            <button onClick={() => { localStorage.removeItem(AUTOSAVE_KEY); setHasAutosave(false); }} className="text-amber-500 hover:text-amber-300">
              Ignorer
            </button>
          </div>
        </div>
      )}

      {/* ── Zone principale ── */}
      <div className="flex-1 relative overflow-hidden flex">

        {/* ── Écran d'accueil ── */}
        {!miz && activeTab !== 'caucasus' && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10"
            onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="w-full max-w-xl px-6">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl mx-auto mb-5">F</div>
                <h1 className="text-3xl font-bold text-slate-100 mb-2">DCS Mission Forge</h1>
                <p className="text-slate-400 text-sm">Éditeur de missions DCS World · Théâtre Caucase · Support MIST</p>
              </div>

              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-4 ${
                  isDragOver
                    ? 'border-blue-400 bg-blue-950/40 scale-[1.01]'
                    : 'border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900'
                }`}
                onClick={() => fileRef.current?.click()}
              >
                <div className="text-5xl mb-3">{isDragOver ? '🎯' : '📁'}</div>
                <div className="text-slate-200 font-medium mb-1">
                  {isDragOver ? 'Relâchez pour charger' : 'Glissez votre fichier .miz ici'}
                </div>
                <div className="text-slate-500 text-sm">ou cliquez · .miz et .json acceptés</div>
              </div>

              <button
                onClick={() => setActiveTab('caucasus')}
                className="w-full mb-4 rounded-2xl border border-amber-700/50 bg-amber-950/25 hover:bg-amber-950/50 transition-all px-6 py-4 text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <div className="font-bold text-amber-200 group-hover:text-amber-100">Créer une nouvelle mission</div>
                    <div className="text-sm text-slate-500 mt-0.5">8 scénarios Caucase · aérodromes officiels · fichier .miz importable</div>
                  </div>
                  <span className="ml-auto text-amber-700 group-hover:text-amber-500 text-xl">→</span>
                </div>
              </button>

              <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
                {[
                  { icon: '🗺', title: 'Carte interactive', desc: 'Groupes, waypoints, zones' },
                  { icon: '⚡', title: 'Triggers complets', desc: 'Conditions, actions, flags' },
                  { icon: '📥', title: 'Export direct', desc: ".miz prêt à l'emploi" },
                ].map(f => (
                  <div key={f.title} className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="font-medium text-slate-300 mb-0.5">{f.title}</div>
                    <div className="text-slate-500">{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Générateur Caucase sans miz ── */}
        {!miz && activeTab === 'caucasus' && (
          <div className="absolute inset-0 flex overflow-hidden z-10">
            <div className="w-96 bg-slate-900 border-r border-slate-700/60 flex flex-col overflow-hidden">
              <CaucasusGenerator />
            </div>
            <div className="flex-1 flex items-center justify-center bg-slate-950">
              <div className="text-center text-slate-700 px-8">
                <div className="text-6xl mb-4">🎯</div>
                <div className="text-base font-bold text-slate-500 mb-2">Forge .miz Caucase</div>
                <div className="text-sm text-slate-700 max-w-sm">
                  Configurez le scénario dans le panneau gauche et cliquez sur "Générer le .miz".
                  Le fichier sera directement importable dans DCS Mission Editor.
                  <br /><br />
                  Pour éditer un fichier .miz existant,{' '}
                  <button
                    onClick={() => { setActiveTab('map'); fileRef.current?.click(); }}
                    className="text-amber-600 hover:text-amber-400 underline"
                  >
                    ouvrez un .miz
                  </button>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Layout principal avec miz ── */}
        {miz && (
          <div className="flex h-full w-full">
            {/* Sidebar gauche — navigation */}
            <SideNav activeTab={activeTab} onTabChange={(tab: ActiveTab) => setActiveTab(tab)} />

            {/* Panneau gauche — éditeur */}
            {showLeftPanel && (
              <div className="w-80 flex-shrink-0 bg-slate-900 border-r border-slate-700/60 flex flex-col overflow-hidden z-20">
                <div className="flex items-center gap-2 px-3 h-9 border-b border-slate-700/60 bg-slate-900/80 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                    {panelTitle[activeTab] ?? ''}
                  </span>
                </div>
                <div className="flex-1 overflow-hidden">
                  {activeTab === 'groups'    && <GroupList />}
                  {activeTab === 'triggers'  && <TriggerEditor />}
                  {activeTab === 'weather'   && <WeatherEditor />}
                  {activeTab === 'mist'      && <MistPanel />}
                  {activeTab === 'caucasus'  && <CaucasusGenerator />}
                  {activeTab === 'settings'  && <MissionSettings />}
                </div>
              </div>
            )}

            {/* Carte — zone centrale */}
            <div className="flex-1 relative overflow-hidden">
              <MapView />

              {/* Stats bas gauche */}
              <div className="absolute bottom-3 left-3 z-30 flex gap-2 pointer-events-none">
                {(['blue', 'red', 'neutrals'] as const).map(coal => {
                  const cd = miz.mission.coalition[coal];
                  if (!cd) return null;
                  const countries = Array.isArray(cd.country) ? cd.country : Object.values(cd.country ?? {});
                  if (!countries.length) return null;
                  let g = 0;
                  for (const c of countries) {
                    const cc = c as Record<string, { group: unknown[] }>;
                    for (const cat of ['plane', 'helicopter', 'vehicle', 'ship', 'static']) {
                      const grps = Array.isArray(cc[cat]?.group) ? cc[cat].group : Object.values(cc[cat]?.group ?? {});
                      g += grps.length;
                    }
                  }
                  if (!g) return null;
                  const colors: Record<string, string> = { blue: '#3b82f6', red: '#ef4444', neutrals: '#9ca3af' };
                  return (
                    <div key={coal} className="bg-slate-900/90 backdrop-blur rounded-lg px-2.5 py-1.5 text-xs border border-slate-700/60 shadow-lg">
                      <div className="font-bold" style={{ color: colors[coal] }}>{coal.toUpperCase()}</div>
                      <div className="text-slate-400">{g} groupes</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panneau droit — propriétés */}
            {showRightPanel && (
              <div className="w-80 flex-shrink-0 bg-slate-900 border-l border-slate-700/60 flex flex-col overflow-hidden z-20">
                <div className="flex items-center gap-2 px-3 h-9 border-b border-slate-700/60 flex-shrink-0">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Propriétés</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <UnitPanel />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input fichier caché */}
        <input
          ref={fileRef}
          type="file"
          accept=".miz,.json"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}
