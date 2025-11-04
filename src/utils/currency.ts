// Utilitários para formatação e conversão de moeda
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const parseCurrency = (value: string): number => {
  // Remove todos os caracteres que não são dígitos ou vírgula
  const cleanValue = value.replace(/[^\d,]/g, '');
  
  // Se não há vírgula, assume que são centavos
  if (!cleanValue.includes(',')) {
    return parseFloat(cleanValue) || 0;
  }
  
  // Substitui vírgula por ponto para conversão
  const numericValue = cleanValue.replace(',', '.');
  return parseFloat(numericValue) || 0;
};

export const formatCurrencyInput = (value: string): string => {
  // Remove tudo que não é dígito
  const digits = value.replace(/\D/g, '');
  
  if (!digits) return '';
  
  // Converte para número e divide por 100 para ter centavos
  const number = parseInt(digits) / 100;
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

export const getCurrencyValue = (formattedValue: string): number => {
  if (!formattedValue) return 0;
  
  // Remove símbolos de moeda, espaços e pontos (separadores de milhares)
  const cleanValue = formattedValue.replace(/[R$\s.]/g, '');
  
  // Substitui vírgula por ponto para conversão decimal
  const numericValue = cleanValue.replace(',', '.');
  
  const result = parseFloat(numericValue) || 0;
  return result;
};