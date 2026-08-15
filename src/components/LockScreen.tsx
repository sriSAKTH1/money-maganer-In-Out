import React, { useState } from 'react';
import { ShieldCheck, Delete, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { UserSettings } from '../types';

interface LockScreenProps {
  settings: UserSettings;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ settings, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);

  const targetPin = settings.passcode_pin || '1234';

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4) {
        if (nextPin === targetPin) {
          onUnlock();
        } else {
          setErrorMsg('Incorrect PIN code. Try again.');
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#3E5242] dark:bg-[#0C0B08] text-white flex flex-col items-center justify-between p-6 animate-in fade-in duration-200">
      
      {/* Top Branding */}
      <div className="pt-12 text-center space-y-2">
        <div className="w-16 h-16 bg-[#2F4033] dark:bg-[rgba(26,22,15,0.85)] rounded-3xl flex items-center justify-center mx-auto shadow-lg border border-[#4F6654] dark:border-[rgba(212,175,55,0.35)]">
          <ShieldCheck className="w-8 h-8 text-[#A8D0B0] dark:text-[#F7DE98]" />
        </div>
        <h2 className="text-xl font-extrabold tracking-tight font-serif-bento text-white dark:text-[#F7DE98]">Money Manager</h2>
        <p className="text-xs text-[#A8D0B0] dark:text-[rgba(247,238,219,0.7)] font-medium">Enter 4-Digit Passcode to Unlock</p>
      </div>

      {/* PIN Box with Top Right Eye Button */}
      <div className="w-full max-w-xs bg-[#2F4033]/60 dark:bg-[rgba(26,22,15,0.72)] backdrop-blur-md rounded-2xl p-4 border border-[#4F6654]/70 dark:border-[rgba(212,175,55,0.25)] relative shadow-lg">
        {/* Hide / Show Eye Button in Top Right */}
        <button
          type="button"
          onClick={() => setShowPin(!showPin)}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 dark:bg-[rgba(212,175,55,0.15)] hover:bg-white/20 dark:hover:bg-[rgba(212,175,55,0.25)] text-[#A8D0B0] dark:text-[#F7DE98] transition-colors cursor-pointer flex items-center justify-center"
          title={showPin ? "Hide PIN digits" : "Show PIN digits"}
          aria-label={showPin ? "Hide PIN digits" : "Show PIN digits"}
        >
          {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        <div className="space-y-3 text-center pt-1">
          <div className="flex justify-center space-x-3.5">
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = pin.length > idx;
              const digit = pin[idx];

              return (
                <div
                  key={idx}
                  className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all duration-200 ${
                    hasDigit
                      ? 'border-[#A8D0B0] dark:border-[#D4AF37] bg-[#A8D0B0]/20 dark:bg-[rgba(212,175,55,0.2)] text-white dark:text-[#F7DE98] font-mono font-bold text-lg shadow-xs scale-105'
                      : 'border-[#A8D0B0]/40 dark:border-[rgba(212,175,55,0.25)] bg-transparent'
                  }`}
                >
                  {hasDigit && (
                    showPin ? (
                      digit
                    ) : (
                      <span className="w-3 h-3 rounded-full bg-[#A8D0B0] dark:bg-[#D4AF37]" />
                    )
                  )}
                </div>
              );
            })}
          </div>

          {errorMsg && (
            <p className="text-xs text-[#FDE8E8] dark:text-[#F87171] font-bold animate-shake">{errorMsg}</p>
          )}
        </div>
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs space-y-4 pb-8">
        <div className="grid grid-cols-3 gap-4 text-center">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-[#2F4033] dark:bg-[rgba(26,22,15,0.85)] dark:hover:bg-[rgba(45,38,25,0.95)] hover:bg-[#253328] active:scale-95 text-xl font-bold transition-all shadow-sm border border-[#4F6654] dark:border-[rgba(212,175,55,0.25)] text-white dark:text-[#F7EEDB] cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Biometric unlock button */}
          <button
            onClick={onUnlock}
            className="h-14 rounded-2xl bg-[#2F4033] dark:bg-[rgba(26,22,15,0.85)] hover:bg-[#253328] dark:hover:bg-[rgba(45,38,25,0.95)] flex items-center justify-center text-[#A8D0B0] dark:text-[#F7DE98] border border-transparent dark:border-[rgba(212,175,55,0.25)] cursor-pointer"
            title="Biometric Unlock"
          >
            <Fingerprint className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-[#2F4033] dark:bg-[rgba(26,22,15,0.85)] dark:hover:bg-[rgba(45,38,25,0.95)] hover:bg-[#253328] active:scale-95 text-xl font-bold transition-all shadow-sm border border-[#4F6654] dark:border-[rgba(212,175,55,0.25)] text-white dark:text-[#F7EEDB] cursor-pointer"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#2F4033] dark:bg-[rgba(26,22,15,0.85)] hover:bg-[#253328] dark:hover:bg-[rgba(45,38,25,0.95)] flex items-center justify-center text-white/80 dark:text-[rgba(247,238,219,0.8)] border border-transparent dark:border-[rgba(212,175,55,0.25)] cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {settings.biometric_enabled && (
          <button
            onClick={onUnlock}
            className="w-full py-2 text-xs font-semibold text-[#A8D0B0] dark:text-[#F7DE98] hover:underline text-center cursor-pointer"
          >
            Tap to Use Fingerprint / Face ID
          </button>
        )}
      </div>

    </div>
  );
};
