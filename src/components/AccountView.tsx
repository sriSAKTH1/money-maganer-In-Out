import React, { useState } from 'react';
import { Plus, Building2, Banknote, CreditCard, PiggyBank, ArrowRightLeft, Wallet, X, Trash2, Sparkles, Infinity } from 'lucide-react';
import { Account, AccountType, Transaction, UserSettings } from '../types';
import { calculateAccountBalance, calculateNetWorth, formatCurrency, formatDateString } from '../utils/formatters';
import { addAccount, deleteAccount } from '../data/storage';
import { ProComingSoonModal } from './ProComingSoonModal';

interface AccountViewProps {
  accounts: Account[];
  transactions: Transaction[];
  settings: UserSettings;
  onOpenAddTx: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  accounts,
  transactions,
  settings,
  onOpenAddTx,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Form state for adding account
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [accountColor, setAccountColor] = useState('#3E5242');

  const activeAccounts = accounts.filter(a => a.is_active);
  const netWorth = calculateNetWorth(accounts, transactions);

  const isPro = !!settings.is_pro_user;
  const isLimitReached = !isPro && activeAccounts.length >= 4;

  const handleOpenAddModal = () => {
    if (isLimitReached) {
      setShowProModal(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLimitReached) {
      setShowAddModal(false);
      setShowProModal(true);
      return;
    }
    if (!accountName.trim()) return;
    const numInitial = parseFloat(initialBalance) || 0;

    let icon = 'Building2';
    if (accountType === 'cash') icon = 'Banknote';
    else if (accountType === 'credit_card') icon = 'CreditCard';
    else if (accountType === 'savings') icon = 'PiggyBank';

    addAccount({
      name: accountName.trim(),
      type: accountType,
      initial_balance: numInitial,
      currency: settings.currency,
      icon,
      color: accountColor,
      is_active: true,
    });

    setAccountName('');
    setInitialBalance('');
    setShowAddModal(false);
  };

  const selectedAccount = activeAccounts.find(a => a.id === selectedAccountId);
  const selectedAccountTx = selectedAccount
    ? transactions.filter(t => 
        t.account_id === selectedAccount.id ||
        t.from_account_id === selectedAccount.id ||
        t.to_account_id === selectedAccount.id
      )
    : [];

  return (
    <div className="space-y-4 pb-2">
      
      {/* Total Net Worth Header Card */}
      <div className="bento-card-sage p-5 flex justify-between items-center text-white">
        <div>
          <span className="bento-pill bento-pill-light text-[9px] mb-1">
            Total Net Worth
          </span>
          <h2 className="font-serif-bento text-3xl font-bold tracking-tight text-white mt-1">
            {formatCurrency(netWorth, settings.currency_symbol, settings.hide_balance)}
          </h2>
          <p className="text-[11px] font-medium text-white/80 mt-1 flex items-center space-x-1.5 flex-wrap">
            <span>
              Across {activeAccounts.length}{!isPro ? '/4' : ''} financial accounts
            </span>
            {isLimitReached && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C28B70] text-white shadow-xs">
                Free Limit (4/4)
              </span>
            )}
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bento-pill bento-pill-light hover:opacity-90 flex items-center space-x-1 cursor-pointer transition-all"
        >
          {isLimitReached ? (
            <>
              <Sparkles className="w-3.5 h-3.5 text-[#C28B70]" />
              <span>New Account (Pro)</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>New Account</span>
            </>
          )}
        </button>
      </div>

      {/* Account Cards Grid */}
      <div className="bento-card p-4 space-y-3">
        <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#F7DE98] italic">
          Accounts Ledger
        </h3>

        <div className="space-y-2.5">
          {activeAccounts.map((acc) => {
            const currentBalance = calculateAccountBalance(acc, transactions);

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className="p-3.5 bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] hover:bg-[#D6CEC3]/30 dark:hover:bg-[rgba(45,38,25,0.85)] rounded-2xl border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] flex justify-between items-center cursor-pointer transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className="p-3 rounded-2xl text-white flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: acc.color }}
                  >
                    {acc.type === 'cash' ? (
                      <Banknote className="w-5 h-5" />
                    ) : acc.type === 'credit_card' ? (
                      <CreditCard className="w-5 h-5" />
                    ) : acc.type === 'savings' ? (
                      <PiggyBank className="w-5 h-5" />
                    ) : (
                      <Building2 className="w-5 h-5" />
                    )}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB]">{acc.name}</h4>
                    <p className="text-[10px] text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] font-semibold uppercase tracking-wider">
                      {acc.type.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-serif-bento text-sm font-bold ${currentBalance >= 0 ? 'text-[#2D2926] dark:text-[#F7DE98]' : 'text-[#C28B70] dark:text-[#F87171]'}`}>
                    {formatCurrency(currentBalance, settings.currency_symbol, settings.hide_balance)}
                  </p>
                  <p className="text-[9px] text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] font-semibold">
                    Initial: {formatCurrency(acc.initial_balance, settings.currency_symbol, settings.hide_balance)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Account Ledger Modal / Detail View */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#F9F7F2] dark:bg-[#120F0A]/95 dark:backdrop-blur-xl w-full max-w-md h-[80vh] rounded-[28px] p-5 border border-[#D6CEC3] dark:border-[rgba(212,175,55,0.25)] shadow-2xl flex flex-col space-y-3">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.20)] pb-3">
              <div>
                <h3 className="font-serif-bento text-base font-bold text-[#2D2926] dark:text-[#F7EEDB]">{selectedAccount.name}</h3>
                <p className="font-serif-bento text-xs font-bold text-[#5A5A40] dark:text-[#F7DE98]">
                  Balance: {formatCurrency(calculateAccountBalance(selectedAccount, transactions), settings.currency_symbol, settings.hide_balance)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    deleteAccount(selectedAccount.id);
                    setSelectedAccountId(null);
                  }}
                  className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:text-[#C28B70] dark:hover:text-[#F87171] p-1.5 rounded-full bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] cursor-pointer"
                  title="Archive Account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedAccountId(null)} className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:text-[#2D2926] dark:hover:text-[#F7EEDB] cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <h4 className="text-[10px] font-bold text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] uppercase tracking-wider">
                Account Transaction History
              </h4>

              {selectedAccountTx.length === 0 ? (
                <p className="text-xs text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] italic py-6 text-center">No transactions linked to this account.</p>
              ) : (
                selectedAccountTx.map(tx => (
                  <div key={tx.id} className="p-3 bg-white dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-[#2D2926] dark:text-[#F7EEDB]">{tx.note || tx.type.toUpperCase()}</p>
                      <p className="text-[10px] text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)]">{formatDateString(tx.date, 'short')}</p>
                    </div>
                    <span className={`font-serif-bento font-bold ${tx.type === 'income' ? 'text-[#5A5A40] dark:text-[#F3D372]' : tx.type === 'expense' ? 'text-[#C28B70] dark:text-[#F87171]' : 'text-[#2D2926] dark:text-[#F7DE98]'}`}>
                      {formatCurrency(tx.amount, settings.currency_symbol, settings.hide_balance)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.20)]">
              <button
                onClick={() => {
                  setSelectedAccountId(null);
                  onOpenAddTx();
                }}
                className="w-full py-2.5 bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] text-white dark:text-[#120F0A] text-xs font-bold rounded-full shadow-xs cursor-pointer hover:opacity-95"
              >
                + Add Transaction For This Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#F9F7F2] dark:bg-[#120F0A]/95 dark:backdrop-blur-xl w-full max-w-md rounded-[28px] p-5 border border-[#D6CEC3] dark:border-[rgba(212,175,55,0.25)] shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.20)] pb-3">
              <h3 className="font-serif-bento text-base font-bold text-[#2D2926] dark:text-[#F7EEDB]">Add New Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:text-[#2D2926] dark:hover:text-[#F7EEDB] cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salary Account"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value as AccountType)}
                  className="w-full bg-white dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden cursor-pointer"
                >
                  <option value="bank" className="dark:bg-[#1A160F]">Bank Account</option>
                  <option value="cash" className="dark:bg-[#1A160F]">Cash / Wallet</option>
                  <option value="credit_card" className="dark:bg-[#1A160F]">Credit Card</option>
                  <option value="savings" className="dark:bg-[#1A160F]">Savings Account</option>
                  <option value="investment" className="dark:bg-[#1A160F]">Investment Portfolio</option>
                  <option value="other" className="dark:bg-[#1A160F]">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Initial Opening Balance ({settings.currency_symbol})
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-white dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
                  Card Theme Color
                </label>
                <div className="flex space-x-2 pt-1">
                  {['#5A5A40', '#C28B70', '#2D2926', '#D6CEC3', '#A1A892', '#8C7A6B', '#D4AF37'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAccountColor(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        accountColor === color ? 'border-[#2D2926] dark:border-[#F7DE98] scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-[#2D2926] dark:text-[#F7DE98] bg-[#D6CEC3]/30 dark:bg-[rgba(30,26,18,0.8)] border border-transparent dark:border-[rgba(212,175,55,0.2)] rounded-full cursor-pointer hover:bg-[#D6CEC3]/50 dark:hover:bg-[rgba(45,38,25,0.9)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white dark:text-[#120F0A] bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] rounded-full shadow-xs cursor-pointer hover:opacity-95"
                >
                  Save Account
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
