import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { CheckCircle, XCircle, ToggleRight, ToggleLeft, Users } from 'lucide-react';

export const UserManagementTab: React.FC = () => {
  const { getAllUsersWithStatus, updateUserStatus } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState<'todos' | 'ativos' | 'inativos'>('todos');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getAllUsersWithStatus();
    setUsers(allUsers);
  };

  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    updateUserStatus(userId, !currentStatus);
    setUsers(users.map(u =>
      u.id === userId ? { ...u, isActive: !currentStatus } : u
    ));
    setSuccessMessage(`Usuário ${!currentStatus ? 'ativado' : 'inativado'} com sucesso`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const filteredUsers = users.filter(u => {
    if (filter === 'ativos') return u.isActive;
    if (filter === 'inativos') return !u.isActive;
    return true;
  });

  const stats = {
    total: users.length,
    ativos: users.filter(u => u.isActive).length,
    inativos: users.filter(u => !u.isActive).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Gerenciamento de Usuários
        </h2>
        <p className="text-slate-400">
          Gerencie e monitore todos os usuários do sistema
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-lg p-4 flex items-center gap-3 backdrop-blur-sm">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 border border-slate-600/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 text-sm font-medium">Total de Usuários</span>
            <Users className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg p-6 border border-emerald-500/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300 text-sm font-medium">Usuários Ativos</span>
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-300">{stats.ativos}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg p-6 border border-red-500/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-300 text-sm font-medium">Usuários Inativos</span>
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-bold text-red-300">{stats.inativos}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {(['todos', 'ativos', 'inativos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-lg'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg p-12 text-center border border-slate-700">
          <XCircle className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Data de Cadastro</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Último Acesso</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{user.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-400 text-sm">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-400 text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {user.isActive ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-300">Ativo</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/50 rounded-full">
                            <XCircle className="h-4 w-4 text-red-400" />
                            <span className="text-sm font-medium text-red-300">Inativo</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 ${
                          user.isActive
                            ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/50'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/50'
                        }`}
                      >
                        {user.isActive ? (
                          <>
                            <ToggleRight className="h-4 w-4" />
                            <span className="text-sm">Desativar</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="h-4 w-4" />
                            <span className="text-sm">Ativar</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
