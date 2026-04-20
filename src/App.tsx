import { useRef, useState } from 'react';
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

const TABS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: 'map', label: 'Carte', icon: '🗺️' },
  { id: 'groups', label: 'Groupes', icon: '✈' },
  { id: 'triggers', label: 'Triggers', icon: '⚡' },
  { id: 'weather', label: 'Météo', icon: '🌤' },
  { id: 'mist', label: 'MIST', icon: '🔧' },
  { id: 'settings', label: 'Mission', icon: '⚙️' },
];

export default function App() {
  const { miz, loadMiz, clearMiz, activeTab, setActiveTab, mistConfig, isDirty } = useMissionStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = async (file: File) => {
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleExport = async () => {
    if (!miz) return;
    setLoading(true);
    try {
      const extraLua = generateMistLua(mistConfig) || undefined;
      const blob = await buildMiz(miz, extraLua);
      const name = `mission_forge_${Date.now()}.miz`;
      downloadBlob(blob, name);
    } catch (e) {
      setError(`Erreur d'export : ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-blue-400 font-bold text-lg tracking-tight">🛩 DCS Mission Forge</span>
          {miz && (
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {miz.theatre} {isDirty && <span className="text-amber-400">●</span>}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {miz && (
            <>
              <button
                onClick={handleExport}
                disabled={loading}
                className="bg-green-700 hover:bg-green-600 disabled:bg-slate-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
              >
                {loading ? '…' : '↓ Exporter .miz'}
              </button>
              <button
                onClick={clearMiz}
                className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs px-3 py-1.5 rounded transition-colors"
              >
                Fermer
              </button>
            </>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
          >
            {loading ? '…' : '+ Charger .miz'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".miz"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      </header>

      {error && (
        <div className="bg-red-900 border-b border-red-700 text-red-200 text-xs px-4 py-2 flex justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">×</button>
        </div>
      )}

      {/* Zone drag & drop quand pas de fichier */}
      {!miz && (
        <div
          className="flex-1 flex flex-col items-center justify-center"
          onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
        >
          <div className={`
            border-2 border-dashed rounded-2xl p-16 text-center transition-colors max-w-lg mx-4
            ${isDragOver ? 'border-blue-400 bg-blue-900/20' : 'border-slate-600 bg-slate-900'}
          `}>
            <div className="text-6xl mb-4">🛩</div>
            <h2 className="text-2xl font-bold text-slate-200 mb-2">DCS Mission Forge</h2>
            <p className="text-slate-400 mb-2">Éditeur de missions DCS World — Carte Caucase</p>
            <p className="text-xs text-slate-500 mb-6">Support MIST natif · Drag &amp; drop · Export direct</p>
            <div className={`
              text-slate-300 border rounded-xl py-8 px-6 mb-6 transition-colors
              ${isDragOver ? 'border-blue-400 bg-blue-900/30' : 'border-slate-600 bg-slate-800'}
            `}>
              <div className="text-4xl mb-3">📁</div>
              <div className="text-sm">Glissez-déposez votre fichier <strong>.miz</strong> ici</div>
              <div className="text-xs text-slate-500 mt-1">ou</div>
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Parcourir…
            </button>
            <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-slate-500">
              <div className="bg-slate-800 rounded p-2">✈ Unités<br/>éditables</div>
              <div className="bg-slate-800 rounded p-2">🔧 MIST<br/>no-code</div>
              <div className="bg-slate-800 rounded p-2">📥 Export<br/>.miz direct</div>
            </div>
          </div>
        </div>
      )}

      {/* Layout principal */}
      {miz && (
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar gauche — navigation */}
          <nav className="flex flex-col bg-slate-900 border-r border-slate-700 w-16 flex-shrink-0">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={tab.label}
                className={`flex flex-col items-center justify-center py-3 px-1 text-xs transition-colors border-l-2 ${
                  activeTab === tab.id
                    ? 'bg-slate-800 border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-[9px] mt-0.5 leading-tight text-center">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Panneau gauche (contenu selon onglet) */}
          {activeTab !== 'map' && (
            <aside className="w-72 bg-slate-900 border-r border-slate-700 flex flex-col overflow-hidden flex-shrink-0">
              <div className="px-3 py-2 border-b border-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wide">
                {TABS.find(t => t.id === activeTab)?.label}
              </div>
              <div className="flex-1 overflow-hidden">
                {activeTab === 'groups' && <GroupList />}
                {activeTab === 'triggers' && <TriggerEditor />}
                {activeTab === 'weather' && <WeatherEditor />}
                {activeTab === 'mist' && <MistPanel />}
                {activeTab === 'settings' && <MissionSettings />}
              </div>
            </aside>
          )}

          {/* Carte */}
          <main className="flex-1 relative overflow-hidden">
            <MapView />
          </main>

          {/* Panneau droit — propriétés unité */}
          <aside className="w-64 bg-slate-900 border-l border-slate-700 flex flex-col overflow-hidden flex-shrink-0">
            <div className="px-3 py-2 border-b border-slate-700 text-xs font-bold text-slate-300 uppercase tracking-wide">
              Propriétés
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
