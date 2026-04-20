import type { ReactNode } from 'react';

interface RightDrawerProps {
  isOpen: boolean;
  children: ReactNode;
}

export default function RightDrawer({ isOpen, children }: RightDrawerProps) {
  return (
    <div
      className={`absolute right-0 top-0 bottom-0 z-40 w-64 bg-slate-900/95 backdrop-blur-sm border-l border-slate-700 flex flex-col overflow-hidden transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {children}
    </div>
  );
}
