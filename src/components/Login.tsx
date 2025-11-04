import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { LogIn, DollarSign, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => { success: boolean; message?: string };
  onRegister: (email: string, password: string, name: string) => { success: boolean; message?: string };
}

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<LoginForm & RegisterForm>();
  const watchPassword = watch('password');

  const onSubmitLogin = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');
    
    // Simular loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = onLogin(data.email, data.password);
    if (!result.success) {
      setError(result.message || 'Erro ao fazer login');
    } else {
      // Login bem-sucedido, a detecção de admin acontece automaticamente
      console.log('Login realizado:', result.isAdmin ? 'Admin' : 'Usuário');
    }
    
    setIsLoading(false);
  };

  const onSubmitRegister = async (data: RegisterForm) => {
    setIsLoading(true);
    setError('');
    
    if (data.password !== data.confirmPassword) {
      setError('As senhas não coincidem');
      setIsLoading(false);
      return;
    }
    
    // Simular loading
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = onRegister(data.email, data.password, data.name);
    if (result.success) {
      setIsRegisterMode(false);
      reset();
      setError('');
      alert('Conta criada com sucesso! Agora você pode fazer login.');
    } else {
      setError(result.message || 'Erro ao criar conta');
    }
    
    setIsLoading(false);
  };

  const toggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setError('');
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative bg-slate-800 p-4 rounded-full border border-emerald-500/50">
                <DollarSign className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-3">
            Finança
          </h1>
          <p className="text-slate-400 text-lg">
            {isRegisterMode ? 'Criar nova conta' : 'Bem-vindo de volta'}
          </p>
        </div>

        <form onSubmit={handleSubmit(isRegisterMode ? onSubmitRegister : onSubmitLogin)} className="space-y-6">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-8 rounded-2xl space-y-5 transition-all hover:border-slate-600/50">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo
                </label>
                <input
                  {...register('name', { required: 'Nome é obrigatório' })}
                  type="text"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Seu nome completo"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-400">{errors.name.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
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
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: isRegisterMode ? { value: 6, message: 'Senha deve ter pelo menos 6 caracteres' } : undefined
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {isRegisterMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    {...register('confirmPassword', {
                      required: 'Confirmação de senha é obrigatória',
                      validate: value => value === watchPassword || 'As senhas não coincidem'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {isRegisterMode ? 'Criando conta...' : 'Entrando...'}
                </>
              ) : (
                <>
                  {isRegisterMode ? (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Criar Conta
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      Entrar
                    </>
                  )}
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-slate-400 hover:text-emerald-400 text-sm font-medium transition-colors"
            >
              {isRegisterMode ? 'Já tem uma conta? Fazer login' : 'Não tem uma conta? Criar conta'}
            </button>
          </div>
        </form>

        <div className="bg-slate-700/30 border border-slate-600/50 backdrop-blur-sm rounded-xl p-5">
          <h3 className="text-slate-200 font-semibold mb-3 text-sm">Contas para teste:</h3>
          <div className="space-y-2 text-slate-400 text-xs">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="font-mono text-slate-300">👤 Usuário: crie uma conta</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="font-mono text-slate-300">🛡️ Admin: admin@financeiro.com</p>
              <p className="font-mono text-slate-400">Senha: admin123</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};