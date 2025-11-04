import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Minus, Calendar, DollarSign, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useEmergencyFund } from '../../hooks/useEmergencyFund';
import { EmergencyFundContribution } from '../../types';
import { formatCurrencyInput, getCurrencyValue, formatCurrency } from '../../utils/currency';

interface EmergencyFundManagerProps {
  userId: string;
  onBalanceChange: (newBalance: number) => void;
}

interface ContributionForm {
  amount: number;
  date: string;
  description?: string;
  type: 'deposit' | 'withdrawal';
}

export const EmergencyFundManager: React.FC<EmergencyFundManagerProps> = ({ 
  userId, 
  onBalanceChange 
}) => {
  const { contributions, addContribution, deleteContribution, getTotalBalance } = useEmergencyFund(userId);
  const [showForm, setShowForm] = useState(false);
  const [currencyValue, setCurrencyValue] = useState('');
  
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm<ContributionForm>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
    },
  });

  const watchType = watch('type');

  React.useEffect(() => {
    onBalanceChange(getTotalBalance());
  }, [contributions, onBalanceChange, getTotalBalance]);

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setCurrencyValue(formatted);
    const numericValue = getCurrencyValue(formatted);
    setValue('amount', numericValue);
  };

  const onSubmit = (data: ContributionForm) => {
    const numericValue = getCurrencyValue(currencyValue);
    
    if (!currencyValue || numericValue <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }

    addContribution({
      ...data,
      amount: numericValue,
    });

    reset();
    setCurrencyValue('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      deleteContribution(id);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const sortedContributions = [...contributions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Histórico da Reserva de Emergência
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 dark:bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Novo Registro
        </button>
      </div>

      {/* Resumo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Saldo Total da Reserva</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(getTotalBalance())}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Registros</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {contributions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      {showForm && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 transition-colors">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Operação
                </label>
                <select
                  {...register('type', { required: 'Tipo é obrigatório' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="deposit">Depósito (+)</option>
                  <option value="withdrawal">Retirada (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Valor (R$)
                </label>
                <input
                  type="text"
                  value={currencyValue}
                  onChange={handleCurrencyChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="R$ 0,00"
                />
                <input {...register('amount', { required: true })} type="hidden" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data
              </label>
              <input
                {...register('date', { required: 'Data é obrigatória' })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição (opcional)
              </label>
              <input
                {...register('description')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                placeholder="Ex: Salário do mês, Freelance, etc."
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className={`flex-1 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center ${
                  watchType === 'deposit' 
                    ? 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600' 
                    : 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600'
                }`}
              >
                {watchType === 'deposit' ? (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Depósito
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 mr-2" />
                    Registrar Retirada
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  reset();
                  setCurrencyValue('');
                }}
                className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de contribuições */}
      <div className="space-y-3">
        {sortedContributions.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum registro encontrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Adicione seu primeiro registro para começar o controle da reserva.
            </p>
          </div>
        ) : (
          sortedContributions.map((contribution) => (
            <div
              key={contribution.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  contribution.type === 'deposit' 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {contribution.type === 'deposit' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${
                      contribution.type === 'deposit' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {contribution.type === 'deposit' ? '+' : '-'}{formatCurrency(contribution.amount)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(contribution.date)}
                    </span>
                  </div>
                  {contribution.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contribution.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(contribution.id)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};