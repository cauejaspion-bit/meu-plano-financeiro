export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
  isAdmin: boolean;
}

export interface Expense {
  id: string;
  value: number;
  category: string;
  date: string;
  description?: string;
  userId: string;
}

export interface FinancialProfile {
  userId: string;
  monthlySalary: number;
  emergencyFund: number;
  savingsGoalPercentage: number;
}

export interface EmergencyFundContribution {
  id: string;
  userId: string;
  amount: number;
  date: string;
  description?: string;
  type: 'deposit' | 'withdrawal';
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  { id: 'alimentacao', name: 'Alimentação', icon: 'UtensilsCrossed', color: '#10B981' },
  { id: 'transporte', name: 'Transporte', icon: 'Car', color: '#3B82F6' },
  { id: 'lazer', name: 'Lazer', icon: 'GamepadIcon', color: '#8B5CF6' },
  { id: 'moradia', name: 'Moradia', icon: 'Home', color: '#F59E0B' },
  { id: 'saude', name: 'Saúde', icon: 'Heart', color: '#EF4444' },
  { id: 'educacao', name: 'Educação', icon: 'BookOpen', color: '#6366F1' },
  { id: 'compras', name: 'Compras', icon: 'ShoppingBag', color: '#EC4899' },
  { id: 'outros', name: 'Outros', icon: 'MoreHorizontal', color: '#6B7280' },
];