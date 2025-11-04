import { useState, useEffect } from 'react';
import { Expense } from '../types';
import { googleSheetsService } from '../services/googleSheets';

export const useExpenses = (userId: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const storedExpenses = localStorage.getItem(`expenses_${userId}`);
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  }, [userId]);

  const saveExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem(`expenses_${userId}`, JSON.stringify(newExpenses));
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'userId'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      userId,
    };
    const updatedExpenses = [...expenses, newExpense];
    saveExpenses(updatedExpenses);
    
    // Sincronizar com Google Sheets se configurado
    if (googleSheetsService.isReady()) {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      googleSheetsService.syncExpenseData({
        userId: newExpense.userId,
        userName: user.name || 'Usuário',
        expenseId: newExpense.id,
        value: newExpense.value,
        category: newExpense.category,
        date: newExpense.date,
        description: newExpense.description || '',
        createdAt: new Date().toISOString()
      });
    }
  };

  const updateExpense = (id: string, updatedExpense: Partial<Expense>) => {
    const updated = expenses.map(expense =>
      expense.id === id ? { ...expense, ...updatedExpense } : expense
    );
    saveExpenses(updated);
  };

  const deleteExpense = (id: string) => {
    const filtered = expenses.filter(expense => expense.id !== id);
    saveExpenses(filtered);
  };

  return { expenses, addExpense, updateExpense, deleteExpense };
};