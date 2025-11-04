import React, { useState, useMemo } from 'react';
import { Plus, Filter, Calendar, Tag } from 'lucide-react';
import { ExpenseForm, ExpenseFormData } from './ExpenseForm';
import { ExpenseList } from './ExpenseList';
import { useExpenses } from '../../hooks/useExpenses';
import { Expense, EXPENSE_CATEGORIES } from '../../types';

interface ExpensesTabProps {
  userId: string;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({ userId }) => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(userId);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
  });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesCategory = !filters.category || expense.category === filters.category;
      const matchesStartDate = !filters.startDate || expense.date >= filters.startDate;
      const matchesEndDate = !filters.endDate || expense.date <= filters.endDate;
      
      return matchesCategory && matchesStartDate && matchesEndDate;
    });
  }, [expenses, filters]);

  const handleSubmit = (data: ExpenseFormData) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
      setEditingExpense(null);
    } else {
      addExpense(data);
    }
    setShowForm(false);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este gasto?')) {
      deleteExpense(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent">Gastos</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Gasto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-4 mb-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-white">
            <Filter className="h-5 w-5 mr-2" />
            <span className="font-medium">Filtros</span>
          </div>
          <button
            onClick={clearFilters}
            className="text-sm text-slate-400 hover:text-white transition-colors transform hover:scale-105"
          >
            Limpar filtros
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              <Tag className="h-4 w-4 inline mr-1" />
              Categoria
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700/50 text-white transition-all duration-300 backdrop-blur-sm"
            >
              <option value="">Todas as categorias</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data inicial
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700/50 text-white transition-all duration-300 backdrop-blur-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data final
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700/50 text-white transition-all duration-300 backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* Lista de gastos */}
      <ExpenseList
        expenses={filteredExpenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Formulário de gastos */}
      {showForm && (
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={editingExpense ? {
            value: editingExpense.value,
            category: editingExpense.category,
            date: editingExpense.date,
            description: editingExpense.description || '',
          } : undefined}
        />
      )}
    </div>
  );
};