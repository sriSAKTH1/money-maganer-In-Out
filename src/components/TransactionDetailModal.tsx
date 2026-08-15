import React, { useState } from 'react';
import { X, Edit3, Trash2, Calendar, Tag, Wallet, ArrowRightLeft, FileText, Check } from 'lucide-react';
import { Transaction, Account, Category, UserSettings } from '../types';
import { formatCurrency, formatDateString } from '../utils/formatters';
import { updateTransaction, deleteTransaction } from '../data/storage';
import { CategoryIcon } from './CategoryIcon';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  settings: UserSettings;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  categories,
  accounts,
  settings,
}) => {
  if (!transaction) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Edit form state
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [date, setDate] = useState(transaction.date);
  const [categoryId, setCategoryId] = useState(transaction.category_id || '');
  const [accountId, setAccountId] = useState(transaction.account_id || '');
  const [fromAccountId, setFromAccountId] = useState(transaction.from_account_id || '');
  const [toAccountId, setToAccountId] = useState(transaction.to_account_id || '');
  const [note, setNote] = useState(transaction.note || '');
  const [description, setDescription] = useState(transaction.description || '');

  const catObj = categories.find(c => c.id === transaction.category_id);
  const accObj = accounts.find(a => a.id === transaction.account_id);
  const fromAccObj = accounts.find(a => a.id === transaction.from_account_id);
  const toAccObj = accounts.find(a => a.id === transaction.to_account_id);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    updateTransaction(transaction.id, {
      amount: numAmount,
      date,
      category_id: transaction.type !== 'transfer' ? categoryId : null,
      account_id: transaction.type !== 'transfer' ? accountId : null,
      from_account_id: transaction.type === 'transfer' ? fromAccountId : null,
      to_account_id: transaction.type === 'transfer' ? toAccountId : null,
      note: note.trim(),
      description: description.trim(),
    });

    setIsEditing(false);
    onClose();
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    setShowConfirmDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl p-5 border border-[#E3DEC3] shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-[#E8E3D9] pb-3">
          <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
            transaction.type === 'income'
              ? 'bg-[#E5EFE7] text-[#2E6F40]'
              : transaction.type === 'expense'
              ? 'bg-[#FDE8E8] text-[#C85A32]'
              : 'bg-[#E2E8F0] text-[#4A5D6E]'
          }`}>
            {transaction.type}
          </span>

          <div className="flex items-center space-x-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-xl bg-[#EFECE6] text-[#2D2B2A] hover:bg-[#E2DDD5]"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="p-1.5 rounded-xl bg-[#FDE8E8] text-[#C85A32] hover:bg-[#FBD5D5]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={onClose} className="text-[#736E68]">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showConfirmDelete ? (
          <div className="py-4 space-y-4 text-center">
            <h4 className="text-sm font-bold text-[#2D2B2A]">Delete Transaction?</h4>
            <p className="text-xs text-[#736E68]">
              Are you sure you want to delete this transaction? All associated balances and budget metrics will be recalculated.
            </p>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2.5 text-xs font-bold text-[#736E68] bg-[#EFECE6] rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#C85A32] rounded-xl shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        ) : isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSaveEdit} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-[#736E68] uppercase mb-1">
                Amount ({settings.currency_symbol})
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#FFFFFF] text-sm font-bold p-2.5 rounded-xl border border-[#E2DDD5]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#736E68] uppercase mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#FFFFFF] text-xs font-semibold p-2.5 rounded-xl border border-[#E2DDD5]"
              />
            </div>

            {transaction.type !== 'transfer' && (
              <div>
                <label className="block text-[10px] font-bold text-[#736E68] uppercase mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-[#FFFFFF] text-xs font-semibold p-2.5 rounded-xl border border-[#E2DDD5]"
                >
                  {categories.filter(c => c.type === transaction.type).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-[#736E68] uppercase mb-1">
                Note
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-[#FFFFFF] text-xs font-semibold p-2.5 rounded-xl border border-[#E2DDD5]"
              />
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2.5 text-xs font-bold text-[#736E68] bg-[#EFECE6] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-bold text-white bg-[#3E5242] rounded-xl"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          /* Detail Display */
          <div className="space-y-4">
            <div className="text-center py-2 space-y-1">
              <p className="text-3xl font-extrabold text-[#2D2B2A]">
                {formatCurrency(transaction.amount, settings.currency_symbol, settings.hide_balance)}
              </p>
              <p className="text-xs font-bold text-[#736E68]">
                {transaction.note || (catObj ? catObj.name : 'Transaction Details')}
              </p>
            </div>

            <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#E8E3D9] space-y-2.5 text-xs">
              <div className="flex justify-between items-center border-b border-[#F0EBE1] pb-2">
                <span className="text-[#736E68] font-bold flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date</span>
                </span>
                <span className="font-extrabold text-[#2D2B2A]">{formatDateString(transaction.date, 'full')}</span>
              </div>

              {transaction.type !== 'transfer' ? (
                <>
                  <div className="flex justify-between items-center border-b border-[#F0EBE1] pb-2">
                    <span className="text-[#736E68] font-bold flex items-center space-x-1">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Category</span>
                    </span>
                    <span className="font-extrabold text-[#2D2B2A]">{catObj ? catObj.name : 'General'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#736E68] font-bold flex items-center space-x-1">
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Account</span>
                    </span>
                    <span className="font-extrabold text-[#2D2B2A]">{accObj ? accObj.name : 'Primary'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center border-b border-[#F0EBE1] pb-2">
                    <span className="text-[#736E68] font-bold">From Account</span>
                    <span className="font-extrabold text-[#2D2B2A]">{fromAccObj ? fromAccObj.name : ''}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#736E68] font-bold">To Account</span>
                    <span className="font-extrabold text-[#2D2B2A]">{toAccObj ? toAccObj.name : ''}</span>
                  </div>
                </>
              )}
            </div>

            {transaction.description && (
              <div className="bg-[#FFFFFF] p-3 rounded-2xl border border-[#E8E3D9] space-y-1">
                <span className="text-[10px] font-bold text-[#736E68] uppercase">Description</span>
                <p className="text-xs text-[#2D2B2A] font-medium">{transaction.description}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
