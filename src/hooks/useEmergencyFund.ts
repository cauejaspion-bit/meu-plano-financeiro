import { useState, useEffect } from 'react';
import { EmergencyFundContribution } from '../types';

export const useEmergencyFund = (userId: string) => {
  const [contributions, setContributions] = useState<EmergencyFundContribution[]>([]);

  useEffect(() => {
    const storedContributions = localStorage.getItem(`emergency_contributions_${userId}`);
    if (storedContributions) {
      setContributions(JSON.parse(storedContributions));
    }
  }, [userId]);

  const saveContributions = (newContributions: EmergencyFundContribution[]) => {
    setContributions(newContributions);
    localStorage.setItem(`emergency_contributions_${userId}`, JSON.stringify(newContributions));
  };

  const addContribution = (contribution: Omit<EmergencyFundContribution, 'id' | 'userId'>) => {
    const newContribution: EmergencyFundContribution = {
      ...contribution,
      id: Date.now().toString(),
      userId,
    };
    const updatedContributions = [...contributions, newContribution];
    saveContributions(updatedContributions);
  };

  const deleteContribution = (id: string) => {
    const filtered = contributions.filter(contribution => contribution.id !== id);
    saveContributions(filtered);
  };

  const getTotalBalance = () => {
    return contributions.reduce((total, contribution) => {
      return contribution.type === 'deposit' 
        ? total + contribution.amount 
        : total - contribution.amount;
    }, 0);
  };

  return { 
    contributions, 
    addContribution, 
    deleteContribution, 
    getTotalBalance 
  };
};