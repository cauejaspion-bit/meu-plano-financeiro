import { useState, useEffect } from 'react';
import { FinancialProfile } from '../types';
import { googleSheetsService } from '../services/googleSheets';

export const useFinancialProfile = (userId: string) => {
  const [profile, setProfile] = useState<FinancialProfile>({
    userId,
    monthlySalary: 0,
    emergencyFund: 0,
    savingsGoalPercentage: 10,
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem(`financial_profile_${userId}`);
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setProfile(parsedProfile);
    } else {
      // Define valores padrão se não houver perfil salvo
      const defaultProfile = {
        userId,
        monthlySalary: 0,
        emergencyFund: 0,
        savingsGoalPercentage: 10,
      };
      setProfile(defaultProfile);
    }
  }, [userId]);

  const updateProfile = (updates: Partial<FinancialProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    setProfile(updatedProfile);
    localStorage.setItem(`financial_profile_${userId}`, JSON.stringify(updatedProfile));
    
    // Sincronizar com Google Sheets se configurado
    if (googleSheetsService.isReady()) {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const expenses = JSON.parse(localStorage.getItem(`expenses_${userId}`) || '[]');
      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthExpenses = expenses.filter((expense: any) => 
        expense.date.startsWith(currentMonth)
      );
      const totalExpenses = currentMonthExpenses.reduce((sum: number, expense: any) => sum + expense.value, 0);
      
      googleSheetsService.syncUserData({
        userId: updatedProfile.userId,
        name: user.name || 'Usuário',
        email: user.email || '',
        monthlySalary: updatedProfile.monthlySalary,
        emergencyFund: updatedProfile.emergencyFund, // Agora será o saldo dos aportes
        savingsGoalPercentage: updatedProfile.savingsGoalPercentage,
        totalExpenses: totalExpenses,
        lastUpdated: new Date().toISOString()
      });
    }
    
    window.dispatchEvent(new Event('storage'));
  };

  return { profile, updateProfile };
};