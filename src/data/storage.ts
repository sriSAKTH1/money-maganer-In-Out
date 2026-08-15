import { Account, Category, Transaction, Budget, NoteItem, UserSettings } from '../types';
import { 
  DEFAULT_ACCOUNTS, 
  DEFAULT_CATEGORIES, 
  DEFAULT_TRANSACTIONS, 
  DEFAULT_BUDGETS, 
  DEFAULT_NOTES, 
  DEFAULT_SETTINGS 
} from './defaultData';

const KEYS = {
  ACCOUNTS: 'money_manager_accounts_v1',
  CATEGORIES: 'money_manager_categories_v1',
  TRANSACTIONS: 'money_manager_transactions_v1',
  BUDGETS: 'money_manager_budgets_v1',
  NOTES: 'money_manager_notes_v1',
  SETTINGS: 'money_manager_settings_v1',
};

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach(fn => fn());
}

// Storage helpers
function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading storage key ${key}:`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (err) {
    console.error(`Error writing storage key ${key}:`, err);
  }
}

// Initializer
export function initializeStorageIfNeeded(): void {
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    setStorageItem(KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(KEYS.ACCOUNTS)) {
    setStorageItem(KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    setStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  } else {
    // Migration: Update default income category colors to new distinct vibrant palette if previously saved with legacy muted greens
    try {
      const storedCategories = getStorageItem<Category[]>(KEYS.CATEGORIES, []);
      let hasUpdates = false;
      const updatedCategories = storedCategories.map(cat => {
        const defaultMatch = DEFAULT_CATEGORIES.find(dc => dc.id === cat.id);
        if (defaultMatch && defaultMatch.type === 'income' && cat.color !== defaultMatch.color && (
          cat.color === '#3B7A57' || cat.color === '#4A7C59' || cat.color === '#688B58' ||
          cat.color === '#2A6F40' || cat.color === '#76946A' || cat.color === '#8E9A82'
        )) {
          hasUpdates = true;
          return { ...cat, color: defaultMatch.color };
        }
        return cat;
      });
      if (hasUpdates) {
        setStorageItem(KEYS.CATEGORIES, updatedCategories);
      }
    } catch {
      // Ignore migration errors
    }
  }
  if (!localStorage.getItem(KEYS.TRANSACTIONS)) {
    setStorageItem(KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  }
  if (!localStorage.getItem(KEYS.BUDGETS)) {
    setStorageItem(KEYS.BUDGETS, DEFAULT_BUDGETS);
  }
  if (!localStorage.getItem(KEYS.NOTES)) {
    setStorageItem(KEYS.NOTES, DEFAULT_NOTES);
  }
}

// Settings
export function getSettings(): UserSettings {
  return getStorageItem(KEYS.SETTINGS, DEFAULT_SETTINGS);
}

export function saveSettings(settings: Partial<UserSettings>): UserSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  setStorageItem(KEYS.SETTINGS, updated);
  return updated;
}

// Accounts CRUD
export function getAccounts(): Account[] {
  return getStorageItem(KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
}

export function addAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Account {
  const accounts = getAccounts();
  const now = new Date().toISOString();
  const newAccount: Account = {
    ...account,
    id: 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    created_at: now,
    updated_at: now,
  };
  accounts.push(newAccount);
  setStorageItem(KEYS.ACCOUNTS, accounts);
  return newAccount;
}

export function updateAccount(id: string, updates: Partial<Account>): Account | null {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx === -1) return null;
  accounts[idx] = {
    ...accounts[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setStorageItem(KEYS.ACCOUNTS, accounts);
  return accounts[idx];
}

export function deleteAccount(id: string): boolean {
  const accounts = getAccounts();
  // Soft archive to keep historical data intact
  const idx = accounts.findIndex(a => a.id === id);
  if (idx === -1) return false;
  accounts[idx].is_active = false;
  accounts[idx].updated_at = new Date().toISOString();
  setStorageItem(KEYS.ACCOUNTS, accounts);
  return true;
}

// Categories CRUD
export function getCategories(): Category[] {
  return getStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
}

export function addCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Category {
  const categories = getCategories();
  const now = new Date().toISOString();
  const newCategory: Category = {
    ...category,
    id: 'cat_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    created_at: now,
    updated_at: now,
  };
  categories.push(newCategory);
  setStorageItem(KEYS.CATEGORIES, categories);
  return newCategory;
}

export function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return null;
  categories[idx] = {
    ...categories[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setStorageItem(KEYS.CATEGORIES, categories);
  return categories[idx];
}

export function archiveCategory(id: string): boolean {
  const categories = getCategories();
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) return false;
  categories[idx].is_active = false;
  categories[idx].updated_at = new Date().toISOString();
  setStorageItem(KEYS.CATEGORIES, categories);
  return true;
}

export function deleteCategory(id: string): boolean {
  const categories = getCategories();
  const filtered = categories.filter(c => c.id !== id);
  if (filtered.length === categories.length) return false;
  setStorageItem(KEYS.CATEGORIES, filtered);
  return true;
}

// Transactions CRUD
export function getTransactions(): Transaction[] {
  const list = getStorageItem<Transaction[]>(KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  // Sort descending by date, then created_at
  return list.sort((a, b) => {
    if (a.date !== b.date) {
      return b.date.localeCompare(a.date);
    }
    return b.created_at.localeCompare(a.created_at);
  });
}

export function addTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Transaction {
  const transactions = getTransactions();
  const now = new Date().toISOString();
  const newTx: Transaction = {
    ...transaction,
    id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    created_at: now,
    updated_at: now,
  };
  transactions.push(newTx);
  setStorageItem(KEYS.TRANSACTIONS, transactions);
  return newTx;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
  const transactions = getTransactions();
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return null;
  transactions[idx] = {
    ...transactions[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setStorageItem(KEYS.TRANSACTIONS, transactions);
  return transactions[idx];
}

export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  if (filtered.length === transactions.length) return false;
  setStorageItem(KEYS.TRANSACTIONS, filtered);
  return true;
}

// Budgets CRUD
export function getBudgets(): Budget[] {
  return getStorageItem(KEYS.BUDGETS, DEFAULT_BUDGETS);
}

export function addBudget(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Budget {
  const budgets = getBudgets();
  const now = new Date().toISOString();
  const newBudget: Budget = {
    ...budget,
    id: 'bud_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    created_at: now,
    updated_at: now,
  };
  budgets.push(newBudget);
  setStorageItem(KEYS.BUDGETS, budgets);
  return newBudget;
}

export function updateBudget(id: string, updates: Partial<Budget>): Budget | null {
  const budgets = getBudgets();
  const idx = budgets.findIndex(b => b.id === id);
  if (idx === -1) return null;
  budgets[idx] = {
    ...budgets[idx],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  setStorageItem(KEYS.BUDGETS, budgets);
  return budgets[idx];
}

export function deleteBudget(id: string): boolean {
  const budgets = getBudgets();
  const filtered = budgets.filter(b => b.id !== id);
  if (filtered.length === budgets.length) return false;
  setStorageItem(KEYS.BUDGETS, filtered);
  return true;
}

// Notes CRUD
export function getNotes(): NoteItem[] {
  const notes = getStorageItem<NoteItem[]>(KEYS.NOTES, DEFAULT_NOTES);
  return notes.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addNote(note: Omit<NoteItem, 'id' | 'created_at' | 'updated_at'>): NoteItem {
  const notes = getNotes();
  const now = new Date().toISOString();
  const newNote: NoteItem = {
    ...note,
    id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    created_at: now,
    updated_at: now,
  };
  notes.push(newNote);
  setStorageItem(KEYS.NOTES, notes);
  return newNote;
}

export function deleteNote(id: string): boolean {
  const notes = getNotes();
  const filtered = notes.filter(n => n.id !== id);
  if (filtered.length === notes.length) return false;
  setStorageItem(KEYS.NOTES, filtered);
  return true;
}

// Backup & Restore
export function exportBackupJSON(): string {
  const backup = {
    version: 1,
    export_date: new Date().toISOString(),
    settings: getSettings(),
    accounts: getAccounts(),
    categories: getCategories(),
    transactions: getTransactions(),
    budgets: getBudgets(),
    notes: getNotes(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data.accounts || !data.transactions) {
      throw new Error('Invalid backup file format');
    }
    if (data.settings) setStorageItem(KEYS.SETTINGS, data.settings);
    if (data.accounts) setStorageItem(KEYS.ACCOUNTS, data.accounts);
    if (data.categories) setStorageItem(KEYS.CATEGORIES, data.categories);
    if (data.transactions) setStorageItem(KEYS.TRANSACTIONS, data.transactions);
    if (data.budgets) setStorageItem(KEYS.BUDGETS, data.budgets);
    if (data.notes) setStorageItem(KEYS.NOTES, data.notes);
    return true;
  } catch (err) {
    console.error('Failed to import backup:', err);
    return false;
  }
}

export function resetDatabaseToDefault(): void {
  setStorageItem(KEYS.SETTINGS, DEFAULT_SETTINGS);
  setStorageItem(KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  setStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  setStorageItem(KEYS.TRANSACTIONS, DEFAULT_TRANSACTIONS);
  setStorageItem(KEYS.BUDGETS, DEFAULT_BUDGETS);
  setStorageItem(KEYS.NOTES, DEFAULT_NOTES);
}

export function resetAllDataToEmpty(): void {
  const currentSettings = getSettings();
  setStorageItem(KEYS.SETTINGS, {
    ...currentSettings,
    hide_balance: false,
  });
  setStorageItem(KEYS.ACCOUNTS, [
    {
      id: 'acc_cash_main',
      name: 'Cash Wallet',
      type: 'cash',
      initial_balance: 0,
      currency: currentSettings.currency || '₹ INR',
      icon: 'Banknote',
      color: '#5A5A40',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);
  setStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  setStorageItem(KEYS.TRANSACTIONS, []);
  setStorageItem(KEYS.BUDGETS, []);
  setStorageItem(KEYS.NOTES, []);
}

export function deleteUserAccountAndData(): void {
  try {
    localStorage.removeItem('mm_user_name');
    localStorage.removeItem('mm_user_email');
    localStorage.removeItem('money_manager_theme_mode');
    
    // Clear all storage keys
    Object.values(KEYS).forEach(k => {
      localStorage.removeItem(k);
    });

    // Reinitialize in fresh onboarding state
    const cleanSettings: UserSettings = {
      ...DEFAULT_SETTINGS,
      passcode_enabled: false,
      passcode_pin: '',
      is_setup_completed: false,
    };
    setStorageItem(KEYS.SETTINGS, cleanSettings);
    setStorageItem(KEYS.ACCOUNTS, []);
    setStorageItem(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    setStorageItem(KEYS.TRANSACTIONS, []);
    setStorageItem(KEYS.BUDGETS, []);
    setStorageItem(KEYS.NOTES, []);
  } catch (err) {
    console.error('Error deleting user account and data:', err);
  }
}

// CSV Export
export function exportTransactionsCSV(): string {
  const transactions = getTransactions();
  const categories = getCategories();
  const accounts = getAccounts();

  const headers = ['Date', 'Type', 'Amount', 'Category', 'Account', 'From Account', 'To Account', 'Note', 'Description'];
  const rows = transactions.map(tx => {
    let catName = '';
    if (tx.category_id) {
      const c = categories.find(cat => cat.id === tx.category_id);
      if (c) catName = c.name;
    }

    let accName = '';
    if (tx.account_id) {
      const a = accounts.find(acc => acc.id === tx.account_id);
      if (a) accName = a.name;
    }

    let fromAccName = '';
    if (tx.from_account_id) {
      const a = accounts.find(acc => acc.id === tx.from_account_id);
      if (a) fromAccName = a.name;
    }

    let toAccName = '';
    if (tx.to_account_id) {
      const a = accounts.find(acc => acc.id === tx.to_account_id);
      if (a) toAccName = a.name;
    }

    return [
      tx.date,
      tx.type,
      tx.amount,
      `"${catName.replace(/"/g, '""')}"`,
      `"${accName.replace(/"/g, '""')}"`,
      `"${fromAccName.replace(/"/g, '""')}"`,
      `"${toAccName.replace(/"/g, '""')}"`,
      `"${(tx.note || '').replace(/"/g, '""')}"`,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
