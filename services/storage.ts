import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  title: string;
  description: string;
  amount: number;
  paidAmount: number;
  creditor: string;
  dueDate: string;
  isPaid: boolean;
  createdAt: string;
}

const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  GOALS: 'goals',
  DEBTS: 'debts',
  SETTINGS: 'settings',
};

export class StorageService {
  // Transactions
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async saveTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    try {
      const transactions = await this.getTransactions();
      const newTransaction: Transaction = {
        ...transaction,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      transactions.unshift(newTransaction); // Add to beginning
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      throw error;
    }
  }

  static async deleteTransaction(id: string): Promise<void> {
    try {
      const transactions = await this.getTransactions();
      const filteredTransactions = transactions.filter(t => t.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(filteredTransactions));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Goals
  static async getGoals(): Promise<Goal[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting goals:', error);
      return [];
    }
  }

  static async saveGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    try {
      const goals = await this.getGoals();
      const newGoal: Goal = {
        ...goal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      goals.unshift(newGoal);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      return newGoal;
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  }

  static async updateGoal(id: string, updates: Partial<Goal>): Promise<void> {
    try {
      const goals = await this.getGoals();
      const updatedGoals = goals.map(goal => 
        goal.id === id ? { ...goal, ...updates } : goal
      );
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  static async deleteGoal(id: string): Promise<void> {
    try {
      const goals = await this.getGoals();
      const filteredGoals = goals.filter(g => g.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(filteredGoals));
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  // Statistics
  static async getMonthlyStats(year: number, month: number): Promise<{
    income: number;
    expenses: number;
    balance: number;
  }> {
    try {
      const transactions = await this.getTransactions();
      const targetMonth = `${year}-${month.toString().padStart(2, '0')}`;
      
      const monthlyTransactions = transactions.filter(t => 
        t.date.startsWith(targetMonth)
      );

      const income = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        income,
        expenses,
        balance: income - expenses,
      };
    } catch (error) {
      console.error('Error getting monthly stats:', error);
      return { income: 0, expenses: 0, balance: 0 };
    }
  }

  static async getTotalBalance(): Promise<number> {
    try {
      const transactions = await this.getTransactions();
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return income - expenses;
    } catch (error) {
      console.error('Error getting total balance:', error);
      return 0;
    }
  }

  // Categories
  static getExpenseCategories() {
    return [
      { id: 'yemək', name: 'Yemək', icon: 'restaurant' as const },
      { id: 'nəqliyyat', name: 'Nəqliyyat', icon: 'car' as const },
      { id: 'alış-veriş', name: 'Alış-veriş', icon: 'storefront' as const },
      { id: 'komunal', name: 'Komunal', icon: 'flash' as const },
      { id: 'əyləncə', name: 'Əyləncə', icon: 'game-controller' as const },
      { id: 'sağlamlıq', name: 'Sağlamlıq', icon: 'medical' as const },
      { id: 'təhsil', name: 'Təhsil', icon: 'school' as const },
      { id: 'geyim', name: 'Geyim', icon: 'shirt' as const },
      { id: 'digər', name: 'Digər', icon: 'ellipsis-horizontal' as const },
    ];
  }

  static getIncomeCategories() {
    return [
      { id: 'maaş', name: 'Maaş', icon: 'briefcase' as const },
      { id: 'freelance', name: 'Freelance', icon: 'laptop' as const },
      { id: 'investisiya', name: 'İnvestisiya', icon: 'trending-up' as const },
      { id: 'hədiyyə', name: 'Hədiyyə', icon: 'gift' as const },
      { id: 'satış', name: 'Satış', icon: 'cash' as const },
      { id: 'digər', name: 'Digər', icon: 'ellipsis-horizontal' as const },
    ];
  }

  // Debts
  static async getDebts(): Promise<Debt[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.DEBTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting debts:', error);
      return [];
    }
  }

  static async saveDebt(debt: Omit<Debt, 'id' | 'createdAt'>): Promise<Debt> {
    try {
      const debts = await this.getDebts();
      const newDebt: Debt = {
        ...debt,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      debts.unshift(newDebt);
      await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
      return newDebt;
    } catch (error) {
      console.error('Error saving debt:', error);
      throw error;
    }
  }

  static async updateDebt(id: string, updates: Partial<Debt>): Promise<void> {
    try {
      const debts = await this.getDebts();
      const updatedDebts = debts.map(debt => 
        debt.id === id ? { ...debt, ...updates } : debt
      );
      await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(updatedDebts));
    } catch (error) {
      console.error('Error updating debt:', error);
      throw error;
    }
  }

  static async deleteDebt(id: string): Promise<void> {
    try {
      const debts = await this.getDebts();
      const filteredDebts = debts.filter(debt => debt.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(filteredDebts));
    } catch (error) {
      console.error('Error deleting debt:', error);
      throw error;
    }
  }

  // Clear all data
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TRANSACTIONS,
        STORAGE_KEYS.GOALS,
        STORAGE_KEYS.DEBTS,
        STORAGE_KEYS.SETTINGS,
      ]);
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}
