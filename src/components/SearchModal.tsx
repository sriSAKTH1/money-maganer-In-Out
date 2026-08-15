import React, { useState } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Transaction, Account, Category, UserSettings, TransactionType } from '../types';
import { formatCurrency, formatDateString } from '../utils/formatters';
import { CategoryIcon } from './CategoryIcon';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  settings: UserSettings;
  onSelectTx: (tx: Transaction) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  transactions,
  categories,
  accounts,
  settings,
  onSelectTx,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const getCatName = (catId?: string | null) => {
    if (!catId) return 'Transfer';
    const c = categories.find(cat => cat.id === catId);
    return c ? c.name : 'General';
  };

  const getAccName = (accId?: string | null) => {
    if (!accId) return '';
    const a = accounts.find(acc => acc.id === accId);
    return a ? a.name : '';
  };

  const getCategoryInfo = (catId?: string | null) => {
    if (!catId) return { name: 'Transfer', icon: 'ArrowRightLeft', color: '#4A5D6E' };
    const cat = categories.find(c => c.id === catId);
    return cat || { name: 'General', icon: 'Folder', color: '#8E8A83' };
  };

  // Filter logic
  const filtered = transactions.filter(tx => {
    // Keyword match
    if (query.trim()) {
      const q = query.toLowerCase();
      const catName = getCatName(tx.category_id).toLowerCase();
      const accName = getAccName(tx.account_id).toLowerCase();
      const fromAcc = getAccName(tx.from_account_id).toLowerCase();
      const toAcc = getAccName(tx.to_account_id).toLowerCase();
      const noteStr = (tx.note || '').toLowerCase();
      const descStr = (tx.description || '').toLowerCase();

      const match = catName.includes(q) ||
                    accName.includes(q) ||
                    fromAcc.includes(q) ||
                    toAcc.includes(q) ||
                    noteStr.includes(q) ||
                    descStr.includes(q);

      if (!match) return false;
    }

    // Type filter
    if (filterType !== 'all' && tx.type !== filterType) {
      return false;
    }

    // Account filter
    if (selectedAccountId !== 'all') {
      if (tx.account_id !== selectedAccountId &&
          tx.from_account_id !== selectedAccountId &&
          tx.to_account_id !== selectedAccountId) {
        return false;
      }
    }

    // Category filter
    if (selectedCategoryId !== 'all') {
      if (tx.category_id !== selectedCategoryId) {
        return false;
      }
    }

    return true;
  });

  const totalSum = filtered.reduce((sum, tx) => {
    if (tx.type === 'income') return sum + tx.amount;
    if (tx.type === 'expense') return sum - tx.amount;
    return sum;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-[#FAF8F5] w-full max-w-md h-[90vh] sm:h-[85vh] rounded-b-3xl sm:rounded-3xl p-4 border border-[#E3DEC3] shadow-2xl flex flex-col space-y-3">
        
        {/* Header Search Bar */}
        <div className="flex items-center space-x-2 bg-[#FFFFFF] p-2.5 rounded-2xl border border-[#E2DDD5] shadow-2xs">
          <Search className="w-5 h-5 text-[#736E68]" />
          <input
            type="text"
            placeholder="Search category, note, account..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-xs font-bold text-[#2D2B2A] bg-transparent focus:outline-hidden"
          />
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`p-1.5 rounded-xl ${showAdvancedFilters ? 'bg-[#3E5242] text-white' : 'bg-[#F0EBE1] text-[#2D2B2A]'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="text-[#736E68] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills */}
        {showAdvancedFilters && (
          <div className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#E2DDD5] space-y-2.5 animate-in fade-in duration-150">
            {/* Type selector */}
            <div className="flex bg-[#EFECE6] p-1 rounded-xl text-[11px] font-bold">
              {(['all', 'income', 'expense', 'transfer'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`flex-1 py-1 capitalize rounded-lg ${
                    filterType === t ? 'bg-[#3E5242] text-white shadow-2xs' : 'text-[#736E68]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Account Selector */}
            <div>
              <label className="block text-[10px] font-bold text-[#736E68] uppercase mb-1">
                Filter Account
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full bg-[#FAF8F5] text-xs font-semibold p-2 rounded-xl border border-[#E2DDD5]"
              >
                <option value="all">-- All Accounts --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Subtotal & Match Count Header */}
        <div className="flex justify-between items-center px-1 text-xs">
          <span className="font-bold text-[#736E68]">
            Found {filtered.length} matching transactions
          </span>
          <span className="font-extrabold text-[#3E5242]">
            Net: {formatCurrency(totalSum, settings.currency_symbol, settings.hide_balance)}
          </span>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#736E68]">
              No transactions matching your search criteria.
            </div>
          ) : (
            filtered.map((tx) => {
              const catInfo = getCategoryInfo(tx.category_id);
              return (
                <div
                  key={tx.id}
                  onClick={() => {
                    onClose();
                    onSelectTx(tx);
                  }}
                  className="p-3 bg-[#FFFFFF] hover:bg-[#F4F0EA] rounded-xl border border-[#E8E3D9] flex justify-between items-center cursor-pointer transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className="p-2 rounded-xl text-white flex items-center justify-center"
                      style={{ backgroundColor: tx.type === 'transfer' ? '#4A5D6E' : catInfo.color }}
                    >
                      <CategoryIcon name={tx.type === 'transfer' ? 'ArrowRightLeft' : catInfo.icon} size={16} />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#2D2B2A]">
                        {tx.type === 'transfer' ? 'Transfer' : catInfo.name}
                      </p>
                      <p className="text-[10px] text-[#736E68]">
                        {formatDateString(tx.date, 'short')} • {tx.note || getAccName(tx.account_id)}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-extrabold ${
                    tx.type === 'income' ? 'text-[#2E6F40]' : tx.type === 'expense' ? 'text-[#C85A32]' : 'text-[#4A5D6E]'
                  }`}>
                    {formatCurrency(tx.amount, settings.currency_symbol, settings.hide_balance)}
                  </span>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
