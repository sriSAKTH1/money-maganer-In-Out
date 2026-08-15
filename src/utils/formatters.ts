import { Account, Transaction, Budget, Category } from '../types';

export const CURRENCY_MAP: Record<string, string> = {
  '₹ INR': '₹',
  '$ USD': '$',
  '€ EUR': '€',
  '£ GBP': '£',
  '¥ JPY': '¥',
  'A$ AUD': 'A$',
  'C$ CAD': 'C$',
  'S$ SGD': 'S$',
  'AED': 'AED ',
};

export function formatCurrency(amount: number, symbol: string = '₹', hideBalance: boolean = false): string {
  if (hideBalance) {
    return `${symbol} xxx`;
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: absAmount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(absAmount);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatDateString(dateStr: string, formatStyle: 'short' | 'medium' | 'full' = 'medium'): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  
  if (isNaN(date.getTime())) return dateStr;

  const today = new Date();
  const todayStr = getTodayISOString();
  const isToday = dateStr === todayStr;

  if (isToday && formatStyle === 'medium') {
    return `Today, ${date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
  }

  if (formatStyle === 'short') {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  }

  if (formatStyle === 'full') {
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getTodayISOString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = account.initial_balance;

  for (const tx of transactions) {
    if (tx.type === 'income' && tx.account_id === account.id) {
      balance += tx.amount;
    } else if (tx.type === 'expense' && tx.account_id === account.id) {
      balance -= tx.amount;
    } else if (tx.type === 'transfer') {
      if (tx.from_account_id === account.id) {
        balance -= tx.amount;
      }
      if (tx.to_account_id === account.id) {
        balance += tx.amount;
      }
    }
  }

  return balance;
}

export function calculateNetWorth(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((total, acc) => {
    if (!acc.is_active) return total;
    return total + calculateAccountBalance(acc, transactions);
  }, 0);
}

export function calculateTotalsForPeriod(
  transactions: Transaction[], 
  startDate?: string, 
  endDate?: string
) {
  let income = 0;
  let expense = 0;

  const filtered = transactions.filter(tx => {
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;
    return true;
  });

  for (const tx of filtered) {
    if (tx.type === 'income') {
      income += tx.amount;
    } else if (tx.type === 'expense') {
      expense += tx.amount;
    }
  }

  return {
    income,
    expense,
    net: income - expense,
  };
}

export function calculateBudgetSpent(budget: Budget, transactions: Transaction[]): number {
  let spent = 0;
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (tx.date < budget.start_date || tx.date > budget.end_date) continue;

    // If budget has specific category
    if (budget.category_id) {
      if (tx.category_id === budget.category_id) {
        spent += tx.amount;
      }
    } else {
      // Overall budget sums all expenses
      spent += tx.amount;
    }
  }
  return spent;
}

export function calculateCategoryStats(
  type: 'income' | 'expense',
  transactions: Transaction[],
  categories: Category[],
  startDate?: string,
  endDate?: string
) {
  const filtered = transactions.filter(tx => {
    if (tx.type !== type) return false;
    if (startDate && tx.date < startDate) return false;
    if (endDate && tx.date > endDate) return false;
    return true;
  });

  const total = filtered.reduce((sum, tx) => sum + tx.amount, 0);

  const categoryMap: Record<string, { category: Category; amount: number }> = {};

  for (const tx of filtered) {
    if (!tx.category_id) continue;
    const cat = categories.find(c => c.id === tx.category_id);
    const catId = tx.category_id;

    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        category: cat || {
          id: catId,
          name: 'Other',
          type,
          icon: 'Folder',
          color: '#8E8A83',
          is_default: false,
          is_active: true,
          created_at: '',
          updated_at: ''
        },
        amount: 0,
      };
    }
    categoryMap[catId].amount += tx.amount;
  }

  const items = Object.values(categoryMap).map(item => ({
    ...item,
    percentage: total > 0 ? (item.amount / total) * 100 : 0,
  }));

  // Sort descending by amount
  items.sort((a, b) => b.amount - a.amount);

  return {
    total,
    items,
  };
}
