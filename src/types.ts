export type AccountType = 
  | 'bank' 
  | 'cash' 
  | 'wallet' 
  | 'credit_card' 
  | 'savings' 
  | 'investment' 
  | 'other';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  currency: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  category_id?: string | null;
  account_id?: string | null;
  from_account_id?: string | null;
  to_account_id?: string | null;
  note?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  name: string;
  category_id?: string | null; // null for overall budget
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  alert_percentage: number; // e.g. 80
  created_at: string;
  updated_at: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  transaction_id?: string | null;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  currency: string;
  currency_symbol: string;
  language: string;
  theme: 'light' | 'dark' | 'midnight' | 'forest' | 'clay' | 'system';
  passcode_enabled: boolean;
  passcode_pin?: string;
  biometric_enabled: boolean;
  auto_lock_minutes: number; // 0 = immediately, 1, 5, 15, -1 = never
  start_screen: 'daily' | 'calendar' | 'monthly' | 'total';
  date_format: string;
  notifications_enabled: boolean;
  show_totals?: boolean;
  hide_balance?: boolean;
  is_setup_completed: boolean;
  is_pro_user?: boolean;
  pro_plan?: 'monthly' | 'yearly' | 'lifetime';
  pro_unlocked_at?: string;
}

export interface TransactionFilter {
  query?: string;
  type?: TransactionType | 'all';
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}
