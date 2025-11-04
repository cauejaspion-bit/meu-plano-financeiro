import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Theme } from '../hooks/useTheme';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="relative inline-flex h-8 w-14 items-center rounded-full bg-slate-700/50 border border-slate-600/50 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-slate-700"
      aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-gradient-to-br from-emerald-400 to-blue-400 transition-all shadow-lg ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
      <Sun className={`absolute left-2 h-4 w-4 text-yellow-400 transition-all ${
        theme === 'dark' ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
      }`} />
      <Moon className={`absolute right-2 h-4 w-4 text-blue-300 transition-all ${
        theme === 'dark' ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      }`} />
    </button>
  );
};