import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Check, Crown, Shield, Infinity, 
  Wallet, BarChart3, Cloud, Lock, 
  Heart, Bell, CheckCircle2,
  Gift, ThumbsUp, Send
} from 'lucide-react';
import { UserSettings } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface ProComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onPlanActivated?: (plan: 'monthly' | 'yearly' | 'lifetime') => void;
}

export const ProComingSoonModal: React.FC<ProComingSoonModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [hasShownInterest, setHasShownInterest] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'unlimited_budgets',
    'unlimited_accounts'
  ]);
  const [interestCount, setInterestCount] = useState(1428);
  const [justVoted, setJustVoted] = useState(false);

  useEffect(() => {
    // Check if user already registered interest in local storage
    const savedInterest = localStorage.getItem('mm_pro_interest_registered');
    if (savedInterest === 'true') {
      setHasShownInterest(true);
    }
  }, []);

  if (!isOpen) return null;

  const toggleFeatureVote = (featureId: string) => {
    triggerHaptic('light');
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  const handleRegisterInterest = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerHaptic('success');
    setHasShownInterest(true);
    setJustVoted(true);
    setInterestCount(prev => prev + 1);
    localStorage.setItem('mm_pro_interest_registered', 'true');
    if (emailInput.trim()) {
      localStorage.setItem('mm_pro_interest_email', emailInput.trim());
    }
  };

  return (
    <div 
      id="pro-coming-soon-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        className="bg-[#F9F7F2] dark:bg-[#120F0A]/95 dark:backdrop-blur-xl w-full max-w-md rounded-[32px] border border-[#D6CEC3] dark:border-[rgba(212,175,55,0.25)] shadow-2xl overflow-hidden text-[#2D2926] dark:text-[#F7EEDB] my-auto relative max-h-[92vh] flex flex-col"
      >
        {/* Top Header Banner with Ambient Warm Gradient */}
        <div className="relative p-6 bg-gradient-to-br from-[#5A5A40] via-[#4A4A34] to-[#2D2926] dark:from-[#2A2214] dark:via-[#1A160F] dark:to-[#0C0B08] text-white shrink-0 overflow-hidden border-b dark:border-[rgba(212,175,55,0.2)]">
          {/* Ambient decorative glow circles */}
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#C28B70]/20 dark:bg-[rgba(212,175,55,0.15)] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-[#A1A892]/20 dark:bg-[rgba(212,175,55,0.1)] rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            id="close-pro-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/15 dark:bg-[rgba(212,175,55,0.15)] hover:bg-white/25 dark:hover:bg-[rgba(212,175,55,0.25)] active:scale-95 text-white dark:text-[#F7DE98] backdrop-blur-sm transition-all cursor-pointer z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header Title & Badges */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-[#C28B70] text-white shadow-xs">
                <Crown className="w-3 h-3 mr-1" /> Coming Soon
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 dark:bg-[rgba(212,175,55,0.2)] text-white dark:text-[#F7DE98] backdrop-blur-xs">
                <Sparkles className="w-3 h-3 text-[#F2CC8F] dark:text-[#F7DE98]" /> Low Cost Pass
              </span>
            </div>

            <h2 className="font-serif-bento text-2xl sm:text-3xl font-bold tracking-tight text-white dark:text-[#F7DE98] leading-tight">
              Money Manager Pro
            </h2>

            <p className="text-xs text-white/85 dark:text-[rgba(247,238,219,0.8)] font-medium leading-relaxed max-w-xs">
              We are crafting the ultimate low-cost Pro edition with unlimited tracking & smart features. Show your interest to shape the release!
            </p>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5 no-scrollbar flex-1">
          
          {/* Interest Counter Callout Card */}
          <div className="p-3.5 bg-white dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.2)] flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#C28B70]/15 dark:bg-[rgba(212,175,55,0.15)] text-[#C28B70] dark:text-[#F7DE98] flex items-center justify-center">
                <Heart className={`w-5 h-5 transition-transform ${hasShownInterest ? 'fill-[#C28B70] dark:fill-[#D4AF37] scale-110' : ''}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB] flex items-center space-x-1.5">
                  <span>{interestCount.toLocaleString()} Users Interested</span>
                </p>
                <p className="text-[10px] text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)]">
                  {hasShownInterest ? "Thank you! You're on the early launch list." : "Vote for features you want most!"}
                </p>
              </div>
            </div>
            {hasShownInterest && (
              <span className="px-2.5 py-1 bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] text-white dark:text-[#120F0A] text-[10px] font-bold rounded-full flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Joined</span>
              </span>
            )}
          </div>

          {/* Key Pro Capabilities Grid (Unlimited Budgets & Accounts highlighted) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-serif-bento text-xs font-bold uppercase tracking-wider text-[#5A5A40] dark:text-[#F7DE98]">
                Upcoming Pro Features
              </h3>
              <span className="text-[10px] text-[#C28B70] dark:text-[#F87171] font-semibold">
                Tap to vote your favorites
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Feature 1: Unlimited Budgets */}
              <div 
                onClick={() => toggleFeatureVote('unlimited_budgets')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 relative ${
                  selectedFeatures.includes('unlimited_budgets')
                    ? 'bg-white dark:bg-[rgba(35,29,20,0.85)] border-[#5A5A40] dark:border-[rgba(212,175,55,0.5)] shadow-xs'
                    : 'bg-white/60 dark:bg-[rgba(26,22,15,0.72)] border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.15)] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#5A5A40] dark:text-[#F7DE98]">
                    <div className="p-1.5 rounded-xl bg-[#5A5A40]/10 dark:bg-[rgba(212,175,55,0.2)]">
                      <Infinity className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold">Unlimited Budgets</h4>
                  </div>
                  {selectedFeatures.includes('unlimited_budgets') && (
                    <span className="p-0.5 rounded-full bg-[#5A5A40] dark:bg-[#D4AF37] text-white dark:text-[#120F0A]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] leading-normal">
                  Create limitless category budgets, multi-tier threshold alerts, and auto-rollover leftover funds.
                </p>
              </div>

              {/* Feature 2: Unlimited Accounts */}
              <div 
                onClick={() => toggleFeatureVote('unlimited_accounts')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 relative ${
                  selectedFeatures.includes('unlimited_accounts')
                    ? 'bg-white dark:bg-[rgba(35,29,20,0.85)] border-[#C28B70] dark:border-[rgba(212,175,55,0.5)] shadow-xs'
                    : 'bg-white/60 dark:bg-[rgba(26,22,15,0.72)] border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.15)] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#C28B70] dark:text-[#F7DE98]">
                    <div className="p-1.5 rounded-xl bg-[#C28B70]/10 dark:bg-[rgba(212,175,55,0.2)]">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold">Unlimited Accounts</h4>
                  </div>
                  {selectedFeatures.includes('unlimited_accounts') && (
                    <span className="p-0.5 rounded-full bg-[#C28B70] dark:bg-[#D4AF37] text-white dark:text-[#120F0A]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] leading-normal">
                  Track unlimited bank accounts, cards, crypto vaults, digital wallets, and cash reserves.
                </p>
              </div>

              {/* Feature 3: Smart AI Analytics & Trends */}
              <div 
                onClick={() => toggleFeatureVote('ai_analytics')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 relative ${
                  selectedFeatures.includes('ai_analytics')
                    ? 'bg-white dark:bg-[rgba(35,29,20,0.85)] border-[#5A5A40] dark:border-[rgba(212,175,55,0.5)] shadow-xs'
                    : 'bg-white/60 dark:bg-[rgba(26,22,15,0.72)] border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.15)] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#5A5A40] dark:text-[#F7DE98]">
                    <div className="p-1.5 rounded-xl bg-[#5A5A40]/10 dark:bg-[rgba(212,175,55,0.2)]">
                      <BarChart3 className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold">Advanced Analytics</h4>
                  </div>
                  {selectedFeatures.includes('ai_analytics') && (
                    <span className="p-0.5 rounded-full bg-[#5A5A40] dark:bg-[#D4AF37] text-white dark:text-[#120F0A]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] leading-normal">
                  Monthly spending predictions, anomaly alerts, and net worth forecasting charts.
                </p>
              </div>

              {/* Feature 4: Cloud Sync & Statements */}
              <div 
                onClick={() => toggleFeatureVote('cloud_sync')}
                className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 relative ${
                  selectedFeatures.includes('cloud_sync')
                    ? 'bg-white dark:bg-[rgba(35,29,20,0.85)] border-[#A1A892] dark:border-[rgba(212,175,55,0.5)] shadow-xs'
                    : 'bg-white/60 dark:bg-[rgba(26,22,15,0.72)] border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.15)] opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-[#A1A892] dark:text-[#F7DE98]">
                    <div className="p-1.5 rounded-xl bg-[#A1A892]/20 dark:bg-[rgba(212,175,55,0.2)]">
                      <Cloud className="w-3.5 h-3.5" />
                    </div>
                    <h4 className="text-xs font-bold">Cloud Sync & Export</h4>
                  </div>
                  {selectedFeatures.includes('cloud_sync') && (
                    <span className="p-0.5 rounded-full bg-[#A1A892] dark:bg-[#D4AF37] text-white dark:text-[#120F0A]">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)] leading-normal">
                  Encrypted automatic cloud backup, plus high-res PDF and CSV tax statements.
                </p>
              </div>

            </div>
          </div>

          {/* Show Your Interest Component (VIP Early Bird) */}
          <div 
            id="show-interest-component"
            className="p-4 bg-gradient-to-br from-[#5A5A40]/10 via-[#C28B70]/10 to-white dark:from-[rgba(40,32,18,0.6)] dark:via-[rgba(26,22,15,0.8)] dark:to-[rgba(18,15,10,0.9)] rounded-2xl border border-[#5A5A40]/25 dark:border-[rgba(212,175,55,0.25)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-[#C28B70] dark:bg-[rgba(212,175,55,0.25)] text-white dark:text-[#F7DE98] shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB]">
                    Show Your Interest for Pro
                  </h4>
                  <p className="text-[10px] text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.65)]">
                    Get an early VIP launch discount code when Pro goes live!
                  </p>
                </div>
              </div>
            </div>

            {hasShownInterest ? (
              <div className="p-3 bg-[#5A5A40] dark:bg-[rgba(212,175,55,0.25)] text-white dark:text-[#F7DE98] rounded-xl text-xs font-bold flex items-center space-x-2.5 animate-in fade-in border border-transparent dark:border-[rgba(212,175,55,0.4)]">
                <CheckCircle2 className="w-5 h-5 text-[#F2CC8F] dark:text-[#F7DE98] shrink-0" />
                <div>
                  <p className="font-bold">Interest Registered Successfully!</p>
                  <p className="text-[10px] font-normal text-white/80 dark:text-[rgba(247,238,219,0.8)]">We've noted your feature preferences and VIP launch priority.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterInterest} className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter email to get notified (optional)"
                    className="flex-1 bg-white dark:bg-[rgba(26,22,15,0.85)] text-xs px-3 py-2.5 rounded-xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-none text-[#2D2926] dark:text-[#F7EEDB] placeholder-[#2D2926]/40 dark:placeholder-[rgba(247,238,219,0.4)]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] hover:bg-[#484833] text-white dark:text-[#120F0A] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer shrink-0 flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Join</span>
                  </button>
                </div>
                <p className="text-[10px] text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] pl-1">
                  🔒 Zero spam. We only send a single notification when Pro launches.
                </p>
              </form>
            )}
          </div>

          {/* Free vs Pro Comparison Matrix */}
          <div className="p-4 bg-white dark:bg-[rgba(26,22,15,0.72)] rounded-2xl border border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.2)] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.2)] pb-2">
              <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#F7EEDB] tracking-wide">
                Free vs. Pro Comparison
              </h4>
              <div className="grid grid-cols-2 w-44 text-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)]">Free Plan</span>
                <span className="text-[#5A5A40] dark:text-[#F7DE98] flex items-center justify-center space-x-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#C28B70] dark:text-[#F7DE98]" />
                  <span>Pro Plan</span>
                </span>
              </div>
            </div>

            <div className="space-y-2 text-[11px]">
              {/* Feature 1: Monthly Budgets */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#D6CEC3]/20 dark:border-[rgba(212,175,55,0.1)]">
                <span className="font-medium text-[#2D2926]/80 dark:text-[rgba(247,238,219,0.8)]">Monthly Budgets</span>
                <div className="grid grid-cols-2 w-44 text-center items-center font-semibold">
                  <span className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] text-[11px]">3 Budgets</span>
                  <span className="text-[#5A5A40] dark:text-[#120F0A] font-bold text-[11px] bg-[#5A5A40]/10 dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] py-0.5 px-2 rounded-full mx-auto">Unlimited</span>
                </div>
              </div>

              {/* Feature 2: Financial Accounts */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#D6CEC3]/20 dark:border-[rgba(212,175,55,0.1)]">
                <span className="font-medium text-[#2D2926]/80 dark:text-[rgba(247,238,219,0.8)]">Financial Accounts</span>
                <div className="grid grid-cols-2 w-44 text-center items-center font-semibold">
                  <span className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] text-[11px]">4 Accounts</span>
                  <span className="text-[#C28B70] dark:text-[#120F0A] font-bold text-[11px] bg-[#C28B70]/10 dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] py-0.5 px-2 rounded-full mx-auto">Unlimited</span>
                </div>
              </div>

              {/* Feature 3: Custom Categories */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#D6CEC3]/20 dark:border-[rgba(212,175,55,0.1)]">
                <span className="font-medium text-[#2D2926]/80 dark:text-[rgba(247,238,219,0.8)]">Custom Categories</span>
                <div className="grid grid-cols-2 w-44 text-center items-center font-semibold">
                  <span className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] text-[11px]">Standard</span>
                  <span className="text-[#5A5A40] dark:text-[#F7DE98] font-bold text-[11px]">Unlimited + Icons</span>
                </div>
              </div>

              {/* Feature 4: Data Storage */}
              <div className="flex items-center justify-between py-1.5 border-b border-[#D6CEC3]/20 dark:border-[rgba(212,175,55,0.1)]">
                <span className="font-medium text-[#2D2926]/80 dark:text-[rgba(247,238,219,0.8)]">Data Storage</span>
                <div className="grid grid-cols-2 w-44 text-center items-center font-semibold">
                  <span className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] text-[11px]">Local Device</span>
                  <span className="text-[#5A5A40] dark:text-[#F7DE98] font-bold text-[11px] bg-[#A1A892]/20 dark:bg-[rgba(212,175,55,0.2)] py-0.5 px-2 rounded-full mx-auto">Cloud Sync</span>
                </div>
              </div>

              {/* Feature 5: Encrypted Backup */}
              <div className="flex items-center justify-between py-1.5">
                <span className="font-medium text-[#2D2926]/80 dark:text-[rgba(247,238,219,0.8)]">Encrypted Backup</span>
                <div className="grid grid-cols-2 w-44 text-center items-center font-semibold">
                  <span className="text-[#2D2926]/60 dark:text-[rgba(247,238,219,0.6)] text-[11px]">Manual JSON</span>
                  <span className="text-[#5A5A40] dark:text-[#F7DE98] font-bold text-[11px]">Auto Cloud + PDF</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Floating Actions */}
        <div className="p-4 bg-white dark:bg-[rgba(26,22,15,0.9)] border-t border-[#D6CEC3]/50 dark:border-[rgba(212,175,55,0.2)] shrink-0 space-y-2">
          
          <div className="flex space-x-2">
            {/* Show Interest Button */}
            <button
              id="activate-pro-preview-btn"
              type="button"
              onClick={() => handleRegisterInterest()}
              className={`flex-1 py-3 px-4 rounded-full text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer ${
                hasShownInterest 
                  ? 'bg-[#5A5A40] dark:bg-gradient-to-r dark:from-[#D4AF37] dark:to-[#F7DE98] text-white dark:text-[#120F0A]'
                  : 'bg-[#C28B70] dark:bg-gradient-to-r dark:from-[#C28B70] dark:to-[#F87171] text-white'
              }`}
            >
              {hasShownInterest ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#F2CC8F] dark:text-[#120F0A]" />
                  <span>Interest Registered • Thank You!</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Show Your Interest (Notify Me)</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-full text-xs font-bold bg-[#D6CEC3]/40 dark:bg-[rgba(30,26,18,0.8)] border border-transparent dark:border-[rgba(212,175,55,0.2)] text-[#2D2926] dark:text-[#F7DE98] hover:bg-[#D6CEC3] cursor-pointer"
            >
              Close
            </button>
          </div>

          <p className="text-center text-[10px] opacity-60 dark:text-[rgba(247,238,219,0.6)]">
            Low-cost pricing guarantee • No hidden charges • 100% offline-first safe
          </p>
        </div>

      </div>
    </div>
  );
};

