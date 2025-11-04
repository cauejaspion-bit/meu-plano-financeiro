// Serviço para integração com Google Sheets
export interface UserData {
  userId: string;
  name: string;
  email: string;
  monthlySalary: number;
  emergencyFund: number;
  savingsGoalPercentage: number;
  totalExpenses: number;
  lastUpdated: string;
}

export interface ExpenseData {
  userId: string;
  userName: string;
  expenseId: string;
  value: number;
  category: string;
  date: string;
  description: string;
  createdAt: string;
}

class GoogleSheetsService {
  // Configurações hardcoded - invisíveis para o usuário
  private apiKey: string = 'SUA_API_KEY_AQUI'; // Substitua pela sua API Key
  private spreadsheetId: string = 'SEU_SPREADSHEET_ID_AQUI'; // Substitua pelo ID da sua planilha
  private isConfigured = true;

  // Verificar se está configurado
  isReady() {
    return this.isConfigured && this.apiKey !== 'SUA_API_KEY_AQUI' && this.spreadsheetId !== 'SEU_SPREADSHEET_ID_AQUI';
  }

  // Sincronizar dados do usuário
  async syncUserData(userData: UserData) {
    if (!this.isReady()) {
      console.warn('Google Sheets não configurado');
      return false;
    }

    try {
      const values = [
        [
          userData.userId,
          userData.name,
          userData.email,
          userData.monthlySalary,
          userData.emergencyFund,
          userData.savingsGoalPercentage,
          userData.totalExpenses,
          userData.lastUpdated
        ]
      ];

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Usuarios!A:H:append?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (response.ok) {
        console.log('Dados do usuário sincronizados com Google Sheets');
        return true;
      } else {
        console.error('Erro ao sincronizar com Google Sheets:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      return false;
    }
  }

  // Sincronizar gastos
  async syncExpenseData(expenseData: ExpenseData) {
    if (!this.isReady()) {
      console.warn('Google Sheets não configurado');
      return false;
    }

    try {
      const values = [
        [
          expenseData.userId,
          expenseData.userName,
          expenseData.expenseId,
          expenseData.value,
          expenseData.category,
          expenseData.date,
          expenseData.description,
          expenseData.createdAt
        ]
      ];

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Gastos!A:H:append?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values
          })
        }
      );

      if (response.ok) {
        console.log('Gasto sincronizado com Google Sheets');
        return true;
      } else {
        console.error('Erro ao sincronizar gasto:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Erro na sincronização do gasto:', error);
      return false;
    }
  }

  // Criar cabeçalhos das planilhas
  async setupSheetHeaders() {
    if (!this.isReady()) return false;

    try {
      // Cabeçalhos para aba Usuarios
      const userHeaders = [
        ['ID do Usuário', 'Nome', 'Email', 'Salário Mensal', 'Reserva Emergência', 'Meta Economia (%)', 'Total Gastos', 'Última Atualização']
      ];

      // Cabeçalhos para aba Gastos
      const expenseHeaders = [
        ['ID do Usuário', 'Nome do Usuário', 'ID do Gasto', 'Valor', 'Categoria', 'Data', 'Descrição', 'Criado em']
      ];

      // Criar aba Usuarios
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Usuarios!A1:H1?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: userHeaders
          })
        }
      );

      // Criar aba Gastos
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${this.spreadsheetId}/values/Gastos!A1:H1?valueInputOption=RAW&key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: expenseHeaders
          })
        }
      );

      console.log('Cabeçalhos das planilhas configurados');
      return true;
    } catch (error) {
      console.error('Erro ao configurar cabeçalhos:', error);
      return false;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();