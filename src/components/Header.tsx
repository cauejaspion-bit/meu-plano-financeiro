import React from 'react';
import { LogOut, User, DollarSign } from 'lucide-react';
import { User as UserType } from '../types';
import { ThemeToggle } from './ThemeToggle';
import { Theme } from '../hooks/useTheme';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  theme: Theme;
  onThemeToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, theme, onThemeToggle }) => {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-50"></div>
              <div className="relative bg-slate-800 p-2.5 rounded-lg border border-emerald-500/50">
                <DollarSign className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Finança
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Organize suas finanças
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600/50">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-sm font-medium text-white">{user.name}</div>
            </div>
            <ThemeToggle theme={theme} onToggle={onThemeToggle} />
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};