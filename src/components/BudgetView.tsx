import React, { useState } from 'react';
import { Plus, Wallet, AlertTriangle, CheckCircle, Trash2, Edit2, X, Sparkles, Infinity } from 'lucide-react';
import { Budget, Transaction, Category, UserSettings } from '../types';
import { calculateBudgetSpent, formatCurrency, getTodayISOString } from '../utils/formatters';
import { addBudget, deleteBudget, updateBudget } from '../data/storage';
import { CategoryIcon } from './CategoryIcon';
import { ProComingSoonModal } from './ProComingSoonModal';

interface BudgetViewProps {
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  settings: UserSettings;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  transactions,
  categories,
  settings,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  // Form state for budget creation
  const [budgetName, setBudgetName] = useState('');
  const [categoryId, setCategoryId] = useState<string>(''); // empty string = overall
  const [amount, setAmount] = useState('');
  const [alertPercentage, setAlertPercentage] = useState(80);

  const today = getTodayISOString();
  const startDate = today.substring(0, 7) + '-01';
  const endDate = today.substring(0, 7) + '-31';

  // Overall budget total calculations
  let totalBudgetAmount = 0;
  let totalSpentAmount = 0;

  budgets.forEach(b => {
    totalBudgetAmount += b.amount;
    totalSpentAmount += calculateBudgetSpent(b, transactions);
  });

  const totalRemaining = totalBudgetAmount - totalSpentAmount;
  const overallProgress = totalBudgetAmount > 0 ? (totalSpentAmount / totalBudgetAmount) * 100 : 0;

  const isPro = !!settings.is_pro_user;
  const isBudgetLimitReached = !isPro && budgets.length >= 3;

  const handleOpenCreateModal = () => {
    if (isBudgetLimitReached) {
      setShowProModal(true);
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBudgetLimitReached) {
      setShowCreateModal(false);
      setShowProModal(true);
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const catObj = categories.find(c => c.id === categoryId);
    const name = budgetName.trim() || (catObj ? `${catObj.name} Budget` : 'Monthly Overall Budget');

    addBudget({
      name,
      category_id: categoryId || null,
      amount: numAmount,
      period: 'monthly',
      start_date: startDate,
      end_date: endDate,
      alert_percentage: alertPercentage,
    });

    setBudgetName('');
    setAmount('');
    setCategoryId('');
    setShowCreateModal(false);
  };

  const getStatusColor = (progress: number, alertPct: number) => {
    if (progress >= 100) return { bg: '#C85A32', text: 'Exceeded', textColor: 'text-[#C85A32]' };
    if (progress >= alertPct) return { bg: '#D97706', text: 'Warning', textColor: 'text-[#D97706]' };
    if (progress >= 70) return { bg: '#E07A5F', text: 'Near Limit', textColor: 'text-[#E07A5F]' };
    return { bg: '#3B7A57', text: 'Safe', textColor: 'text-[#3B7A57]' };
  };

  return (
    <div className="space-y-4 pb-2">
      
      {/* Overall Budget Summary Card */}
      <div className="bento-card p-5 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center space-x-2">
              <span className="bento-pill bento-pill-olive text-[9px] mb-1">
                Monthly Budget Cap
              </span>
              {isBudgetLimitReached && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C28B70] dark:bg-[#F87171] text-white">
                  Free Limit (3/3)
                </span>
              )}
            </div>
            <h3 className="font-serif-bento text-2xl font-bold text-[#2D2926] dark:text-[#F7DE98] mt-1">
              {formatCurrency(totalBudgetAmount, settings.currency_symbol, settings.hide_balance)}
            </h3>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bento-pill bento-pill-olive hover:opacity-90 flex items-center space-x-1 cursor-pointer transition-all"
          >
            {isBudgetLimitReached ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#C28B70] dark:text-[#F7DE98]" />
                <span>Create Budget (Pro)</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Create Budget</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-[#C28B70] dark:text-[#F87171]">
              Spent: {formatCurrency(totalSpentAmount, settings.currency_symbol, settings.hide_balance)}
            </span>
            <span className={totalRemaining >= 0 ? 'text-[#5A5A40] dark:text-[#F3D372]' : 'text-[#C28B70] dark:text-[#F87171]'}>
              Remaining: {formatCurrency(totalRemaining, settings.currency_symbol, settings.hide_balance)}
            </span>
          </div>

          <div className="w-full bg-[#D6CEC3]/50 dark:bg-[rgba(212,175,55,0.15)] h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(overallProgress, 100)}%`,
                backgroundColor: overallProgress >= 100 ? '#C28B70' : overallProgress >= 80 ? '#D97706' : '#5A5A40',
              }}
            />
          </div>

          <p className="text-[10px] font-semibold text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] text-right">
            {overallProgress.toFixed(1)}% of total budget utilized
          </p>
        </div>
      </div>

      {/* Category Budgets List */}
      <div className="bento-card p-4 space-y-3">
        <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
          Category Spending Budgets
        </h3>

        {budgets.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <div className="w-12 h-12 bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] rounded-2xl flex items-center justify-center mx-auto text-[#5A5A40] dark:text-[#F7DE98]">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-[#2D2926] dark:text-[#F7EEDB]">No budgets created yet.</p>
            <p className="text-[11px] text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)]">Define spending limits to control your monthly expenses.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const spent = calculateBudgetSpent(b, transactions);
              const remaining = b.amount - spent;
              const progress = b.amount > 0 ? (spent / b.amount) * 100 : 0;
              const status = getStatusColor(progress, b.alert_percentage);

              const catObj = categories.find(c => c.id === b.category_id);

              return (
                <div key={b.id} className="p-3.5 bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] space-y-2 shadow-2xs">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="p-2 rounded-2xl text-white flex items-center justify-center shadow-2xs"
                        style={{ backgroundColor: catObj ? catObj.color : '#5A5A40' }}
                      >
                        <CategoryIcon name={catObj ? catObj.icon : 'Wallet'} size={18} />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB]">{b.name}</h4>
                        <p className="text-[10px] text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] font-medium">
                          {catObj ? catObj.name : 'Overall Spending'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`bento-pill text-[9px] py-0.5 px-2 ${
                        progress >= 100
                          ? 'bento-pill-clay'
                          : progress >= b.alert_percentage
                          ? 'bg-[#FEF3C7] text-[#D97706] border border-[#D97706]/30 dark:bg-[rgba(217,119,6,0.25)] dark:text-[#FCD34D]'
                          : 'bento-pill-olive'
                      }`}>
                        {status.text}
                      </span>
                      <button
                        onClick={() => deleteBudget(b.id)}
                        className="text-[#2D2926]/50 dark:text-[rgba(247,238,219,0.5)] hover:text-[#C28B70] dark:hover:text-[#F87171] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-[#2D2926] dark:text-[#F7EEDB]">
                        Spent: {formatCurrency(spent, settings.currency_symbol, settings.hide_balance)}
                      </span>
                      <span className={remaining >= 0 ? 'text-[#5A5A40] dark:text-[#F3D372]' : 'text-[#C28B70] dark:text-[#F87171]'}>
                        Rem: {formatCurrency(remaining, settings.currency_symbol, settings.hide_balance)} / {formatCurrency(b.amount, settings.currency_symbol, settings.hide_balance)}
                      </span>
                    </div>

                    <div className="w-full bg-[#D6CEC3]/50 dark:bg-[rgba(212,175,55,0.15)] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                          backgroundColor: progress >= 100 ? '#C28B70' : progress >= b.alert_percentage ? '#D97706' : '#5A5A40',
                        }}
                      />
                    </div>
                  </div>

                  {progress >= b.alert_percentage && (
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-[#D97706] dark:text-[#FCD34D] pt-1">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Warning: You have reached {progress.toFixed(0)}% of your {b.name}.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#F9F7F2] dark:bg-[#120F0A]/95 dark:backdrop-blur-xl w-full max-w-md rounded-[28px] p-5 border border-[#D6CEC3] dark:border-[rgba(212,175,55,0.25)] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.20)] pb-3">
              <h3 className="font-serif-bento text-base font-bold text-[#2D2926] dark:text-[#F7EEDB]">Create New Budget</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:text-[#2D2926] dark:hover:text-[#F7EEDB] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Budget Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Food Budget"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  className="w-full bg-white dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-white dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden cursor-pointer"
                >
                  <option value="" className="dark:bg-[#1A160F]">-- Overall Monthly Budget --</option>
                  {categories.filter(c => c.type === 'expense' && c.is_active).map(cat => (
                    <option key={cat.id} value={cat.id} className="dark:bg-[#1A160F]">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Budget Limit ({settings.currency_symbol})
                </label>
                <input
                  type="number"
                  placeholder="8000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Alert Percentage ({alertPercentage}%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={alertPercentage}
                  onChange={(e) => setAlertPercentage(Number(e.target.value))}
                  className="w-full accent-[#5A5A40] dark:accent-[#D4AF37]"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-[#2D2926] dark:text-[#F7DE98] bg-[#D6CEC3]/30 dark:bg-[rgba(30,26,18,0.8)] border border-transparent dark:border-[rgba(212,175,55,0.2)] rounded-full cursor-pointer hover:bg-[#D6CEC3]/50 dark:hover:bg-[rgba(45,38,25,0.9)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white dark:text-[#120F0A] bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] rounded-full shadow-xs cursor-pointer hover:opacity-95"
                >
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pro Coming Soon Modal */}
      <ProComingSoonModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        settings={settings}
      />
    </div>
  );
};
