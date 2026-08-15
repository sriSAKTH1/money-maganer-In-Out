import React from 'react';
import { LayoutDashboard, PieChart, Wallet, CreditCard, MoreHorizontal } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export type NavTab = 'overview' | 'stats' | 'budget' | 'account' | 'more';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'stats' as NavTab, label: 'Stats', icon: PieChart },
    { id: 'budget' as NavTab, label: 'Budget', icon: Wallet },
    { id: 'account' as NavTab, label: 'Account', icon: CreditCard },
    { id: 'more' as NavTab, label: 'More', icon: MoreHorizontal },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#FFFFFF]/85 dark:bg-[#120F0A]/85 backdrop-blur-xl border-t border-[#D6CEC3]/40 dark:border-[rgba(212,175,55,0.20)] shadow-xl dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] max-w-md mx-auto rounded-t-[28px] px-2 py-1 transition-all">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                onSelectTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-white bg-[#5A5A40] dark:bg-[rgba(212,175,55,0.22)] dark:text-[#F7DE98] font-bold shadow-xs dark:border dark:border-[rgba(212,175,55,0.45)] dark:shadow-[0_2px_16px_rgba(212,175,55,0.30)]'
                  : 'text-[#2D2926]/70 dark:text-[rgba(247,238,219,0.60)] hover:text-[#2D2926] dark:hover:text-[#F7DE98] hover:bg-[#F9F7F2] dark:hover:bg-[rgba(212,175,55,0.10)]'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 transition-transform duration-200 ${isActive ? 'scale-110 text-white dark:text-[#F7DE98]' : ''}`} />
              <span className="text-[10px] leading-none tracking-tight font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
