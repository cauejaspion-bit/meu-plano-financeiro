import { useState, useEffect } from 'react';
import { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; message?: string; isAdmin?: boolean } => {
    if (email === 'admin@financeiro.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@financeiro.com',
        password: 'admin123',
        name: 'Administrador',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        isAdmin: true
      };

      setUser(adminUser);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));

      return { success: true, isAdmin: true };
    }

    const users = getAllUsers();
    const foundUser = users.find(u => u.email === email && u.password === password);

    if (!foundUser) {
      return { success: false, message: 'Email ou senha incorretos' };
    }

    if (!foundUser.isActive) {
      return { success: false, message: 'Sua conta foi desativada. Entre em contato com o administrador.' };
    }

    const updatedUser = {
      ...foundUser,
      lastLogin: new Date().toISOString()
    };

    const updatedUsers = users.map(u => u.id === foundUser.id ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    return { success: true, isAdmin: false };
  };

  const register = (email: string, password: string, name: string): { success: boolean; message?: string } => {
    if (email === 'admin@financeiro.com') {
      return { success: false, message: 'Este email não pode ser usado para registro' };
    }

    const users = getAllUsers();

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Este email já está cadastrado' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
      isActive: true,
      isAdmin: false
    };

    const updatedUsers = [...users, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    return { success: true };
  };

  const getAllUsers = (): User[] => {
    try {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : [];
    } catch {
      return [];
    }
  };

  const updateUserStatus = (userId: string, isActive: boolean) => {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].isActive = isActive;
      localStorage.setItem('users', JSON.stringify(users));
    }
  };

  const getAllUsersWithStatus = (): User[] => {
    return getAllUsers();
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return { user, login, register, logout, loading, getAllUsersWithStatus, updateUserStatus };
};