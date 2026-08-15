import React, { useState, useEffect } from 'react';
import { Search, Eye, EyeOff } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  settings: UserSettings;
  onOpenSearch: () => void;
  onOpenAddTransaction?: () => void;
  onLockApp?: () => void;
  onToggleHideBalance?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  settings,
  onOpenSearch,
  onToggleHideBalance,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Reset header visibility when switching sections/tabs
  useEffect(() => {
    setIsVisible(true);
  }, [title]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always keep header visible near the very top of the page
          if (currentScrollY <= 40) {
            setIsVisible(true);
          } else {
            const diff = currentScrollY - lastScrollY;
            // Apply a minimum scroll delta threshold to ignore minor tremors / iOS rubber-banding
            if (Math.abs(diff) > 6) {
              if (diff > 0 && currentScrollY > 60) {
                // Scrolling down -> hide header
                setIsVisible(false);
              } else if (diff < 0) {
                // Scrolling up -> show header
                setIsVisible(true);
              }
            }
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      id="main-app-header"
      className={`sticky top-0 z-20 bg-[#FAF8F5]/65 dark:bg-[#120F0A]/70 backdrop-blur-xl px-4 py-3.5 border-b border-[#E5DFD5]/60 dark:border-[rgba(212,175,55,0.20)] flex items-center justify-between transition-all duration-300 ease-in-out transform shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.6)] ${
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-serif-bento font-bold text-2xl text-[#5A5A40] dark:text-[#F7DE98] italic tracking-tight">{title}</span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#5A5A40]/10 dark:bg-[rgba(212,175,55,0.15)] text-[#5A5A40] dark:text-[#F7DE98] border border-[#5A5A40]/20 dark:border-[rgba(212,175,55,0.35)] backdrop-blur-sm">Beta</span>
        </div>
        {subtitle && (
          <p className="text-[11px] text-[#2D2926]/75 dark:text-[rgba(247,238,219,0.65)] font-medium mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {onToggleHideBalance && (
          <button
            id="toggle-hide-balance-btn"
            onClick={onToggleHideBalance}
            className={`p-2.5 rounded-full transition-all cursor-pointer backdrop-blur-md ${
              settings.hide_balance
                ? 'bg-[#C28B70]/20 text-[#C28B70] border border-[#C28B70]/40 shadow-xs'
                : 'bg-white/50 dark:bg-[rgba(26,22,15,0.7)] text-[#5A5A40] dark:text-[#F7DE98] border border-[#DCD5C9]/80 dark:border-[rgba(212,175,55,0.25)] hover:bg-white/80 dark:hover:bg-[rgba(45,38,25,0.85)] shadow-xs active:scale-95'
            }`}
            title={settings.hide_balance ? 'Unhide Numbers / Balances' : 'Hide Numbers (Show as xxx)'}
          >
            {settings.hide_balance ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        <button
          id="search-transactions-btn"
          onClick={onOpenSearch}
          className="p-2.5 rounded-full text-[#2D2926] dark:text-[#F7DE98] bg-white/50 dark:bg-[rgba(26,22,15,0.7)] border border-[#DCD5C9]/80 dark:border-[rgba(212,175,55,0.25)] hover:bg-white/80 dark:hover:bg-[rgba(45,38,25,0.85)] backdrop-blur-md transition-all cursor-pointer shadow-xs active:scale-95"
          title="Search Transactions"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

