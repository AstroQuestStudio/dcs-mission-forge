import type { ActiveTab } from '../../store/missionStore';

const TABS: { id: ActiveTab; icon: string; label: string }[] = [
  { id: 'map',      icon: '🗺️', label: 'Carte' },
  { id: 'groups',   icon: '✈️', label: 'Groupes' },
  { id: 'triggers', icon: '⚡', label: 'Triggers' },
  { id: 'weather',  icon: '🌤️', label: 'Météo' },
  { id: 'mist',     icon: '🔧', label: 'MIST' },
  { id: 'caucasus', icon: '🎯', label: 'Nouveau' },
  { id: 'settings', icon: '⚙️', label: 'Mission' },
];

interface SideNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export default function SideNav({ activeTab, onTabChange }: SideNavProps) {
  return (
    <nav className="w-16 flex-shrink-0 bg-slate-900 border-r border-slate-700/60 flex flex-col items-center py-2 gap-1 z-30">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-[9px] ${
              isActive
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span className="leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
