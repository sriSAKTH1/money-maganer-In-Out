import React, { useState } from 'react';
import { Wallet, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import { saveSettings, addAccount } from '../data/storage';

interface SetupWizardProps {
  onComplete: () => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCurrency, setSelectedCurrency] = useState('₹ INR');
  const [accountName, setAccountName] = useState('Cash Wallet');
  const [initialBalance, setInitialBalance] = useState('5000');

  const handleFinishSetup = () => {
    let symbol = '₹';
    if (selectedCurrency.includes('$')) symbol = '$';
    else if (selectedCurrency.includes('€')) symbol = '€';
    else if (selectedCurrency.includes('£')) symbol = '£';
    else if (selectedCurrency.includes('¥')) symbol = '¥';

    saveSettings({
      currency: selectedCurrency,
      currency_symbol: symbol,
      is_setup_completed: true,
    });

    if (accountName.trim()) {
      addAccount({
        name: accountName.trim(),
        type: 'cash',
        initial_balance: parseFloat(initialBalance) || 0,
        currency: selectedCurrency,
        icon: 'Banknote',
        color: '#D4A373',
        is_active: true,
      });
    }

    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F7F4EE] text-[#2D2B2A] flex flex-col items-center justify-between p-6">
      
      {/* Top Header */}
      <div className="pt-8 text-center space-y-2 max-w-xs">
        <div className="w-16 h-16 bg-[#3E5242] text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">Money Manager</h2>
        <p className="text-xs text-[#736E68]">Offline-first personal finance tracker</p>
      </div>

      {/* Step Content */}
      <div className="w-full max-w-xs bg-[#FFFFFF] p-6 rounded-3xl border border-[#E5E0D8] shadow-md space-y-4">
        {step === 1 && (
          <div className="space-y-4 text-center">
            <h3 className="text-base font-extrabold text-[#2D2B2A]">Welcome to Money Manager</h3>
            <p className="text-xs text-[#736E68] leading-relaxed">
              Track income, expenses, budgets, and accounts seamlessly. Your financial data stays 100% private and stored on your local device.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-[#3E5242] hover:bg-[#2F4033] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-[#2D2B2A] text-center">Select Preferred Currency</h3>
            
            <div className="space-y-2">
              {[
                { name: '₹ INR', label: 'Indian Rupee (₹)' },
                { name: '$ USD', label: 'US Dollar ($)' },
                { name: '€ EUR', label: 'Euro (€)' },
                { name: '£ GBP', label: 'British Pound (£)' },
                { name: '¥ JPY', label: 'Japanese Yen (¥)' },
              ].map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedCurrency(c.name)}
                  className={`w-full p-3 rounded-2xl border text-xs font-bold flex justify-between items-center transition-all ${
                    selectedCurrency === c.name
                      ? 'bg-[#E5EFE7] border-[#A8D0B0] text-[#2E6F40]'
                      : 'bg-[#FAF8F5] border-[#E8E3D9] text-[#2D2B2A]'
                  }`}
                >
                  <span>{c.label}</span>
                  {selectedCurrency === c.name && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3 bg-[#3E5242] hover:bg-[#2F4033] text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-[#2D2B2A] text-center">Create First Account</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#736E68] uppercase mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full bg-[#FAF8F5] text-xs font-bold p-2.5 rounded-xl border border-[#E2DDD5]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#736E68] uppercase mb-1">
                  Opening Balance ({selectedCurrency.split(' ')[0]})
                </label>
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  className="w-full bg-[#FAF8F5] text-xs font-bold p-2.5 rounded-xl border border-[#E2DDD5]"
                />
              </div>
            </div>

            <button
              onClick={handleFinishSetup}
              className="w-full py-3 bg-[#3E5242] hover:bg-[#2F4033] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Go to Overview</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="pb-4 text-center">
        <p className="text-[10px] text-[#736E68] font-semibold">Step {step} of 3</p>
      </div>

    </div>
  );
};
