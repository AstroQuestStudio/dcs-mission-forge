interface TopBarProps {
  theatre: string | null;
  missionName: string;
  groupCount: number;
  unitCount: number;
  isDirty: boolean;
  loading: boolean;
  onExport: () => void;
  onOpen: () => void;
  onClose: () => void;
  hasMiz: boolean;
}

export default function TopBar({
  theatre,
  missionName,
  groupCount,
  unitCount,
  isDirty,
  loading,
  onExport,
  onOpen,
  onClose,
  hasMiz,
}: TopBarProps) {
  return (
    <header className="flex items-center gap-3 px-4 h-11 bg-slate-900 border-b border-slate-700 flex-shrink-0 shadow-lg z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-sm font-black text-white shadow">
          F
        </div>
        <span className="font-bold text-slate-100 text-sm tracking-tight">DCS Mission Forge</span>
      </div>

      {/* Infos mission */}
      {hasMiz && (
        <div className="flex items-center gap-2">
          <div className="h-4 w-px bg-slate-700" />
          {theatre && (
            <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
              {theatre}
            </span>
          )}
          {missionName && (
            <span className="text-xs text-slate-400 truncate max-w-48">{missionName}</span>
          )}
          {(groupCount > 0 || unitCount > 0) && (
            <span className="text-xs text-slate-500">
              {groupCount} grp · {unitCount} unités
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
        {hasMiz && (
          <>
            <button
              onClick={onExport}
              disabled={loading}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-all shadow"
            >
              <span>↓</span>
              <span>{loading ? 'Export…' : 'Exporter .miz'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-xs px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
            >
              Fermer
            </button>
          </>
        )}
        <button
          onClick={onOpen}
          disabled={loading}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-all shadow"
        >
          <span>+</span>
          <span>{loading ? 'Chargement…' : 'Ouvrir .miz'}</span>
        </button>
      </div>
    </header>
  );
}
