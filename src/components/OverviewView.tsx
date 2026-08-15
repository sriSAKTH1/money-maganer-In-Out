import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  TrendingUp, TrendingDown, Wallet, ArrowRightLeft, 
  Plus, Edit2, Trash2, StickyNote, Eye, EyeOff, Sparkles 
} from 'lucide-react';
import { Transaction, Account, Category, UserSettings, NoteItem } from '../types';
import { 
  formatCurrency, 
  formatDateString, 
  getTodayISOString, 
  calculateTotalsForPeriod,
  calculateCategoryStats 
} from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';
import { addNote, deleteNote } from '../data/storage';
import { triggerHaptic } from '../utils/haptics';

export type OverviewPeriod = 'daily' | 'calendar' | 'monthly' | 'total' | 'note';

interface OverviewViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  notes: NoteItem[];
  settings: UserSettings;
  onOpenAddTx: () => void;
  onSelectTx: (tx: Transaction) => void;
  onToggleHideBalance?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  transactions,
  accounts,
  categories,
  notes,
  settings,
  onOpenAddTx,
  onSelectTx,
  onToggleHideBalance,
}) => {
  const [period, setPeriod] = useState<OverviewPeriod>(settings.start_screen || 'daily');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISOString());

  // Note creation form state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);

  // Date Navigation for Daily View
  const handlePrevDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d - 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  const handleNextDay = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d + 1);
    const newY = dateObj.getFullYear();
    const newM = String(dateObj.getMonth() + 1).padStart(2, '0');
    const newD = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${newY}-${newM}-${newD}`);
  };

  // Calculations
  const periodTotals = calculateTotalsForPeriod(transactions, selectedDate, selectedDate);
  const monthlyTotals = calculateTotalsForPeriod(
    transactions,
    selectedDate.substring(0, 7) + '-01',
    selectedDate.substring(0, 7) + '-31'
  );
  const allTimeTotals = calculateTotalsForPeriod(transactions);

  // Current month's transactions
  const monthPrefix = selectedDate.substring(0, 7);
  const monthTransactions = transactions.filter(t => t.date.startsWith(monthPrefix));

  // Category breakdowns for monthly view
  const monthlyExpenses = calculateCategoryStats('expense', monthTransactions, categories);
  const monthlyIncomes = calculateCategoryStats('income', monthTransactions, categories);

  // Handle adding a note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    addNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      date: getTodayISOString(),
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setShowAddNoteForm(false);
  };

  // Helper for category name & icon lookup
  const getCategoryInfo = (catId?: string | null) => {
    if (!catId) return { name: 'Transfer', icon: 'ArrowRightLeft', color: '#4A5D6E' };
    const cat = categories.find(c => c.id === catId);
    return cat || { name: 'General', icon: 'Folder', color: '#8E8A83' };
  };

  // Helper for account lookup
  const getAccountName = (accId?: string | null) => {
    if (!accId) return '';
    const acc = accounts.find(a => a.id === accId);
    return acc ? acc.name : '';
  };

  return (
    <div className="space-y-4 pb-2">
      
      {/* Featured Bento Hero Card */}
      <div className="bento-card-sage p-5 flex flex-col justify-between relative overflow-hidden">
        {/* Ambient background glow element */}
        <div className="absolute -right-10 -top-10 w-36 h-36 bg-white/15 dark:bg-[#D4AF37]/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="bento-pill bento-pill-light dark:bg-[rgba(212,175,55,0.22)] dark:text-[#F7DE98] dark:border dark:border-[rgba(212,175,55,0.40)] font-bold">Financial Overview</span>
            <button
              onClick={() => {
                triggerHaptic();
                onToggleHideBalance?.();
              }}
              type="button"
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer flex items-center space-x-1.5 bg-white/15 dark:bg-[rgba(26,22,15,0.7)] hover:bg-white/25 dark:hover:bg-[rgba(45,38,25,0.85)] active:scale-95 text-white dark:text-[#F7DE98] backdrop-blur-xs border border-white/20 dark:border-[rgba(212,175,55,0.30)] shadow-2xs"
              title={settings.hide_balance ? "Tap to reveal balance" : "Tap to hide balance"}
            >
              {settings.hide_balance ? (
                <>
                  <Eye className="w-3 h-3 text-white dark:text-[#F7DE98]" />
                  <span>Tap to reveal</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 text-white/80 dark:text-[rgba(247,222,152,0.85)]" />
                  <span>Hide</span>
                </>
              )}
            </button>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/80 dark:text-[rgba(247,222,152,0.85)]">
            {period === 'daily' ? 'Today' : period === 'monthly' ? 'This Month' : 'All-Time'}
          </span>
        </div>

        {/* Tappable Total Balance Display with Motion Reveal & Blur Transition */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onToggleHideBalance?.();
          }}
          className="text-left group cursor-pointer select-none focus:outline-none w-full relative z-10"
          aria-label={settings.hide_balance ? "Tap to reveal total balance" : "Tap to hide total balance"}
        >
          <div className="flex items-center space-x-2 mb-1">
            <p className="text-xs font-medium text-white/80 dark:text-[rgba(247,222,152,0.85)] uppercase tracking-wider">
              Net Cash Flow
            </p>
            {settings.hide_balance && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center text-[10px] font-bold text-white/90 dark:text-[#F7DE98] bg-white/15 dark:bg-[rgba(212,175,55,0.2)] px-1.5 py-0.5 rounded-md border border-white/10 dark:border-[rgba(212,175,55,0.3)]"
              >
                Masked
              </motion.span>
            )}
          </div>

          <div className="overflow-hidden min-h-[48px] flex items-center">
            <AnimatePresence mode="wait" initial={false}>
              {settings.hide_balance ? (
                <motion.div
                  key="masked-balance"
                  initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="flex items-center space-x-2.5 py-0.5"
                >
                  <h2 className="font-serif-bento text-3xl sm:text-4xl font-normal text-white dark:text-[#FFF4D0] tracking-tight flex items-center space-x-1.5">
                    <span>{settings.currency_symbol}</span>
                    <span className="tracking-widest text-2xl sm:text-3xl opacity-80 select-none">
                      ••••••
                    </span>
                  </h2>

                  <motion.span
                    animate={{ scale: [1, 1.12, 1], opacity: [0.75, 1, 0.75] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="p-1.5 rounded-full bg-white/20 dark:bg-[rgba(212,175,55,0.2)] text-white dark:text-[#F7DE98] backdrop-blur-xs shadow-xs text-xs flex items-center justify-center border border-white/25 dark:border-[rgba(212,175,55,0.35)]"
                    title="Tap to reveal"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </motion.span>
                </motion.div>
              ) : (
                <motion.div
                  key="unmasked-balance"
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', y: 4 }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', y: -4 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                >
                  <h2 className="font-serif-bento text-3xl sm:text-4xl font-normal text-white dark:text-[#FFF4D0] tracking-tight group-hover:opacity-95 transition-opacity">
                    {formatCurrency(
                      period === 'daily' ? periodTotals.net : period === 'monthly' ? monthlyTotals.net : allTimeTotals.net,
                      settings.currency_symbol,
                      false
                    )}
                  </h2>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>

        {/* Bottom Income & Expense Totals with Synchronized Animated Transitions */}
        <div className="mt-4 pt-3 border-t border-white/20 dark:border-[rgba(212,175,55,0.25)] flex justify-between items-center text-xs text-white/90 dark:text-[#F7DE98] relative z-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={settings.hide_balance ? 'income-masked' : 'income-unmasked'}
              initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
              transition={{ duration: 0.22 }}
              className="flex items-center space-x-1"
            >
              <TrendingUp className="w-3.5 h-3.5 text-white dark:text-[#F7DE98]" />
              <span className="font-semibold text-white dark:text-[#F7DE98]">
                +{settings.hide_balance
                  ? `${settings.currency_symbol} •••`
                  : formatCurrency(
                      period === 'daily' ? periodTotals.income : period === 'monthly' ? monthlyTotals.income : allTimeTotals.income,
                      settings.currency_symbol,
                      false
                    )}
              </span>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={settings.hide_balance ? 'expense-masked' : 'expense-unmasked'}
              initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -4, filter: 'blur(4px)' }}
              transition={{ duration: 0.22 }}
              className="flex items-center space-x-1"
            >
              <TrendingDown className="w-3.5 h-3.5 text-white/80 dark:text-[#F87171]" />
              <span className="text-white/90 dark:text-[#F87171] font-semibold">
                -{settings.hide_balance
                  ? `${settings.currency_symbol} •••`
                  : formatCurrency(
                      period === 'daily' ? periodTotals.expense : period === 'monthly' ? monthlyTotals.expense : allTimeTotals.expense,
                      settings.currency_symbol,
                      false
                    )}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex bg-[#D6CEC3]/30 dark:bg-[rgba(24,20,14,0.7)] p-1 rounded-full border border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.22)] backdrop-blur-md text-xs font-semibold">
        {(['daily', 'calendar', 'monthly', 'total', 'note'] as OverviewPeriod[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1.5 capitalize rounded-full transition-all cursor-pointer ${
              period === p
                ? 'bg-[#5A5A40] text-white dark:bg-[rgba(212,175,55,0.24)] dark:text-[#F7DE98] dark:border dark:border-[rgba(212,175,55,0.45)] dark:shadow-[0_2px_12px_rgba(212,175,55,0.25)] shadow-xs font-bold'
                : 'text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] hover:text-[#2D2926] dark:hover:text-[#F7DE98]'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Summary Bento Cards Row */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Income Card */}
        <div className="bento-card p-3.5 flex flex-col justify-between">
          <div>
            <span className="bento-pill bento-pill-olive mb-2 text-[9px] px-2 py-0.5">Income</span>
            <p className="font-serif-bento text-base font-semibold text-[#5A5A40] dark:text-[#F3D372] truncate mt-1">
              {formatCurrency(
                period === 'daily' ? periodTotals.income : period === 'monthly' ? monthlyTotals.income : allTimeTotals.income,
                settings.currency_symbol,
                settings.hide_balance
              )}
            </p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bento-card-clay p-3.5 flex flex-col justify-between">
          <div>
            <span className="bento-pill bento-pill-light dark:bg-[rgba(229,163,130,0.22)] dark:text-[#FCECE4] dark:border dark:border-[rgba(229,163,130,0.35)] mb-2 text-[9px] px-2 py-0.5">Expense</span>
            <p className="font-serif-bento text-base font-semibold text-white dark:text-[#FCECE4] truncate mt-1">
              {formatCurrency(
                period === 'daily' ? periodTotals.expense : period === 'monthly' ? monthlyTotals.expense : allTimeTotals.expense,
                settings.currency_symbol,
                settings.hide_balance
              )}
            </p>
          </div>
        </div>

        {/* Net Remaining Card */}
        <div className="bento-card-stone p-3.5 flex flex-col justify-between">
          <div>
            <span className="bento-pill bento-pill-dark mb-2 text-[9px] px-2 py-0.5">Net</span>
            <p className="font-serif-bento text-base font-semibold text-[#2D2926] dark:text-[#F7EEDB] truncate mt-1">
              {formatCurrency(
                period === 'daily' ? periodTotals.net : period === 'monthly' ? monthlyTotals.net : allTimeTotals.net,
                settings.currency_symbol,
                settings.hide_balance
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ----------------- DAILY VIEW ----------------- */}
      {period === 'daily' && (
        <div className="space-y-3">
          {/* Date Picker Bar */}
          <div className="bento-card p-3 flex items-center justify-between">
            <button
              onClick={handlePrevDay}
              className="p-2 rounded-full bg-[#D6CEC3]/30 dark:bg-[rgba(26,22,15,0.75)] hover:bg-[#D6CEC3]/60 dark:hover:bg-[rgba(45,38,25,0.85)] text-[#2D2926] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.25)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#F7EEDB] italic">
                {formatDateString(selectedDate, 'full')}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 rounded-full bg-[#D6CEC3]/30 dark:bg-[rgba(26,22,15,0.75)] hover:bg-[#D6CEC3]/60 dark:hover:bg-[rgba(45,38,25,0.85)] text-[#2D2926] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.25)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Today's Transactions List */}
          <div className="bento-card p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#D6CEC3]/30 dark:border-[rgba(212,175,55,0.2)] pb-2.5">
              <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
                Daily Ledger ({transactions.filter(t => t.date === selectedDate).length})
              </h3>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  onOpenAddTx();
                }}
                className="bento-pill bento-pill-olive hover:opacity-90 active:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Log New</span>
              </button>
            </div>

            {transactions.filter(t => t.date === selectedDate).length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 bg-[#D6CEC3]/30 dark:bg-[rgba(26,22,15,0.7)] rounded-2xl flex items-center justify-center mx-auto text-[#5A5A40] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.2)]">
                  <Wallet className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-[#2D2926] dark:text-[#F7EEDB]">No activity recorded for this date.</p>
                <p className="text-[11px] text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)]">Tap "+ Log New" to record expenses or income.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions
                  .filter(t => t.date === selectedDate)
                  .map((tx, idx) => {
                    const catInfo = getCategoryInfo(tx.category_id);
                    const isIncome = tx.type === 'income';
                    const isExpense = tx.type === 'expense';

                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-20px' }}
                        transition={{ duration: 0.28, delay: Math.min(idx * 0.04, 0.24), ease: 'easeOut' }}
                        onClick={() => onSelectTx(tx)}
                        className="p-3.5 rounded-2xl bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] hover:bg-[#D6CEC3]/20 dark:hover:bg-[rgba(42,36,24,0.85)] border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className="p-2.5 rounded-2xl flex items-center justify-center text-white shadow-2xs"
                            style={{ backgroundColor: tx.type === 'transfer' ? '#A1A892' : catInfo.color }}
                          >
                            <CategoryIcon
                              name={tx.type === 'transfer' ? 'ArrowRightLeft' : catInfo.icon}
                              size={18}
                            />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB]">
                              {tx.type === 'transfer' ? 'Transfer' : catInfo.name}
                            </p>
                            <p className="text-[10px] font-medium text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)]">
                              {tx.type === 'transfer'
                                ? `${getAccountName(tx.from_account_id)} ➔ ${getAccountName(tx.to_account_id)}`
                                : `${getAccountName(tx.account_id)} ${tx.note ? `• ${tx.note}` : ''}`}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className={`font-serif-bento text-sm font-bold ${
                            isIncome ? 'text-[#5A5A40] dark:text-[#F3D372]' : isExpense ? 'text-[#C28B70] dark:text-[#F87171]' : 'text-[#A1A892] dark:text-[#E8DFC8]'
                          }`}>
                            {isIncome ? '+' : isExpense ? '-' : ''}
                            {formatCurrency(tx.amount, settings.currency_symbol, settings.hide_balance)}
                          </p>
                          <span className="bento-pill bento-pill-stone text-[8px] py-0 px-1.5 mt-0.5">
                            {tx.type}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- CALENDAR VIEW ----------------- */}
      {period === 'calendar' && (
        <CalendarWidget
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          settings={settings}
          onSelectTx={onSelectTx}
        />
      )}

      {/* ----------------- MONTHLY VIEW ----------------- */}
      {period === 'monthly' && (
        <div className="space-y-4">
          <div className="bento-card p-4 space-y-3">
            <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
              {formatDateString(selectedDate, 'full').split(' ').slice(1).join(' ')} Summary
            </h3>

            {/* Income breakdown */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-[#5A5A40] dark:text-[#F3D372] uppercase tracking-wider flex items-center justify-between">
                <span>Income Breakdown</span>
                <span className="font-serif-bento font-bold text-sm text-[#5A5A40] dark:text-[#F3D372]">{formatCurrency(monthlyIncomes.total, settings.currency_symbol, settings.hide_balance)}</span>
              </p>
              {monthlyIncomes.items.length === 0 ? (
                <p className="text-xs text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] italic">No income logged this month.</p>
              ) : (
                monthlyIncomes.items.map(item => (
                  <div key={item.category.id} className="p-2.5 bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] text-xs">
                    <div className="flex justify-between font-semibold text-[#2D2926] dark:text-[#F7EEDB] mb-1">
                      <span>{item.category.name}</span>
                      <span className="text-[#5A5A40] dark:text-[#F3D372]">{formatCurrency(item.amount, settings.currency_symbol, settings.hide_balance)} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-[#D6CEC3]/50 dark:bg-[rgba(212,175,55,0.15)] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Expense breakdown */}
            <div className="space-y-2 pt-2">
              <p className="text-[11px] font-bold text-[#C28B70] dark:text-[#F87171] uppercase tracking-wider flex items-center justify-between">
                <span>Expense Breakdown</span>
                <span className="font-serif-bento font-bold text-sm text-[#C28B70] dark:text-[#F87171]">{formatCurrency(monthlyExpenses.total, settings.currency_symbol, settings.hide_balance)}</span>
              </p>
              {monthlyExpenses.items.length === 0 ? (
                <p className="text-xs text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] italic">No expenses logged this month.</p>
              ) : (
                monthlyExpenses.items.map(item => (
                  <div key={item.category.id} className="p-2.5 bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] text-xs">
                    <div className="flex justify-between font-semibold text-[#2D2926] dark:text-[#F7EEDB] mb-1">
                      <span>{item.category.name}</span>
                      <span className="text-[#C28B70] dark:text-[#F87171]">{formatCurrency(item.amount, settings.currency_symbol, settings.hide_balance)} ({item.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-[#D6CEC3]/50 dark:bg-[rgba(229,163,130,0.15)] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#C28B70] dark:bg-gradient-to-r dark:from-[#C28B70] dark:to-[#F87171] h-full rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TOTAL VIEW ----------------- */}
      {period === 'total' && (
        <div className="bento-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-bento text-base font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
              All-Time Financial Balance
            </h3>
            {onToggleHideBalance && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onToggleHideBalance();
                }}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer flex items-center space-x-1 bg-[#D6CEC3]/40 dark:bg-[rgba(26,22,15,0.7)] hover:bg-[#D6CEC3]/70 dark:hover:bg-[rgba(45,38,25,0.85)] text-[#2D2926] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.25)]"
              >
                {settings.hide_balance ? (
                  <>
                    <Eye className="w-3 h-3 text-[#5A5A40] dark:text-[#F7DE98]" />
                    <span>Reveal</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 text-[#C28B70] dark:text-[#F87171]" />
                    <span>Hide</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div
            onClick={() => {
              triggerHaptic();
              onToggleHideBalance?.();
            }}
            className="p-4 bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.2)] space-y-3 cursor-pointer select-none group"
            title="Tap to toggle visibility"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)]">Total Income Received</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={settings.hide_balance ? 'tot-inc-mask' : 'tot-inc-val'}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  className="font-serif-bento font-bold text-[#5A5A40] dark:text-[#F3D372] text-sm"
                >
                  {formatCurrency(allTimeTotals.income, settings.currency_symbol, settings.hide_balance)}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)]">Total Expenses Paid</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={settings.hide_balance ? 'tot-exp-mask' : 'tot-exp-val'}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  className="font-serif-bento font-bold text-[#C28B70] dark:text-[#F87171] text-sm"
                >
                  {formatCurrency(allTimeTotals.expense, settings.currency_symbol, settings.hide_balance)}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="border-t border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.2)] pt-2 flex justify-between items-center text-sm">
              <span className="font-bold text-[#2D2926] dark:text-[#F7EEDB]">Net Financial Reserve</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={settings.hide_balance ? 'tot-net-mask' : 'tot-net-val'}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="font-serif-bento font-bold text-[#5A5A40] dark:text-[#F7DE98] text-base"
                >
                  {formatCurrency(allTimeTotals.net, settings.currency_symbol, settings.hide_balance)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="text-xs text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.6)]">
            <p className="font-semibold text-[#2D2926] dark:text-[#F7EEDB] mb-1">Total System Transactions</p>
            <p>{transactions.length} records securely stored offline on local device.</p>
          </div>
        </div>
      )}

      {/* ----------------- NOTE VIEW ----------------- */}
      {period === 'note' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
              Financial Notes & Journal
            </h3>
            <button
              onClick={() => setShowAddNoteForm(!showAddNoteForm)}
              className="bento-pill bento-pill-olive hover:opacity-90 transition-all cursor-pointer"
            >
              + New Entry
            </button>
          </div>

          {showAddNoteForm && (
            <form onSubmit={handleSaveNote} className="bento-card p-4 space-y-3">
              <input
                type="text"
                placeholder="Note Title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                required
                className="w-full bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.75)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-bold p-3 rounded-2xl border border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden focus:border-[#5A5A40] dark:focus:border-[#D4AF37]"
              />
              <textarea
                placeholder="Details or financial goals..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={3}
                className="w-full bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.75)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-medium p-3 rounded-2xl border border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden focus:border-[#5A5A40] dark:focus:border-[#D4AF37] resize-none"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddNoteForm(false)}
                  className="bento-pill bento-pill-stone cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bento-pill bento-pill-olive cursor-pointer"
                >
                  Save Entry
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {notes.length === 0 ? (
              <div className="p-8 text-center bento-card text-xs text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)]">
                No financial notes created yet.
              </div>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="bento-card p-4 space-y-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB] flex items-center space-x-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-[#5A5A40] dark:text-[#F7DE98]" />
                      <span>{note.title}</span>
                    </h4>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-[#2D2926]/50 dark:text-[rgba(247,238,219,0.5)] hover:text-[#C28B70] dark:hover:text-[#F87171] p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-[#2D2926]/80 dark:text-[rgba(247,238,219,0.75)] whitespace-pre-wrap">{note.content}</p>
                  <p className="text-[10px] text-[#2D2926]/50 dark:text-[rgba(247,238,219,0.45)] pt-1">{formatDateString(note.date, 'full')}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ----------------- RECENT TRANSACTIONS STREAM ----------------- */}
      {period !== 'calendar' && period !== 'note' && (
        <div className="bento-card p-4 space-y-3">
          <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
            Recent Transactions
          </h3>

          <div className="space-y-2">
            {transactions.slice(0, 8).map((tx, idx) => {
              const catInfo = getCategoryInfo(tx.category_id);
              const isIncome = tx.type === 'income';
              const isExpense = tx.type === 'expense';

              return (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.26, delay: Math.min(idx * 0.04, 0.24), ease: 'easeOut' }}
                  onClick={() => onSelectTx(tx)}
                  className="p-3 rounded-2xl bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] hover:bg-[#D6CEC3]/20 dark:hover:bg-[rgba(42,36,24,0.85)] border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] flex items-center justify-between cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className="p-2.5 rounded-2xl flex items-center justify-center text-white shadow-2xs"
                      style={{ backgroundColor: tx.type === 'transfer' ? '#A1A892' : catInfo.color }}
                    >
                      <CategoryIcon
                        name={tx.type === 'transfer' ? 'ArrowRightLeft' : catInfo.icon}
                        size={18}
                      />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB]">
                        {tx.type === 'transfer' ? 'Transfer' : catInfo.name}
                      </p>
                      <p className="text-[10px] font-medium text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)]">
                        {formatDateString(tx.date, 'short')} • {tx.type === 'transfer' ? getAccountName(tx.from_account_id) : getAccountName(tx.account_id)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-serif-bento text-sm font-bold ${
                      isIncome ? 'text-[#5A5A40] dark:text-[#F3D372]' : isExpense ? 'text-[#C28B70] dark:text-[#F87171]' : 'text-[#A1A892] dark:text-[#E8DFC8]'
                    }`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCurrency(tx.amount, settings.currency_symbol, settings.hide_balance)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

// Interactive Calendar Widget
interface CalendarWidgetProps {
  selectedDate: string;
  onSelectDate: (d: string) => void;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  settings: UserSettings;
  onSelectTx: (tx: Transaction) => void;
}

const CalendarWidget: React.FC<CalendarWidgetProps> = ({
  selectedDate,
  onSelectDate,
  transactions,
  categories,
  accounts,
  settings,
  onSelectTx,
}) => {
  const [currentYearMonth, setCurrentYearMonth] = useState<string>(selectedDate.substring(0, 7));

  const [yearStr, monthStr] = currentYearMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    const prevDate = new Date(year, month - 2, 1);
    const y = prevDate.getFullYear();
    const m = String(prevDate.getMonth() + 1).padStart(2, '0');
    setCurrentYearMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const nextDate = new Date(year, month, 1);
    const y = nextDate.getFullYear();
    const m = String(nextDate.getMonth() + 1).padStart(2, '0');
    setCurrentYearMonth(`${y}-${m}`);
  };

  // Day transactions
  const selectedDayTx = transactions.filter(t => t.date === selectedDate);
  const dayTotals = calculateTotalsForPeriod(transactions, selectedDate, selectedDate);

  return (
    <div className="space-y-3">
      {/* Calendar Card */}
      <div className="bento-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
            {monthNames[month - 1]} {year}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full bg-[#D6CEC3]/30 dark:bg-[rgba(26,22,15,0.75)] hover:bg-[#D6CEC3]/60 dark:hover:bg-[rgba(45,38,25,0.85)] text-[#2D2926] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.25)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full bg-[#D6CEC3]/30 dark:bg-[rgba(26,22,15,0.75)] hover:bg-[#D6CEC3]/60 dark:hover:bg-[rgba(45,38,25,0.85)] text-[#2D2926] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.25)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d} className="text-[10px] font-bold text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.55)] uppercase">
              {d}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-9" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isSelected = dateStr === selectedDate;

            // Check indicators
            const dayTxs = transactions.filter(t => t.date === dateStr);
            const hasIncome = dayTxs.some(t => t.type === 'income');
            const hasExpense = dayTxs.some(t => t.type === 'expense');

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                className={`h-9 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-[#5A5A40] text-white dark:bg-[rgba(212,175,55,0.28)] dark:text-[#F7DE98] dark:border dark:border-[rgba(212,175,55,0.5)] dark:shadow-[0_2px_12px_rgba(212,175,55,0.35)] shadow-xs'
                    : 'bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.6)] hover:bg-[#D6CEC3]/30 dark:hover:bg-[rgba(42,36,24,0.8)] text-[#2D2926] dark:text-[#F7EEDB] border border-transparent dark:border-[rgba(212,175,55,0.15)]'
                }`}
              >
                <span>{dayNum}</span>
                <div className="flex space-x-0.5 mt-0.5">
                  {hasIncome && <span className="w-1 h-1 rounded-full bg-[#5A5A40] dark:bg-[#D4AF37]" />}
                  {hasExpense && <span className="w-1 h-1 rounded-full bg-[#C28B70] dark:bg-[#F87171]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Breakdown Card */}
      <div className="bento-card p-4 space-y-3">
        <div className="flex justify-between items-center border-b border-[#D6CEC3]/30 dark:border-[rgba(212,175,55,0.2)] pb-2">
          <p className="font-serif-bento text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB] italic">
            {formatDateString(selectedDate, 'full')}
          </p>
          <p className="font-serif-bento text-xs font-bold text-[#5A5A40] dark:text-[#F7DE98]">
            Net: {formatCurrency(dayTotals.net, settings.currency_symbol, settings.hide_balance)}
          </p>
        </div>

        {selectedDayTx.length === 0 ? (
          <p className="text-xs text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] italic py-2">No transactions recorded on this date.</p>
        ) : (
          <div className="space-y-2">
            {selectedDayTx.map((tx, idx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: Math.min(idx * 0.03, 0.2), ease: 'easeOut' }}
                onClick={() => onSelectTx(tx)}
                className="p-3 bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] flex justify-between items-center cursor-pointer hover:bg-[#D6CEC3]/20 dark:hover:bg-[rgba(42,36,24,0.85)] transition-colors"
              >
                <span className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB]">{tx.note || tx.type.toUpperCase()}</span>
                <span className={`font-serif-bento text-xs font-bold ${tx.type === 'income' ? 'text-[#5A5A40] dark:text-[#F3D372]' : 'text-[#C28B70] dark:text-[#F87171]'}`}>
                  {formatCurrency(tx.amount, settings.currency_symbol, settings.hide_balance)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
