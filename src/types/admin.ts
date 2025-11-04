export interface AdminUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
  lastLogin?: string;
}

export interface UserManagement {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  financialProfile?: {
    monthlySalary: number;
    emergencyFund: number;
    savingsGoalPercentage: number;
  };
  totalExpenses: number;
  expenseCount: number;
  emergencyFundBalance: number;
}

export interface UserActivity {
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/hooks/useAdminAuth.ts</parameter>
<parameter name="file_text">import { useState, useEffect } from 'react';
import { AdminUser } from '../types/admin';

export const useAdminAuth = () => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAdmin = localStorage.getItem('adminUser');
    if (storedAdmin) {
      setAdminUser(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    // Credenciais hardcoded para admin (você pode alterar)
    const adminCredentials = [
      {
        id: 'admin-1',
        email: 'admin@financeiro.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'super_admin' as const,
        createdAt: new Date().toISOString(),
      }
    ];

    const admin = adminCredentials.find(
      cred => cred.email === email && cred.password === password
    );

    if (admin) {
      const adminData = {
        ...admin,
        lastLogin: new Date().toISOString(),
      };
      setAdminUser(adminData);
      localStorage.setItem('adminUser', JSON.stringify(adminData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminUser');
  };

  return { adminUser, login, logout, loading };
};
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/hooks/useUserManagement.ts</parameter>
<parameter name="file_text">import { useState, useEffect } from 'react';
import { UserManagement, UserActivity } from '../types/admin';

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserManagement[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);

  useEffect(() => {
    loadUsers();
    loadActivities();
  }, []);

  const loadUsers = () => {
    // Carregar todos os usuários do localStorage
    const allUsers: UserManagement[] = [];
    
    // Buscar por todas as chaves que começam com 'currentUser' ou dados de usuários
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === 'currentUser') {
        try {
          const userData = JSON.parse(localStorage.getItem(key) || '{}');
          if (userData.id) {
            const userManagement = createUserManagement(userData);
            allUsers.push(userManagement);
          }
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
        }
      }
    }

    // Buscar usuários únicos baseado em dados financeiros
    const uniqueUserIds = new Set<string>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('financial_profile_')) {
        const userId = key.replace('financial_profile_', '');
        uniqueUserIds.add(userId);
      }
    }

    // Adicionar usuários que só têm dados financeiros
    uniqueUserIds.forEach(userId => {
      if (!allUsers.find(u => u.id === userId)) {
        const userManagement = createUserManagementFromId(userId);
        if (userManagement) {
          allUsers.push(userManagement);
        }
      }
    });

    setUsers(allUsers);
  };

  const createUserManagement = (userData: any): UserManagement => {
    const userId = userData.id;
    
    // Buscar dados financeiros
    const financialProfile = getFinancialProfile(userId);
    const expenses = getExpenses(userId);
    const emergencyContributions = getEmergencyContributions(userId);
    
    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.value, 0);
    const emergencyFundBalance = emergencyContributions.reduce((sum: number, contrib: any) => {
      return contrib.type === 'deposit' ? sum + contrib.amount : sum - contrib.amount;
    }, 0);

    return {
      id: userId,
      email: userData.email || 'N/A',
      name: userData.name || 'Usuário',
      isActive: getActiveStatus(userId),
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: userData.lastLogin,
      financialProfile,
      totalExpenses,
      expenseCount: expenses.length,
      emergencyFundBalance,
    };
  };

  const createUserManagementFromId = (userId: string): UserManagement | null => {
    const financialProfile = getFinancialProfile(userId);
    if (!financialProfile) return null;

    const expenses = getExpenses(userId);
    const emergencyContributions = getEmergencyContributions(userId);
    
    const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + expense.value, 0);
    const emergencyFundBalance = emergencyContributions.reduce((sum: number, contrib: any) => {
      return contrib.type === 'deposit' ? sum + contrib.amount : sum - contrib.amount;
    }, 0);

    return {
      id: userId,
      email: 'N/A',
      name: `Usuário ${userId.slice(0, 8)}`,
      isActive: getActiveStatus(userId),
      createdAt: new Date().toISOString(),
      financialProfile,
      totalExpenses,
      expenseCount: expenses.length,
      emergencyFundBalance,
    };
  };

  const getFinancialProfile = (userId: string) => {
    try {
      const profile = localStorage.getItem(`financial_profile_${userId}`);
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  };

  const getExpenses = (userId: string) => {
    try {
      const expenses = localStorage.getItem(`expenses_${userId}`);
      return expenses ? JSON.parse(expenses) : [];
    } catch {
      return [];
    }
  };

  const getEmergencyContributions = (userId: string) => {
    try {
      const contributions = localStorage.getItem(`emergency_contributions_${userId}`);
      return contributions ? JSON.parse(contributions) : [];
    } catch {
      return [];
    }
  };

  const getActiveStatus = (userId: string): boolean => {
    const status = localStorage.getItem(`user_active_${userId}`);
    return status !== 'false'; // Por padrão, usuários são ativos
  };

  const toggleUserStatus = (userId: string) => {
    const currentStatus = getActiveStatus(userId);
    const newStatus = !currentStatus;
    
    localStorage.setItem(`user_active_${userId}`, newStatus.toString());
    
    // Registrar atividade
    logActivity(userId, newStatus ? 'Usuário ativado' : 'Usuário desativado');
    
    // Recarregar usuários
    loadUsers();
  };

  const deleteUser = (userId: string) => {
    // Remover todos os dados do usuário
    const keysToRemove = [
      `financial_profile_${userId}`,
      `expenses_${userId}`,
      `emergency_contributions_${userId}`,
      `user_active_${userId}`,
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Se for o usuário atual logado, remover também
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      if (userData.id === userId) {
        localStorage.removeItem('currentUser');
      }
    }

    logActivity(userId, 'Usuário excluído');
    loadUsers();
  };

  const loadActivities = () => {
    try {
      const storedActivities = localStorage.getItem('admin_activities');
      if (storedActivities) {
        setActivities(JSON.parse(storedActivities));
      }
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const logActivity = (userId: string, action: string, details?: string) => {
    const newActivity: UserActivity = {
      userId,
      action,
      timestamp: new Date().toISOString(),
      details,
    };

    const updatedActivities = [newActivity, ...activities].slice(0, 100); // Manter apenas as últimas 100
    setActivities(updatedActivities);
    localStorage.setItem('admin_activities', JSON.stringify(updatedActivities));
  };

  return {
    users,
    activities,
    toggleUserStatus,
    deleteUser,
    loadUsers,
    logActivity,
  };
};
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/AdminLogin.tsx</parameter>
<parameter name="file_text">import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield, LogIn, AlertCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string, password: string) => boolean;
}

interface LoginForm {
  email: string;
  password: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    
    // Simular loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const success = onLogin(data.email, data.password);
    
    if (!success) {
      setError('Email ou senha incorretos');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Painel Administrativo
          </h2>
          <p className="text-gray-300">
            Acesso restrito para administradores
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email do Administrador
              </label>
              <input
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                type="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="admin@exemplo.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                {...register('password', { required: 'Senha é obrigatória' })}
                type="password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Entrando...
                </div>
              ) : (
                <div className="flex items-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar no Painel
                </div>
              )}
            </button>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Credenciais de Teste:</h3>
            <div className="text-gray-300 text-sm space-y-1">
              <p><strong>Email:</strong> admin@financeiro.com</p>
              <p><strong>Senha:</strong> admin123</p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/AdminHeader.tsx</parameter>
<parameter name="file_text">import React from 'react';
import { LogOut, Shield, Users, Activity } from 'lucide-react';
import { AdminUser } from '../../types/admin';

interface AdminHeaderProps {
  adminUser: AdminUser;
  onLogout: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ 
  adminUser, 
  onLogout, 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'activities', label: 'Atividades', icon: Activity },
  ];

  return (
    <div className="bg-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <div className="bg-red-600 p-2 rounded-lg mr-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Painel Administrativo
              </h1>
              <p className="text-sm text-gray-300">
                Gestão de usuários e sistema
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-gray-300">
              <span className="text-sm font-medium">{adminUser.name}</span>
              <span className="ml-2 px-2 py-1 bg-red-600 text-xs rounded-full text-white">
                {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="text-sm">Sair</span>
            </button>
          </div>
        </div>
        
        {/* Navegação */}
        <div className="flex space-x-8 border-t border-slate-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/UserManagementTab.tsx</parameter>
<parameter name="file_text">import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  UserX, 
  UserCheck, 
  Trash2,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { UserManagement } from '../../types/admin';
import { useUserManagement } from '../../hooks/useUserManagement';
import { formatCurrency } from '../../utils/currency';

export const UserManagementTab: React.FC = () => {
  const { users, toggleUserStatus, deleteUser, loadUsers } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<UserManagement | null>(null);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleToggleStatus = (userId: string) => {
    if (confirm('Tem certeza que deseja alterar o status deste usuário?')) {
      toggleUserStatus(userId);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('ATENÇÃO: Esta ação irá excluir permanentemente todos os dados do usuário. Tem certeza?')) {
      deleteUser(userId);
      setSelectedUser(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = totalUsers - activeUsers;
  const totalExpenses = users.reduce((sum, user) => sum + user.totalExpenses, 0);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuários Inativos</p>
              <p className="text-2xl font-bold text-red-600">{inactiveUsers}</p>
            </div>
            <UserX className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Gastos</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalExpenses)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
            
            <button
              onClick={loadUsers}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dados Financeiros
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Atividade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.isActive)}`}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Salário: {user.financialProfile ? formatCurrency(user.financialProfile.monthlySalary) : 'N/A'}</div>
                      <div>Gastos: {formatCurrency(user.totalExpenses)} ({user.expenseCount})</div>
                      <div>Reserva: {formatCurrency(user.emergencyFundBalance)}</div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="space-y-1">
                      <div>Criado: {formatDate(user.createdAt)}</div>
                      {user.lastLogin && (
                        <div>Último login: {formatDate(user.lastLogin)}</div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleStatus(user.id)}
                        className={`${user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                        title={user.isActive ? 'Desativar usuário' : 'Ativar usuário'}
                      >
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Ainda não há usuários cadastrados no sistema.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Detalhes do Usuário</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informações Básicas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nome:</span>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.isActive)}`}>
                      {selectedUser.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <p className="font-mono text-xs">{selectedUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Dados Financeiros */}
              {selectedUser.financialProfile && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Perfil Financeiro</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Salário Mensal:</span>
                      <p className="font-medium text-green-600">
                        {formatCurrency(selectedUser.financialProfile.monthlySalary)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Meta de Economia:</span>
                      <p className="font-medium">
                        {selectedUser.financialProfile.savingsGoalPercentage}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reserva de Emergência:</span>
                      <p className="font-medium text-blue-600">
                        {formatCurrency(selectedUser.emergencyFundBalance)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Total de Gastos:</span>
                      <p className="font-medium text-red-600">
                        {formatCurrency(selectedUser.totalExpenses)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Estatísticas</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Número de Gastos:</span>
                    <p className="font-medium">{selectedUser.expenseCount}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Cadastrado em:</span>
                    <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                  </div>
                  {selectedUser.lastLogin && (
                    <div>
                      <span className="text-gray-500">Último Login:</span>
                      <p className="font-medium">{formatDate(selectedUser.lastLogin)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleStatus(selectedUser.id)}
                  className={`flex-1 py-2 px-4 rounded-md font-medium ${
                    selectedUser.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedUser.isActive ? 'Desativar Usuário' : 'Ativar Usuário'}
                </button>
                
                <button
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-medium"
                >
                  Excluir Usuário
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/components/admin/ActivitiesTab.tsx</parameter>
<parameter name="file_text">import React from 'react';
import { Activity, Clock, User, AlertCircle } from 'lucide-react';
import { useUserManagement } from '../../hooks/useUserManagement';

export const ActivitiesTab: React.FC = () => {
  const { activities, users } = useUserManagement();

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `Usuário ${userId.slice(0, 8)}`;
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('ativado')) return <User className="h-4 w-4 text-green-500" />;
    if (action.includes('desativado')) return <User className="h-4 w-4 text-red-500" />;
    if (action.includes('excluído')) return <AlertCircle className="h-4 w-4 text-red-600" />;
    return <Activity className="h-4 w-4 text-blue-500" />;
  };

  const getActivityColor = (action: string) => {
    if (action.includes('ativado')) return 'bg-green-50 border-green-200';
    if (action.includes('desativado')) return 'bg-red-50 border-red-200';
    if (action.includes('excluído')) return 'bg-red-100 border-red-300';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Log de Atividades</h2>
        <div className="bg-slate-700 px-3 py-1 rounded-full">
          <span className="text-sm text-gray-300">{activities.length} registros</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma atividade registrada</h3>
          <p className="text-gray-500">
            As atividades administrativas aparecerão aqui quando forem realizadas.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border p-4 ${getActivityColor(activity.action)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.action)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600">
                        Usuário: {getUserName(activity.userId)}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.details}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/AdminApp.tsx</parameter>
<parameter name="file_text">import React, { useState } from 'react';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminHeader } from './components/admin/AdminHeader';
import { UserManagementTab } from './components/admin/UserManagementTab';
import { ActivitiesTab } from './components/admin/ActivitiesTab';
import { useAdminAuth } from './hooks/useAdminAuth';

function AdminApp() {
  const { adminUser, login, logout, loading } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('users');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return <AdminLogin onLogin={login} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementTab />;
      case 'activities':
        return <ActivitiesTab />;
      default:
        return <UserManagementTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <AdminHeader 
        adminUser={adminUser} 
        onLogout={logout} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <main className="py-8">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default AdminApp;
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">admin.html</parameter>
<parameter name="file_text"><!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Painel Administrativo - Controle Financeiro</title>
  </head>
  <body>
    <div id="admin-root"></div>
    <script type="module" src="/src/admin-main.tsx"></script>
  </body>
</html>
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">create</parameter>
<parameter name="path">src/admin-main.tsx</parameter>
<parameter name="file_text">import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminApp from './AdminApp.tsx';
import './index.css';

createRoot(document.getElementById('admin-root')!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>
);
</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">str_replace</parameter>
<parameter name="path">vite.config.ts</parameter>
<parameter name="old_str">import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});</parameter>
<parameter name="new_str">import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html'
      }
    }
  }
});</parameter>
</invoke>

<invoke name="str_replace_editor">
<parameter name="command">str_replace</parameter>
<parameter name="path">src/hooks/useAuth.ts</parameter>
<parameter name="old_str">  const login = (email: string, name: string) => {
    const userData: User = {
      id: Date.now().toString(),
      email,
      name,
    };
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };</parameter>
<parameter name="new_str">  const login = (email: string, name: string) => {
    // Verificar se o usuário está ativo
    const existingUserId = findExistingUserId(email);
    if (existingUserId) {
      const isActive = localStorage.getItem(`user_active_${existingUserId}`) !== 'false';
      if (!isActive) {
        alert('Sua conta foi desativada. Entre em contato com o administrador.');
        return;
      }
    }

    const userData: User = {
      id: existingUserId || Date.now().toString(),
      email,
      name,
    };
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const findExistingUserId = (email: string): string | null => {
    // Buscar por usuário existente com o mesmo email
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('financial_profile_')) {
        const userId = key.replace('financial_profile_', '');
        // Verificar se existe dados para este usuário
        const profile = localStorage.getItem(key);
        if (profile) {
          // Por simplicidade, assumir que é o mesmo usuário se tem dados
          // Em um sistema real, você teria uma tabela de usuários
          return userId;
        }
      }
    }
    return null;
  };</parameter>
</invoke>