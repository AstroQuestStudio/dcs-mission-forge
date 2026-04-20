import { useRef, useState, useCallback } from 'react';
import { useMissionStore } from './store/missionStore';
import { parseMiz, buildMiz, downloadBlob } from './utils/mizParser';
import { generateMistLua } from './utils/mistGenerator';
import MapView from './components/MapView';
import GroupList from './components/GroupList';
import UnitPanel from './components/UnitPanel';
import WeatherEditor from './components/WeatherEditor';
import MistPanel from './components/MistPanel';
import MissionSettings from './components/MissionSettings';
import TriggerEditor from './components/TriggerEditor';
import type { ActiveTab } from './store/missionStore';

const TABS: { id: ActiveTab; label: string; icon: string; desc: string }[] = [
  { id: 'map',      label: 'Carte',    icon: '🗺', desc: 'Vue carte interactive' },
  { id: 'groups',   label: 'Groupes',  icon: '✈', desc: 'Groupes & unités' },
  { id: 'triggers', label: 'Triggers', icon: '⚡', desc: 'Zones & règles trigger' },
  { id: 'weather',  label: 'Météo',    icon: '🌤', desc: 'Conditions météo' },
  { id: 'mist',     label: 'MIST',     icon: '🔧', desc: 'Scripts MIST no-code' },
  { id: 'settings', label: 'Mission',  icon: '⚙', desc: 'Infos & paramètres' },
];

const COAL_COLORS: Record<string, string> = {
  blue: '#3b82f6',
  red: '#ef4444',
  neutrals: '#9ca3af',
};

export default function App() {
  const miz = useMissionStore(s => s.miz);
  const loadMiz = useMissionStore(s => s.loadMiz);
  const clearMiz = useMissionStore(s => s.clearMiz);
  const activeTab = useMissionStore(s => s.activeTab);
  const setActiveTab = useMissionStore(s => s.setActiveTab);
  const mistConfig = useMissionStore(s => s.mistConfig);
  const isDirty = useMissionStore(s => s.isDirty);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.miz')) {
      setError('Fichier invalide — sélectionnez un fichier .miz');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseMiz(file);
      loadMiz(parsed);
    } catch (e) {
      setError(`Erreur de lecture : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  }, [loadMiz]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleExport = async () => {
    if (!miz) return;
    setLoading(true);
    try {
      const extraLua = generateMistLua(mistConfig) || undefined;
      const blob = await buildMiz(miz, extraLua);
      const base = miz.mission.sortie || 'mission';
      downloadBlob(blob, `${base}_forge.miz`);
    } catch (e) {
      setError(`Erreur d'export : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  // Stats rapides
  const stats = miz ? (() => {
    let groups = 0, units = 0;
    const coals = miz.mission.coalition as Record<string, { country: unknown[] }>;
    for (const coal of Object.values(coals)) {
      const countries = Array.isArray(coal?.country) ? coal.country : Object.values(coal?.country ?? {});
      for (const c of countries) {
        const country = c as Record<string, { group: unknown[] }>;
        for (const cat of ['plane','helicopter','vehicle','ship','static']) {
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
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden select-none">
      {/* ── Topbar ── */}
      <header className="flex items-center gap-3 px-4 h-11 bg-slate-900 border-b border-slate-700/60 flex-shrink-0 shadow-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-black text-white shadow">F</div>
          <span className="font-bold text-slate-100 text-sm tracking-tight">DCS Mission Forge</span>
        </div>

        {/* Infos mission */}
        {miz && (
          <div className="flex items-center gap-2">
            <div className="h-4 w-px bg-slate-700" />
            <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              {miz.theatre}
            </span>
            {miz.mission.sortie && (
              <span className="text-xs text-slate-400 truncate max-w-48">{miz.mission.sortie}</span>
            )}
            {stats && (
              <span className="text-xs text-slate-500">
                {stats.groups} groupes · {stats.units} unités
              </span>
            )}
            {isDirty && (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                Non sauvegardé
              </span>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {miz && (
            <>
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-all shadow"
              >
                <span>↓</span>
                <span>{loading ? 'Export…' : 'Exporter .miz'}</span>
              </button>
              <button
                onClick={clearMiz}
                className="text-xs px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
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
            <span>+</span>
            <span>{loading ? 'Chargement…' : 'Ouvrir .miz'}</span>
          </button>
          <input ref={fileRef} type="file" accept=".miz" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>
      </header>

      {/* Erreur */}
      {error && (
        <div className="flex items-center justify-between bg-red-950 border-b border-red-800 text-red-300 text-xs px-4 py-2">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-300 ml-4">✕</button>
        </div>
      )}

      {/* ── Écran d'accueil ── */}
      {!miz && (
        <div
          className="flex-1 flex items-center justify-center bg-slate-950"
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="w-full max-w-xl px-6">
            {/* Hero */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-2xl mx-auto mb-5">F</div>
              <h1 className="text-3xl font-bold text-slate-100 mb-2">DCS Mission Forge</h1>
              <p className="text-slate-400 text-sm">Éditeur de missions DCS World · Théâtre Caucase · Support MIST</p>
            </div>

            {/* Drop zone */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer mb-6 ${
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
              <div className="text-slate-500 text-sm">ou cliquez pour parcourir</div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
              {[
                { icon: '🗺', title: 'Carte interactive', desc: 'Aérodromes, unités, waypoints' },
                { icon: '🔧', title: 'MIST no-code', desc: 'Respawn, zones, presets' },
                { icon: '📥', title: 'Export direct', desc: 'Fichier .miz prêt à l\'emploi' },
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

      {/* ── Layout principal ── */}
      {miz && (
        <div className="flex-1 flex overflow-hidden">

          {/* Sidebar nav verticale */}
          <nav className="flex flex-col bg-slate-900 border-r border-slate-700/60 w-14 flex-shrink-0 py-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.desc}
                className={`group relative flex flex-col items-center justify-center py-3 px-1 text-xs transition-all border-l-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-800 border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-500 hover:bg-slate-800/70 hover:text-slate-300'
                }`}
              >
                <span className="text-xl leading-none">{tab.icon}</span>
                <span className="text-[9px] mt-1 leading-tight tracking-wide">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Panneau gauche (non-carte) */}
          {activeTab !== 'map' && (
            <aside className="w-72 bg-slate-900 border-r border-slate-700/60 flex flex-col overflow-hidden flex-shrink-0">
              <div className="flex items-center gap-2 px-3 h-9 border-b border-slate-700/60 bg-slate-900/80">
                <span className="text-sm">{TABS.find(t => t.id === activeTab)?.icon}</span>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  {TABS.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                {activeTab === 'groups'   && <GroupList />}
                {activeTab === 'triggers' && <TriggerEditor />}
                {activeTab === 'weather'  && <WeatherEditor />}
                {activeTab === 'mist'     && <MistPanel />}
                {activeTab === 'settings' && <MissionSettings />}
              </div>
            </aside>
          )}

          {/* Carte principale */}
          <main className="flex-1 relative overflow-hidden">
            <MapView />

            {/* Overlay coalition stats bas gauche */}
            <div className="absolute bottom-3 left-3 z-[500] flex gap-2 pointer-events-none">
              {(['blue','red','neutrals'] as const).map(coal => {
                const cd = miz.mission.coalition[coal];
                if (!cd) return null;
                const countries = Array.isArray(cd.country) ? cd.country : Object.values(cd.country ?? {});
                if (!countries.length) return null;
                let g = 0;
                for (const c of countries) {
                  const cc = c as Record<string, { group: unknown[] }>;
                  for (const cat of ['plane','helicopter','vehicle','ship','static']) {
                    const grps = Array.isArray(cc[cat]?.group) ? cc[cat].group : Object.values(cc[cat]?.group ?? {});
                    g += grps.length;
                  }
                }
                if (!g) return null;
                return (
                  <div key={coal} className="bg-slate-900/90 backdrop-blur rounded-lg px-2.5 py-1.5 text-xs border border-slate-700/60 shadow-lg">
                    <div className="font-bold" style={{ color: COAL_COLORS[coal] }}>{coal.toUpperCase()}</div>
                    <div className="text-slate-400">{g} groupes</div>
                  </div>
                );
              })}
            </div>
          </main>

          {/* Panneau droit — propriétés */}
          <aside className="w-64 bg-slate-900 border-l border-slate-700/60 flex flex-col overflow-hidden flex-shrink-0">
            <div className="flex items-center gap-2 px-3 h-9 border-b border-slate-700/60">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Propriétés</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <UnitPanel />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
