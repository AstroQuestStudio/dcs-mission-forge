import type { ReactNode } from 'react';

interface LeftDrawerProps {
  isOpen: boolean;
  activeTab: string;
  children: ReactNode;
}

export default function LeftDrawer({ isOpen, children }: LeftDrawerProps) {
  return (
    <div
      className={`absolute left-0 top-0 bottom-0 z-40 w-72 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 flex flex-col overflow-hidden transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {children}
    </div>
  );
}
