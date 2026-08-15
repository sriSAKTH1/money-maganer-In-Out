import React, { useState, useEffect } from 'react';
import { 
  initializeStorageIfNeeded, 
  subscribeStorage, 
  getSettings, 
  saveSettings,
  getAccounts, 
  getCategories, 
  getTransactions, 
  getBudgets, 
  getNotes 
} from './data/storage';
import { Account, Category, Transaction, Budget, NoteItem, UserSettings } from './types';
import { Navigation, NavTab } from './components/Navigation';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { StatsView } from './components/StatsView';
import { BudgetView } from './components/BudgetView';
import { AccountView } from './components/AccountView';
import { MoreView } from './components/MoreView';
import { AddTransactionModal } from './components/AddTransactionModal';
import { SearchModal } from './components/SearchModal';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { LockScreen } from './components/LockScreen';
import { SetupWizard } from './components/SetupWizard';
import { triggerHaptic } from './utils/haptics';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  // App reactive state
  const [settings, setSettings] = useState<UserSettings>(getSettings());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<NavTab>('overview');

  // Modals state
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Passcode lock state
  const [isLocked, setIsLocked] = useState(false);

  // Setup wizard state
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    initializeStorageIfNeeded();
    const loadedSettings = getSettings();
    setSettings(loadedSettings);

    if (!loadedSettings.is_setup_completed) {
      setShowSetup(true);
    }

    if (loadedSettings.passcode_enabled) {
      setIsLocked(true);
    }

    const refreshData = () => {
      setSettings(getSettings());
      setAccounts(getAccounts());
      setCategories(getCategories());
      setTransactions(getTransactions());
      setBudgets(getBudgets());
      setNotes(getNotes());
    };

    refreshData();
    setIsInitialized(true);

    const unsubscribe = subscribeStorage(refreshData);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'midnight', 'forest', 'clay');
    if (settings.theme && settings.theme !== 'light') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add(settings.theme);
      document.documentElement.setAttribute('data-theme', settings.theme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [settings.theme]);

  const handleToggleHideBalance = () => {
    const updated = { ...settings, hide_balance: !settings.hide_balance };
    setSettings(updated);
    saveSettings(updated);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center text-[#2D2926] text-sm font-bold">
        Loading Money Manager...
      </div>
    );
  }

  if (showSetup) {
    return <SetupWizard onComplete={() => setShowSetup(false)} />;
  }

  if (isLocked) {
    return <LockScreen settings={settings} onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F9F7F2] dark:bg-[#0C0B08] text-[#2D2926] dark:text-[#F7EEDB] antialiased transition-colors duration-200">
      {/* Mobile Frame Container for responsive centering */}
      <div className="max-w-md mx-auto min-h-screen bg-[#F9F7F2] dark:bg-[#0C0B08] shadow-2xl flex flex-col relative pb-20">
        
        {/* Header */}
        <Header
          title={
            activeTab === 'overview' ? 'Overview' :
            activeTab === 'stats' ? 'Statistics' :
            activeTab === 'budget' ? 'Budgets' :
            activeTab === 'account' ? 'Accounts' : 'More Settings'
          }
          subtitle={
            activeTab === 'overview' ? 'Financial Summary & Activity' :
            activeTab === 'stats' ? 'Category Income & Expense Analytics' :
            activeTab === 'budget' ? 'Monthly Spending Controls' :
            activeTab === 'account' ? 'Net Worth & Money Sources' : 'Preferences & Data Tools'
          }
          settings={settings}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAddTransaction={() => setIsAddTxOpen(true)}
          onLockApp={() => setIsLocked(true)}
          onToggleHideBalance={handleToggleHideBalance}
        />

        {/* Tab View Content */}
        <main className="flex-1 px-4 pt-4">
          {activeTab === 'overview' && (
            <OverviewView
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              notes={notes}
              settings={settings}
              onOpenAddTx={() => setIsAddTxOpen(true)}
              onSelectTx={(tx) => setSelectedTx(tx)}
              onToggleHideBalance={handleToggleHideBalance}
            />
          )}

          {activeTab === 'stats' && (
            <StatsView
              transactions={transactions}
              categories={categories}
              settings={settings}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetView
              budgets={budgets}
              transactions={transactions}
              categories={categories}
              settings={settings}
            />
          )}

          {activeTab === 'account' && (
            <AccountView
              accounts={accounts}
              transactions={transactions}
              settings={settings}
              onOpenAddTx={() => setIsAddTxOpen(true)}
            />
          )}

          {activeTab === 'more' && (
            <MoreView
              settings={settings}
              categories={categories}
              onLockApp={() => setIsLocked(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {/* Global Page Footer on all tabs */}
          <footer className="pt-1 pb-20 text-center select-none">
            <p className="text-[10px] font-medium text-[#2D2926]/40 dark:text-[#E8E4DC]/40 tracking-wider">
              © 2026 niceTRY • v1.1.0
            </p>
          </footer>
        </main>

        {/* Global Floating Bento "+" Button */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setIsAddTxOpen(true);
          }}
          className="fixed bottom-20 right-4 z-20 w-14 h-14 bg-[#5A5A40] hover:bg-[#484833] dark:bg-gradient-to-tr dark:from-[#A87E1C] dark:via-[#D4AF37] dark:to-[#F7DE98] text-white dark:text-[#120F08] font-semibold rounded-full flex items-center justify-center shadow-xl dark:shadow-[0_4px_24px_rgba(212,175,55,0.45)] transition-all transform active:scale-90 active:rotate-45 border-2 border-[#F9F7F2] dark:border-[#1A160F] cursor-pointer"
          title="Add New Transaction"
        >
          <span className="text-3xl font-light leading-none mb-1">+</span>
        </button>

        {/* Bottom Navigation */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
        />

        {/* Modals */}
        <AddTransactionModal
          isOpen={isAddTxOpen}
          onClose={() => setIsAddTxOpen(false)}
          categories={categories}
          accounts={accounts}
          settings={settings}
        />

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          settings={settings}
          onSelectTx={(tx) => setSelectedTx(tx)}
        />

        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          categories={categories}
          accounts={accounts}
          settings={settings}
        />

      </div>
    </div>
  );
}
