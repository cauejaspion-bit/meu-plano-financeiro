import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Target, DollarSign } from 'lucide-react';
import { useExpenses } from '../../hooks/useExpenses';
import { useFinancialProfile } from '../../hooks/useFinancialProfile';
import { EXPENSE_CATEGORIES } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DashboardTabProps {
  userId: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({ userId }) => {
  const { expenses } = useExpenses(userId);
  const { profile } = useFinancialProfile(userId);

  // Dados para gráfico de pizza por categoria
  const categoryData = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.startsWith(currentMonth)
    );

    const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.value;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals).map(([categoryId, total]) => {
      const category = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
      return {
        name: category?.name || 'Outros',
        value: total,
        color: category?.color || '#6B7280',
      };
    });
  }, [expenses]);

  // Dados para gráfico de barras por mês
  const monthlyData = useMemo(() => {
    const monthlyTotals = expenses.reduce((acc, expense) => {
      const month = expense.date.slice(0, 7);
      acc[month] = (acc[month] || 0) + expense.value;
      return acc;
    }, {} as Record<string, number>);

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    return last6Months.map(month => ({
      month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
      gastos: monthlyTotals[month] || 0,
      ganhos: profile.monthlySalary,
    }));
  }, [expenses, profile.monthlySalary]);

  // Dados para comparativo mensal (últimos 12 meses)
  const monthlyComparison = useMemo(() => {
    const monthlyData = expenses.reduce((acc, expense) => {
      const month = expense.date.slice(0, 7);
      acc[month] = (acc[month] || 0) + expense.value;
      return acc;
    }, {} as Record<string, number>);

    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.toISOString().slice(0, 7);
    }).reverse();

    return last12Months.map((month, index) => {
      const gastos = monthlyData[month] || 0;
      const economia = Math.max(0, profile.monthlySalary - gastos);
      const previousMonth = index > 0 ? last12Months[index - 1] : null;
      const previousGastos = previousMonth ? (monthlyData[previousMonth] || 0) : gastos;
      const variacao = previousMonth ? ((gastos - previousGastos) / (previousGastos || 1)) * 100 : 0;
      
      return {
        mes: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        gastos,
        economia,
        salario: profile.monthlySalary,
        variacao: Math.round(variacao),
        economiaPercentual: profile.monthlySalary > 0 ? Math.round((economia / profile.monthlySalary) * 100) : 0
      };
    });
  }, [expenses, profile.monthlySalary]);

  // Dados para comparativo anual
  const yearlyComparison = useMemo(() => {
    const yearlyData = expenses.reduce((acc, expense) => {
      const year = expense.date.slice(0, 4);
      acc[year] = (acc[year] || 0) + expense.value;
      return acc;
    }, {} as Record<string, number>);

    const years = Object.keys(yearlyData).sort();
    
    return years.map((year, index) => {
      const gastos = yearlyData[year];
      const salarioAnual = profile.monthlySalary * 12;
      const economia = Math.max(0, salarioAnual - gastos);
      const previousYear = index > 0 ? years[index - 1] : null;
      const previousGastos = previousYear ? yearlyData[previousYear] : gastos;
      const variacao = previousYear ? ((gastos - previousGastos) / previousGastos) * 100 : 0;
      
      return {
        ano: year,
        gastos,
        economia,
        salarioAnual,
        variacao: Math.round(variacao),
        economiaPercentual: salarioAnual > 0 ? Math.round((economia / salarioAnual) * 100) : 0
      };
    });
  }, [expenses, profile.monthlySalary]);

  // Cálculos financeiros
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );
  const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.value, 0);
  const balance = profile.monthlySalary - totalExpenses; // Reserva não afeta o saldo mensal
  const savingsTarget = profile.monthlySalary * (profile.savingsGoalPercentage / 100);
  const actualSavings = Math.max(0, balance);
  const expensePercentage = profile.monthlySalary > 0 ? (totalExpenses / profile.monthlySalary) * 100 : 0;
  
  // Reserva de emergência: quantos meses de gastos atuais ela cobre
  const averageMonthlyExpenses = totalExpenses > 0 ? totalExpenses : 1000; // Fallback para evitar divisão por zero
  const emergencyMonths = profile.emergencyFund / averageMonthlyExpenses;

  const getFinancialHealthColor = (percentage: number) => {
    if (percentage <= 50) return 'text-emerald-600';
    if (percentage <= 70) return 'text-yellow-600';
    if (percentage <= 80) return 'text-orange-600';
    return 'text-red-600';
  };

  const getFinancialHealthText = (percentage: number) => {
    if (percentage <= 50) return 'Excelente';
    if (percentage <= 70) return 'Boa';
    if (percentage <= 80) return 'Atenção';
    return 'Crítica';
  };

  // Calcular tendência dos últimos 3 meses
  const recentTrend = useMemo(() => {
    const recent3Months = monthlyComparison.slice(-3);
    if (recent3Months.length < 2) return { trend: 'stable', percentage: 0 };
    
    const firstMonth = recent3Months[0].gastos;
    const lastMonth = recent3Months[recent3Months.length - 1].gastos;
    
    if (firstMonth === 0) return { trend: 'stable', percentage: 0 };
    
    const change = ((lastMonth - firstMonth) / firstMonth) * 100;
    
    if (change > 5) return { trend: 'increasing', percentage: Math.round(change) };
    if (change < -5) return { trend: 'decreasing', percentage: Math.round(Math.abs(change)) };
    return { trend: 'stable', percentage: Math.round(Math.abs(change)) };
  }, [monthlyComparison]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-600 bg-clip-text text-transparent mb-8">
        Dashboard Financeiro
      </h2>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 hover:bg-slate-800/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Saldo do Mês</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            {balance >= 0 ? (
              <TrendingUp className="h-8 w-8 text-emerald-400" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-400" />
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 hover:bg-slate-800/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Meta de Economia</p>
              <p className={`text-2xl font-bold ${actualSavings >= savingsTarget ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {Math.round((actualSavings / savingsTarget) * 100)}%
              </p>
            </div>
            <Target className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 hover:bg-slate-800/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Saúde Financeira</p>
              <p className={`text-2xl font-bold ${getFinancialHealthColor(expensePercentage)}`}>
                {getFinancialHealthText(expensePercentage)}
              </p>
            </div>
            <Shield className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-105 hover:bg-slate-800/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Reserva (meses)</p>
              <p className="text-2xl font-bold text-blue-400">
                {Math.round(emergencyMonths)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Alerta de gastos altos */}
      {expensePercentage > 80 && (
        <div className="bg-red-900/20 backdrop-blur-xl border border-red-700 rounded-lg shadow-lg p-4 mb-8 transition-all duration-300 hover:scale-[1.02]">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-300">Alerta de Gastos Altos!</h3>
              <p className="text-sm text-red-400">
                Seus gastos ultrapassaram 80% do seu salário ({Math.round(expensePercentage)}%).
                Considere revisar seus gastos para manter a saúde financeira.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de tendência */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-4 mb-8 transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${
              recentTrend.trend === 'increasing' ? 'bg-red-900/30' :
              recentTrend.trend === 'decreasing' ? 'bg-emerald-900/30' :
              'bg-blue-900/30'
            }`}>
              {recentTrend.trend === 'increasing' ? (
                <TrendingUp className="h-5 w-5 text-red-400" />
              ) : recentTrend.trend === 'decreasing' ? (
                <TrendingDown className="h-5 w-5 text-emerald-400" />
              ) : (
                <Target className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-white">
                Tendência dos Últimos 3 Meses
              </h3>
              <p className="text-sm text-slate-400">
                {recentTrend.trend === 'increasing' && `Gastos aumentaram ${recentTrend.percentage}%`}
                {recentTrend.trend === 'decreasing' && `Gastos diminuíram ${recentTrend.percentage}%`}
                {recentTrend.trend === 'stable' && 'Gastos estáveis'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de pizza - Gastos por categoria */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-white mb-4">Gastos por Categoria</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-slate-400">
              Nenhum gasto registrado neste mês
            </div>
          )}
        </div>

        {/* Gráfico de barras - Ganhos vs Gastos */}
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-white mb-4">Ganhos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Bar dataKey="ganhos" fill="#10B981" name="Ganhos" />
              <Bar dataKey="gastos" fill="#EF4444" name="Gastos" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparativo Mensal - Últimos 12 meses */}
      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 mb-8 transition-all duration-300 hover:scale-[1.01]">
        <h3 className="text-lg font-semibold text-white mb-4">Evolução Mensal (Últimos 12 Meses)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyComparison}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value, name) => [
                formatCurrency(value as number), 
                name === 'gastos' ? 'Gastos' : name === 'economia' ? 'Economia' : 'Salário'
              ]}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="salario" 
              stroke="#10B981" 
              strokeWidth={2}
              name="Salário"
              strokeDasharray="5 5"
            />
            <Line 
              type="monotone" 
              dataKey="gastos" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Gastos"
            />
            <Line 
              type="monotone" 
              dataKey="economia" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Economia"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Estatísticas do período */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-600">
          <div className="text-center">
            <p className="text-sm text-slate-400">Média Mensal Gastos</p>
            <p className="text-lg font-semibold text-red-400">
              {formatCurrency(monthlyComparison.reduce((sum, month) => sum + month.gastos, 0) / monthlyComparison.length)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400">Média Mensal Economia</p>
            <p className="text-lg font-semibold text-blue-400">
              {formatCurrency(monthlyComparison.reduce((sum, month) => sum + month.economia, 0) / monthlyComparison.length)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400">Maior Gasto Mensal</p>
            <p className="text-lg font-semibold text-red-400">
              {formatCurrency(Math.max(...monthlyComparison.map(m => m.gastos)))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-400">Maior Economia Mensal</p>
            <p className="text-lg font-semibold text-emerald-400">
              {formatCurrency(Math.max(...monthlyComparison.map(m => m.economia)))}
            </p>
          </div>
        </div>
      </div>

      {/* Comparativo Anual */}
      {yearlyComparison.length > 1 && (
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 mb-8 transition-all duration-300 hover:scale-[1.01]">
          <h3 className="text-lg font-semibold text-white mb-4">Comparativo Anual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearlyComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="ano" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip 
                formatter={(value, name) => [
                  formatCurrency(value as number), 
                  name === 'gastos' ? 'Gastos Anuais' : name === 'economia' ? 'Economia Anual' : 'Salário Anual'
                ]}
              />
              <Legend />
              <Bar dataKey="salarioAnual" fill="#10B981" name="Salário Anual" opacity={0.7} />
              <Bar dataKey="gastos" fill="#EF4444" name="Gastos Anuais" />
              <Bar dataKey="economia" fill="#3B82F6" name="Economia Anual" />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Comparação ano a ano */}
          <div className="mt-6 pt-6 border-t border-slate-600">
            <h4 className="font-medium text-white mb-4">Variação Anual</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {yearlyComparison.map((year, index) => (
                <div key={year.ano} className="bg-slate-700/50 rounded-lg p-4 transition-all duration-300 hover:scale-105 hover:bg-slate-700/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{year.ano}</span>
                    {index > 0 && (
                      <div className={`flex items-center text-sm ${
                        year.variacao > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {year.variacao > 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(year.variacao)}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Gastos:</span>
                      <span className="font-medium text-red-400">
                        {formatCurrency(year.gastos)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Economia:</span>
                      <span className="font-medium text-blue-400">
                        {formatCurrency(year.economia)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Taxa Economia:</span>
                      <span className="font-medium text-emerald-400">
                        {year.economiaPercentual}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detalhes adicionais */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-white mb-4">Indicadores Financeiros</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Percentual gasto do salário</span>
              <span className={`font-semibold ${getFinancialHealthColor(expensePercentage)}`}>
                {expensePercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Economia realizada</span>
              <span className="font-semibold text-emerald-400">
                {formatCurrency(actualSavings)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Meta de economia</span>
              <span className="font-semibold text-blue-400">
                {formatCurrency(savingsTarget)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:scale-[1.02]">
          <h3 className="text-lg font-semibold text-white mb-4">Reserva de Emergência</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Valor atual</span>
              <span className="font-semibold text-blue-400">
                {formatCurrency(profile.emergencyFund)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cobertura em meses</span>
              <span className="font-semibold text-white">
                {emergencyMonths > 0 ? Math.round(emergencyMonths) : 0} meses
              </span>
            </div>
            <div className="text-sm text-slate-400">
              <p className="mb-2 text-blue-400">
                💡 Baseado nos seus gastos mensais atuais de {formatCurrency(averageMonthlyExpenses)}
              </p>
              {emergencyMonths < 3 && (
                <p className="text-yellow-400">
                  ⚠️ Recomenda-se ter pelo menos 3 meses de reserva
                </p>
              )}
              {emergencyMonths >= 3 && emergencyMonths < 6 && (
                <p className="text-blue-400">
                  ℹ️ Boa reserva! Considere aumentar para 6 meses
                </p>
              )}
              {emergencyMonths >= 6 && (
                <p className="text-emerald-400">
                  ✅ Excelente reserva de emergência!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};