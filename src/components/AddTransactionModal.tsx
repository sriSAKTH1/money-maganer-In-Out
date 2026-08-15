import React, { useState } from 'react';
import { X, Check, ArrowRightLeft, Plus, Calendar, Tag, Wallet, FileText, CheckCircle2 } from 'lucide-react';
import { TransactionType, Category, Account, UserSettings } from '../types';
import { addTransaction } from '../data/storage';
import { getTodayISOString, formatCurrency } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { CategoryIcon } from './CategoryIcon';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  settings: UserSettings;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  accounts,
  settings,
}) => {
  if (!isOpen) return null;

  const activeAccounts = accounts.filter(a => a.is_active);
  const activeCategories = categories.filter(c => c.is_active);

  const [txType, setTxType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayISOString());
  const [categoryId, setCategoryId] = useState<string>(
    activeCategories.find(c => c.type === 'expense')?.id || ''
  );
  const [accountId, setAccountId] = useState<string>(
    activeAccounts[0]?.id || ''
  );
  const [fromAccountId, setFromAccountId] = useState<string>(
    activeAccounts[0]?.id || ''
  );
  const [toAccountId, setToAccountId] = useState<string>(
    activeAccounts[1]?.id || activeAccounts[0]?.id || ''
  );
  const [note, setNote] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');

  // Haptic & Shake Animation States
  const [isSavingDone, setIsSavingDone] = useState(false);
  const [isSavingContinue, setIsSavingContinue] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  // Handle type change
  const handleTypeChange = (type: TransactionType) => {
    triggerHaptic('light');
    setTxType(type);
    setErrorMessage('');
    if (type !== 'transfer') {
      const matchCat = activeCategories.find(c => c.type === type);
      if (matchCat) setCategoryId(matchCat.id);
    }
  };

  const validate = (): boolean => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage('Please enter an amount greater than 0.');
      triggerHaptic('warning');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 450);
      return false;
    }

    if (!date) {
      setErrorMessage('Please select a valid date.');
      triggerHaptic('warning');
      setShakeError(true);
      setTimeout(() => setShakeError(false), 450);
      return false;
    }

    if (txType !== 'transfer') {
      if (!categoryId) {
        setErrorMessage('Please select a category.');
        triggerHaptic('warning');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 450);
        return false;
      }
      if (!accountId) {
        setErrorMessage('Please select an account.');
        triggerHaptic('warning');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 450);
        return false;
      }
    } else {
      if (!fromAccountId || !toAccountId) {
        setErrorMessage('Please select source and destination accounts.');
        triggerHaptic('warning');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 450);
        return false;
      }
      if (fromAccountId === toAccountId) {
        setErrorMessage('From and To accounts cannot be the same.');
        triggerHaptic('warning');
        setShakeError(true);
        setTimeout(() => setShakeError(false), 450);
        return false;
      }
    }

    setErrorMessage('');
    return true;
  };

  const saveTx = (): boolean => {
    if (!validate()) return false;

    const numAmount = parseFloat(amount);

    if (txType === 'income' || txType === 'expense') {
      addTransaction({
        type: txType,
        amount: numAmount,
        date,
        category_id: categoryId,
        account_id: accountId,
        note: note.trim(),
        description: description.trim(),
      });
    } else {
      addTransaction({
        type: 'transfer',
        amount: numAmount,
        date,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        note: note.trim(),
        description: description.trim(),
      });
    }

    return true;
  };

  const handleSaveAndContinue = () => {
    if (saveTx()) {
      // Trigger confirmation haptic & shake animation
      triggerHaptic('save');
      setIsSavingContinue(true);

      const catObj = categories.find(c => c.id === categoryId);
      const typeLabel = txType.toUpperCase();
      
      setSuccessToast(
        `✓ ${typeLabel} SAVED: ${formatCurrency(parseFloat(amount), settings.currency_symbol)} ${catObj ? `(${catObj.name})` : ''}`
      );

      // Reset numeric and note fields after brief confirmation
      setTimeout(() => {
        setAmount('');
        setNote('');
        setDescription('');
        setIsSavingContinue(false);
      }, 350);

      setTimeout(() => {
        setSuccessToast('');
      }, 2500);
    }
  };

  const handleDone = () => {
    if (amount.trim().length > 0 && parseFloat(amount) > 0) {
      if (saveTx()) {
        // Trigger haptic feedback & shake animation to confirm data saving
        triggerHaptic('save');
        setIsSavingDone(true);

        setTimeout(() => {
          setIsSavingDone(false);
          onClose();
        }, 380);
      }
    } else {
      triggerHaptic('light');
      onClose();
    }
  };

  const availableCategories = activeCategories.filter(c => c.type === txType);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F9F7F2] dark:bg-[#120F0A]/95 dark:backdrop-blur-xl w-full max-w-md h-[92vh] sm:h-auto max-h-[92vh] rounded-t-[28px] sm:rounded-[28px] flex flex-col shadow-2xl border border-[#D6CEC3] dark:border-[rgba(212,175,55,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 bg-white dark:bg-[#1A160F]/90 border-b border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.20)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-full bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] text-[#5A5A40] dark:text-[#F7DE98]">
              <Plus className="w-5 h-5" />
            </span>
            <h2 className="font-serif-bento text-lg font-bold text-[#2D2926] dark:text-[#F7EEDB]">Add Transaction</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:bg-[#D6CEC3]/30 dark:hover:bg-[rgba(212,175,55,0.15)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        <div className="px-5 pt-4 bg-[#F9F7F2] dark:bg-[#120F0A]/90">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#D6CEC3]/30 dark:bg-[rgba(26,22,15,0.8)] rounded-full border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)]">
            <button
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                txType === 'income'
                  ? 'bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] text-white dark:text-[#120F0A] shadow-2xs'
                  : 'text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:text-[#2D2926] dark:hover:text-[#F7EEDB]'
              }`}
            >
              Income
            </button>

            <button
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                txType === 'expense'
                  ? 'bg-[#C28B70] dark:bg-gradient-to-r dark:from-[#C28B70] dark:to-[#F87171] text-white shadow-2xs'
                  : 'text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:text-[#2D2926] dark:hover:text-[#F7EEDB]'
              }`}
            >
              Expense
            </button>

            <button
              onClick={() => handleTypeChange('transfer')}
              className={`py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                txType === 'transfer'
                  ? 'bg-[#2D2926] dark:bg-[rgba(212,175,55,0.25)] text-white dark:text-[#F7DE98] dark:border dark:border-[rgba(212,175,55,0.4)] shadow-2xs'
                  : 'text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] hover:text-[#2D2926] dark:hover:text-[#F7EEDB]'
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-[#C28B70]/10 dark:bg-[rgba(248,113,113,0.15)] border border-[#C28B70]/30 dark:border-[rgba(248,113,113,0.3)] text-[#C28B70] dark:text-[#F87171] text-xs font-semibold rounded-2xl animate-shake">
              {errorMessage}
            </div>
          )}

          {/* Success Toast */}
          {successToast && (
            <div className="p-3 bg-[#5A5A40]/10 dark:bg-[rgba(212,175,55,0.15)] border border-[#5A5A40]/30 dark:border-[rgba(212,175,55,0.3)] text-[#5A5A40] dark:text-[#F7DE98] text-xs font-bold rounded-2xl flex items-center space-x-2 animate-in slide-in-from-top-2">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Amount Field */}
          <div className="bento-card p-4">
            <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider mb-1">
              Amount
            </label>
            <div className="flex items-center space-x-2">
              <span className="font-serif-bento text-2xl font-bold text-[#2D2926] dark:text-[#F7DE98]">
                {settings.currency_symbol}
              </span>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMessage('');
                }}
                autoFocus
                className="w-full font-serif-bento text-3xl font-bold text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/30 dark:placeholder-[rgba(247,238,219,0.3)] focus:outline-hidden bg-transparent"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="bento-card p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="p-2 bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] rounded-2xl text-[#5A5A40] dark:text-[#F7DE98]">
                <Calendar className="w-4 h-4" />
              </span>
              <div>
                <p className="text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider">Date</p>
                <p className="text-xs font-semibold text-[#2D2926] dark:text-[#F7EEDB]">{date}</p>
              </div>
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] text-xs font-medium px-3 py-1.5 rounded-full border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
            />
          </div>

          {/* Category Picker (For Income & Expense) */}
          {txType !== 'transfer' && (
            <div className="bento-card p-3.5 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] rounded-full text-[#5A5A40] dark:text-[#F7DE98]">
                  <Tag className="w-4 h-4" />
                </span>
                <p className="text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider">Category</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 max-h-44 overflow-y-auto pr-1">
                {availableCategories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setCategoryId(cat.id);
                      }}
                      className={`p-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#5A5A40] dark:bg-[rgba(212,175,55,0.25)] dark:border dark:border-[rgba(212,175,55,0.5)] text-white dark:text-[#F7DE98] shadow-xs scale-102 ring-2 ring-[#5A5A40]/40 dark:ring-[rgba(212,175,55,0.4)]'
                          : 'bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.72)] hover:bg-[#D6CEC3]/30 dark:hover:bg-[rgba(45,38,25,0.85)] text-[#2D2926] dark:text-[#F7EEDB] border border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.18)]'
                      }`}
                    >
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-transform shadow-2xs"
                        style={{
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : `${cat.color}22`,
                          borderColor: isSelected ? 'transparent' : `${cat.color}44`,
                          borderWidth: '1px',
                        }}
                      >
                        <CategoryIcon
                          name={cat.icon}
                          size={16}
                          color={isSelected ? '#FFFFFF' : cat.color}
                        />
                      </span>
                      <span className="text-[11px] font-semibold truncate w-full">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Account Picker (For Income & Expense) */}
          {txType !== 'transfer' && (
            <div className="bento-card p-3.5 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] rounded-full text-[#5A5A40] dark:text-[#F7DE98]">
                  <Wallet className="w-4 h-4" />
                </span>
                <p className="text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider">Account</p>
              </div>

              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden cursor-pointer"
              >
                {activeAccounts.map((acc) => (
                  <option key={acc.id} value={acc.id} className="dark:bg-[#1A160F] dark:text-[#F7EEDB]">
                    {acc.name} ({acc.type.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Transfer Account Pickers */}
          {txType === 'transfer' && (
            <div className="bento-card p-3.5 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] rounded-full text-[#5A5A40] dark:text-[#F7DE98]">
                  <ArrowRightLeft className="w-4 h-4" />
                </span>
                <p className="text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider">Transfer Between Accounts</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] mb-1">From Account</label>
                  <select
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] text-xs font-semibold p-2.5 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden cursor-pointer"
                  >
                    {activeAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="dark:bg-[#1A160F] dark:text-[#F7EEDB]">
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] mb-1">To Account</label>
                  <select
                    value={toAccountId}
                    onChange={(e) => setToAccountId(e.target.value)}
                    className="w-full bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] text-xs font-semibold p-2.5 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden cursor-pointer"
                  >
                    {activeAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id} className="dark:bg-[#1A160F] dark:text-[#F7EEDB]">
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Note & Description */}
          <div className="bento-card p-3.5 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-[#D6CEC3]/30 dark:bg-[rgba(212,175,55,0.15)] rounded-full text-[#5A5A40] dark:text-[#F7DE98]">
                <FileText className="w-4 h-4" />
              </span>
              <p className="text-[10px] font-bold text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] uppercase tracking-wider">Note & Details</p>
            </div>

            <input
              type="text"
              placeholder="Note (e.g. Lunch with friends)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-medium p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
            />

            <textarea
              placeholder="Description / Remarks (Optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-[#F9F7F2] dark:bg-[rgba(26,22,15,0.8)] text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)] text-xs font-medium p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden resize-none"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className={`p-4 bg-white dark:bg-[#1A160F]/90 border-t border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.20)] grid grid-cols-2 gap-3 ${shakeError ? 'animate-error-shake' : ''}`}>
          <button
            type="button"
            onClick={handleSaveAndContinue}
            className={`w-full py-3 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer ${
              isSavingContinue
                ? 'bg-[#5A5A40] dark:bg-[#D4AF37] text-white dark:text-[#120F0A] animate-save-shake scale-105 shadow-md'
                : 'bg-[#D6CEC3]/30 dark:bg-[rgba(30,26,18,0.8)] hover:bg-[#D6CEC3]/50 dark:hover:bg-[rgba(45,38,25,0.9)] text-[#2D2926] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.25)] active:scale-95'
            }`}
          >
            {isSavingContinue ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#A1A892] dark:text-[#120F0A] animate-success-pop" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save & Continue</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleDone}
            className={`w-full py-3 px-3 rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs ${
              isSavingDone
                ? 'bg-[#484833] dark:bg-[#F7DE98] text-white dark:text-[#120F0A] animate-save-shake scale-105 shadow-lg ring-2 ring-[#5A5A40]/50 dark:ring-[#D4AF37]'
                : 'bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] hover:opacity-90 active:scale-95 text-white dark:text-[#120F0A] dark:font-extrabold'
            }`}
          >
            {isSavingDone ? (
              <>
                <Check className="w-4 h-4 animate-success-pop stroke-[3]" />
                <span>Saved ✓</span>
              </>
            ) : (
              <span>Done</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
