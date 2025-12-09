import React from 'react';
import { Box, Wand2, Sparkles, Layers } from 'lucide-react';
import { AppMode } from '../types';

interface NavbarProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentMode, onModeChange }) => {
  const navItems = [
    { id: 'mockup', label: 'Mockup', icon: Box, color: 'text-teal-400' },
    { id: 'editor', label: 'Editor', icon: Wand2, color: 'text-indigo-400' },
    { id: 'pro', label: 'Pro Studio', icon: Sparkles, color: 'text-fuchsia-400' },
  ];

  return (
    <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-slate-100">Mockup<span className="text-blue-500">Studio</span></span>
        </div>

        <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onModeChange(item.id as AppMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentMode === item.id 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <item.icon className={`w-4 h-4 ${currentMode === item.id ? item.color : ''}`} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
