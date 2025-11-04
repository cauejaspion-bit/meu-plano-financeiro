import React, { useState } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { Login } from './components/Login';
import { ExpensesTab } from './components/expenses/ExpensesTab';
import { ProfileTab } from './components/profile/ProfileTab';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { UserManagementTab } from './components/admin/UserManagementTab';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { Shield, LogOut, Users } from 'lucide-react';

function App() {
  const { user, login, register, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('perfil');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} onRegister={register} />;
  }

  if (user.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-slate-600/50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg blur opacity-50"></div>
                  <div className="relative bg-slate-800 p-2.5 rounded-lg border border-red-500/50">
                    <Shield className="h-6 w-6 text-red-400" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Painel Admin
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gestão do Sistema
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-700/30 rounded-lg border border-slate-600/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-slate-400">Administrador</div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:inline">Sair</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 border-t border-slate-600/50 pt-4">
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'usuarios'
                    ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Users className="h-4 w-4" />
                Usuários
              </button>
            </div>
          </div>
        </div>

        <main className="py-8">
          {activeTab === 'usuarios' && <UserManagementTab />}
        </main>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return <ProfileTab userId={user.id} />;
      case 'gastos':
        return <ExpensesTab userId={user.id} />;
      case 'dashboard':
        return <DashboardTab userId={user.id} />;
      default:
        return <ProfileTab userId={user.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 transition-colors">
      <Header user={user} onLogout={logout} theme={theme} onThemeToggle={toggleTheme} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default App;