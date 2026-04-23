import type { ActiveTab } from '../../store/missionStore';

const TABS: { id: ActiveTab; label: string; icon: string }[] = [
  { id: 'map',       label: 'Carte',      icon: '🗺️' },
  { id: 'groups',    label: 'Groupes',    icon: '✈️' },
  { id: 'triggers',  label: 'Triggers',   icon: '⚡' },
  { id: 'weather',   label: 'Météo',      icon: '🌤️' },
  { id: 'mist',      label: 'MIST',       icon: '🔧' },
  { id: 'caucasus',  label: 'Nouvelle',   icon: '🎯' },
  { id: 'settings',  label: 'Mission',    icon: '⚙️' },
];

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  hasMiz: boolean;
}

export default function BottomNav({ activeTab, onTabChange, hasMiz }: BottomNavProps) {
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 h-13 bg-slate-900/95 border-t border-slate-700 z-40 flex items-center backdrop-blur-sm"
      style={{ height: '52px' }}
    >
      <div className="flex items-center h-full px-2 gap-0.5">
        {TABS.map(tab => {
          // Désactiver les onglets qui nécessitent un miz (sauf map, caucasus, generator)
          const requiresMiz = !['map', 'caucasus'].includes(tab.id);
          const disabled = requiresMiz && !hasMiz;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => !disabled && onTabChange(tab.id)}
              disabled={disabled}
              className={`flex flex-col items-center justify-center px-3 h-10 rounded-md text-xs transition-all min-w-[56px] ${
                isActive
                  ? 'bg-amber-600 text-white font-medium'
                  : disabled
                  ? 'text-slate-600 cursor-not-allowed'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="mt-0.5 leading-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
