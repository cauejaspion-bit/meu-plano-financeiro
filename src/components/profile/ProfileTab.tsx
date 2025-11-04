import React from 'react';
import { useForm } from 'react-hook-form';
import { DollarSign, PiggyBank, Target, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { useFinancialProfile } from '../../hooks/useFinancialProfile';
import { useExpenses } from '../../hooks/useExpenses';
import { FinancialProfile } from '../../types';
import { formatCurrencyInput, getCurrencyValue, formatCurrency } from '../../utils/currency';
import { EmergencyFundManager } from './EmergencyFundManager';

interface ProfileTabProps {
  userId: string;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ userId }) => {
  const { profile, updateProfile } = useFinancialProfile(userId);
  const { expenses } = useExpenses(userId);
  
  const [salaryValue, setSalaryValue] = React.useState(() => {
    if (profile.monthlySalary > 0) {
      return formatCurrencyInput((profile.monthlySalary * 100).toString());
    }
    return '';
  });
  
  const [emergencyValue, setEmergencyValue] = React.useState(() => {
    if (profile.emergencyFund > 0) {
      return formatCurrencyInput((profile.emergencyFund * 100).toString());
    }
    return '';
  });
  const [emergencyFundBalance, setEmergencyFundBalance] = React.useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<FinancialProfile>({
    defaultValues: profile,
  });

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const balance = profile.monthlySalary - totalExpenses;
  const savingsTarget = profile.monthlySalary * (profile.savingsGoalPercentage / 100);
  const actualSavings = Math.max(0, balance);

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setSalaryValue(formatted);
  };

  const handleEmergencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setEmergencyValue(formatted);
  };

  const onSubmit = (data: FinancialProfile) => {
    const salaryNumeric = getCurrencyValue(salaryValue);
    
    if (!salaryValue || salaryNumeric <= 0) {
      alert('Por favor, insira um salário válido');
      return;
    }

    updateProfile({
      ...data,
      monthlySalary: salaryNumeric,
      emergencyFund: emergencyFundBalance, // Usar o saldo calculado dos aportes
    });
    
    alert('Perfil atualizado com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent mb-6">Perfil Financeiro</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário de perfil */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-colors">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent mb-4">Dados Financeiros</h3>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Salário Mensal (R$)
              </label>
              <input
                type="text"
                value={salaryValue}
                onChange={handleSalaryChange}
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700/50 text-white transition-all duration-300 backdrop-blur-sm"
                placeholder="R$ 0,00"
              />
              {!salaryValue && (
                <p className="mt-1 text-sm bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent">Salário é obrigatório</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                <Target className="h-4 w-4 inline mr-1" />
                Meta de Economia Mensal (%)
              </label>
              <input
                {...register('savingsGoalPercentage', { 
                  required: 'Meta de economia é obrigatória',
                  min: { value: 0, message: 'Meta deve ser positiva' },
                  max: { value: 100, message: 'Meta não pode ser maior que 100%' }
                })}
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-slate-600 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 bg-slate-700/50 text-white transition-all duration-300 backdrop-blur-sm"
                placeholder="10"
              />
              {errors.savingsGoalPercentage && (
                <p className="mt-1 text-sm bg-gradient-to-r from-red-400 to-pink-600 bg-clip-text text-transparent">{errors.savingsGoalPercentage.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Atualizar Perfil
            </button>
          </form>
        </div>

        {/* Resumo financeiro */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-colors">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent mb-4">Resumo do Mês</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Salário Mensal</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(profile.monthlySalary)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total de Gastos</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatCurrency(totalExpenses)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Reserva de Emergência</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(emergencyFundBalance)}
              </span>
            </div>

            <div className="border-t border-slate-600 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Saldo do Mês</span>
                <div className="flex items-center">
                  {balance >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 dark:text-red-400 mr-1" />
                  )}
                  <span className={`font-semibold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatCurrency(balance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/30 rounded-lg p-4 transition-colors backdrop-blur-sm">
              <h4 className="font-medium text-white mb-2">Meta de Economia</h4>
              <div className="flex justify-between text-sm text-slate-400 mb-1">
                <span>Objetivo: {formatCurrency(savingsTarget)}</span>
                <span>Atual: {formatCurrency(actualSavings)}</span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-colors ${
                    actualSavings >= savingsTarget ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-blue-500 dark:bg-blue-400'
                  }`}
                  style={{ width: `${Math.min(100, (actualSavings / savingsTarget) * 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-400 mt-2">
                Sua reserva de {formatCurrency(profile.emergencyFund)} cobre aproximadamente{' '}
                <span className="font-semibold">
                  {totalExpenses > 0 ? Math.round(emergencyFundBalance / totalExpenses) : 0} meses
                </span>{' '}
                dos seus gastos mensais atuais.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                💡 Este valor não afeta seus cálculos de saldo mensal - é apenas para controle da sua reserva.
              </p>
            </div>

            {emergencyFundBalance > 0 && (
              <div className="bg-blue-500/10 backdrop-blur-sm rounded-lg p-4 transition-colors border border-blue-400/20">
                <h4 className="font-medium text-white mb-2">Reserva de Emergência</h4>
                <p className="text-sm text-slate-400">
                  Sua reserva de {formatCurrency(emergencyFundBalance)} cobre aproximadamente{' '}
                  <span className="font-semibold">
                    {totalExpenses > 0 ? Math.round(emergencyFundBalance / totalExpenses) : 0} meses
                  </span>{' '}
                  de gastos atuais.
                </p>
              </div>
            )}

            {totalExpenses > profile.monthlySalary * 0.8 && (
              <div className="bg-yellow-500/10 backdrop-blur-sm rounded-lg p-4 flex items-start transition-colors border border-yellow-400/20">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-300">Atenção!</h4>
                  <p className="text-sm text-yellow-400">
                    Seus gastos estão próximos a 80% do seu salário. 
                    Considere revisar seus gastos para manter a saúde financeira.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gerenciador da Reserva de Emergência */}
      <div className="mt-8">
        <EmergencyFundManager 
          userId={userId} 
          onBalanceChange={setEmergencyFundBalance}
        />
      </div>
    </div>
  );
};