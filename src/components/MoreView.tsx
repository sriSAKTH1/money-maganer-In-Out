import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Download, Upload, FileSpreadsheet, 
  Settings, FolderPlus, RotateCcw, Eye, EyeOff, Moon, Sun, 
  MessageSquare, Sparkles, ChevronRight, Target, TrendingUp, 
  PieChart, Calculator, Check, X, User, LogOut, ArrowUpRight,
  Shield, CreditCard, Bell, Smartphone, HelpCircle, Palette, Coins, KeyRound, Database,
  Paperclip, Bug, Lightbulb, Send, FileText, Trash2, AlertTriangle, Pipette, Edit2, Plus
} from 'lucide-react';
import { UserSettings, Category } from '../types';
import { 
  saveSettings, 
  exportBackupJSON, 
  importBackupJSON, 
  exportTransactionsCSV, 
  resetDatabaseToDefault,
  resetAllDataToEmpty,
  deleteUserAccountAndData,
  addCategory,
  updateCategory,
  deleteCategory
} from '../data/storage';
import { CategoryIcon } from './CategoryIcon';
import { ProComingSoonModal } from './ProComingSoonModal';

const INCOME_COLOR_PALETTE = [
  '#059669', // Vibrant Emerald Green
  '#2563EB', // Cobalt Royal Blue
  '#7C3AED', // Royal Purple / Violet
  '#D97706', // Golden Amber / Warm Gold
  '#DB2777', // Vivid Magenta / Rose Pink
  '#0891B2', // Ocean Cyan / Turquoise
  '#4F46E5', // Deep Indigo
  '#10B981', // Fresh Mint Green
];

const EXPENSE_COLOR_PALETTE = [
  '#C85A32', // Terracotta Clay
  '#D97706', // Warm Amber
  '#B56576', // Muted Rust
  '#6B705C', // Olive Bark
  '#D4A373', // Warm Sand
  '#E07A5F', // Soft Clay
  '#9C6644', // Warm Cinnamon
  '#7F5539', // Dark Mocha
];

interface MoreViewProps {
  settings: UserSettings;
  categories: Category[];
  onLockApp: () => void;
  onNavigateTab?: (tab: 'overview' | 'stats' | 'budget' | 'account' | 'more') => void;
}

type SubTab = 'account' | 'preferences' | 'profiles' | 'billing';

export const MoreView: React.FC<MoreViewProps> = ({
  settings,
  categories,
  onLockApp,
  onNavigateTab,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('preferences');
  const [activeTile, setActiveTile] = useState<string>('settings');

  // Quick Toggles State
  const [isDarkMode, setIsDarkMode] = useState(settings.theme === 'dark');
  const [showTotals, setShowTotals] = useState(settings.show_totals !== false);
  const [passcodeEnabled, setPasscodeEnabled] = useState(settings.passcode_enabled);
  const [biometricEnabled, setBiometricEnabled] = useState(settings.biometric_enabled);
  const [currency, setCurrency] = useState(settings.currency);
  const [startScreen, setStartScreen] = useState(settings.start_screen);

  // Profile info state
  const [userName, setUserName] = useState(() => localStorage.getItem('mm_user_name') || 'SriSAKTHI Sudharsan');
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('mm_user_email') || 'srisakthi310@gmail.com');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState<'profile' | 'security' | 'appearance'>('profile');
  const [profileOldPin, setProfileOldPin] = useState('');
  const [profileNewPin, setProfileNewPin] = useState('');
  const [profileConfirmPin, setProfileConfirmPin] = useState('');
  const [profilePinError, setProfilePinError] = useState('');

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showResetDataModal, setShowResetDataModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [resetSelection, setResetSelection] = useState<'empty' | 'seed'>('empty');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [showOldPinText, setShowOldPinText] = useState(false);
  const [showNewPinText, setShowNewPinText] = useState(false);
  const [showConfirmPinText, setShowConfirmPinText] = useState(false);
  const [showProfilePinText, setShowProfilePinText] = useState(false);

  const [feedbackCategory, setFeedbackCategory] = useState<'bug' | 'feature' | 'other'>('bug');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  // Category management state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'income' | 'expense'>('expense');
  const [catColor, setCatColor] = useState('#5A5A40');
  const [customHexInput, setCustomHexInput] = useState('#5A5A40');

  const [notificationMsg, setNotificationMsg] = useState('');

  const showToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(''), 3000);
  };

  const handleToggleDarkMode = (val: boolean) => {
    setIsDarkMode(val);
    const newTheme = val ? 'dark' : 'light';
    saveSettings({ theme: newTheme });
    showToast(val ? 'Dark mode enabled' : 'Light theme enabled');
  };

  const handleOpenPasscodeModal = () => {
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPasscodeError('');
    setShowOldPinText(false);
    setShowNewPinText(false);
    setShowConfirmPinText(false);
    setShowPasscodeModal(true);
  };

  const handleSavePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');

    // If current passcode exists and is enabled, verify old pin
    if (settings.passcode_pin && settings.passcode_enabled) {
      if (oldPin !== settings.passcode_pin) {
        setPasscodeError('Current PIN is incorrect.');
        return;
      }
    }

    if (!newPin || newPin.length < 4) {
      setPasscodeError('PIN must be at least 4 digits.');
      return;
    }

    if (newPin !== confirmPin) {
      setPasscodeError('New PIN and Confirm PIN do not match.');
      return;
    }

    saveSettings({
      passcode_pin: newPin,
      passcode_enabled: true,
    });
    setPasscodeEnabled(true);
    setShowPasscodeModal(false);
    showToast('Passcode PIN successfully updated!');
  };

  const handleToggleShowTotals = (val: boolean) => {
    setShowTotals(val);
    saveSettings({ show_totals: val });
    showToast(val ? 'Totals visible on cards' : 'Totals hidden for privacy');
  };

  const handleTogglePasscode = (val: boolean) => {
    setPasscodeEnabled(val);
    saveSettings({ passcode_enabled: val });
    showToast(val ? 'Passcode security active' : 'Passcode disabled');
  };

  const handleToggleBiometric = (val: boolean) => {
    setBiometricEnabled(val);
    saveSettings({ biometric_enabled: val });
    showToast(val ? 'Biometrics enabled' : 'Biometrics disabled');
  };

  const handleChangeCurrency = (val: string) => {
    setCurrency(val);
    let symbol = '₹';
    if (val.includes('$')) symbol = '$';
    else if (val.includes('€')) symbol = '€';
    else if (val.includes('£')) symbol = '£';
    else if (val.includes('¥')) symbol = '¥';
    
    saveSettings({ currency: val, currency_symbol: symbol });
    showToast(`Currency set to ${val}`);
  };

  const handleChangeStartScreen = (val: 'daily' | 'calendar' | 'monthly' | 'total') => {
    setStartScreen(val);
    saveSettings({ start_screen: val });
    showToast('Default launch view updated');
  };

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `money_manager_backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON Backup downloaded!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content && importBackupJSON(content)) {
        showToast('Backup restored successfully!');
        setTimeout(() => window.location.reload(), 800);
      } else {
        showToast('Error restoring backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportCSV = () => {
    const csvStr = exportTransactionsCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_export_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV Export downloaded!');
  };

  const handleOpenAddCategory = (type: 'income' | 'expense' = 'expense') => {
    setEditingCategory(null);
    setCatName('');
    setCatType(type);
    const initialColor = type === 'income' ? INCOME_COLOR_PALETTE[0] : EXPENSE_COLOR_PALETTE[0];
    setCatColor(initialColor);
    setCustomHexInput(initialColor);
    setShowCategoryModal(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatColor(cat.color || '#5A5A40');
    setCustomHexInput(cat.color || '#5A5A40');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    let finalColor = catColor.trim();
    if (!finalColor.startsWith('#')) {
      finalColor = '#' + finalColor;
    }

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: catName.trim(),
        type: catType,
        color: finalColor,
      });
      showToast(`Category "${catName}" updated!`);
    } else {
      addCategory({
        name: catName.trim(),
        type: catType,
        icon: catType === 'income' ? 'TrendingUp' : 'Tag',
        color: finalColor,
        is_default: false,
        is_active: true,
      });
      showToast(`Category "${catName}" created!`);
    }

    setCatName('');
    setEditingCategory(null);
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (catId: string, name: string) => {
    deleteCategory(catId);
    showToast(`Category "${name}" deleted!`);
    if (editingCategory?.id === catId) {
      setShowCategoryModal(false);
      setEditingCategory(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    let typeLabel = 'Bug Report';
    if (feedbackCategory === 'feature') typeLabel = 'Feature Request';
    if (feedbackCategory === 'other') typeLabel = 'Feedback';

    setShowFeedbackModal(false);
    setFeedbackText('');
    setAttachedFile(null);
    showToast(`Thank you! Your ${typeLabel} has been sent successfully.`);
  };

  const handleResetDatabase = (mode: 'empty' | 'seed') => {
    if (mode === 'empty') {
      resetAllDataToEmpty();
      showToast('Database reset to empty clean slate');
    } else {
      resetDatabaseToDefault();
      showToast('Database restored to default demo state');
    }
    setShowResetDataModal(false);
    setShowProfileModal(false);
    setTimeout(() => window.location.reload(), 400);
  };

  const handleDeleteAccount = () => {
    deleteUserAccountAndData();
    setShowDeleteAccountModal(false);
    setShowProfileModal(false);
    showToast('Account deleted. Resetting application...');
    setTimeout(() => window.location.reload(), 500);
  };

  const menuGridTiles = [
    { id: 'essentials', label: 'Essentials', icon: Shield, action: () => setActiveTile('essentials') },
    { id: 'goals', label: 'Goals', icon: Target, action: () => onNavigateTab ? onNavigateTab('budget') : setActiveTile('goals') },
    { id: 'networth', label: 'Net Worth', icon: TrendingUp, action: () => onNavigateTab ? onNavigateTab('account') : setActiveTile('networth') },
    { id: 'insights', label: 'Insights', icon: PieChart, action: () => onNavigateTab ? onNavigateTab('stats') : setActiveTile('insights') },
    { id: 'import', label: 'Import', icon: Upload, action: () => setActiveTile('import') },
    { id: 'calculators', label: 'Calculators', icon: Calculator, action: () => setActiveTile('calculators') },
    { id: 'whatsnew', label: "What's New", icon: Sparkles, action: () => setShowProModal(true) },
    { id: 'settings', label: 'Settings', icon: Settings, action: () => setActiveTile('settings') },
  ];

  return (
    <div className="space-y-4 pb-2 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="p-3 bg-[#5A5A40]/10 dark:bg-[#5A5A40]/30 border border-[#5A5A40]/30 text-[#5A5A40] dark:text-[#E8E4DC] text-xs font-bold rounded-2xl animate-in slide-in-from-top-2 flex items-center justify-between">
          <span>✓ {notificationMsg}</span>
        </div>
      )}

      {/* Top Header Title */}
      <div className="px-1">
        <h1 className="font-serif-bento text-2xl font-bold text-[#2D2926] dark:text-[#E8E4DC]">
          Settings
        </h1>
        <p className="text-xs font-medium text-[#2D2926]/60 dark:text-[#E8E4DC]/60 mt-0.5">
          Account, preferences & privacy
        </p>
      </div>

      {/* Upgrade Callout Card (Pro Coming Soon - Low Cost Plans) */}
      <div
        id="pro-coming-soon-card"
        onClick={() => setShowProModal(true)}
        className="bento-card p-4 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden group border-2 border-[#5A5A40]/30 dark:border-white/10 bg-gradient-to-br from-white via-[#F9F7F2] to-[#EAE6DF] dark:from-[#272521] dark:via-[#22201C] dark:to-[#1C1B18]"
      >
        {/* Ambient subtle glow */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#C28B70]/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5A5A40] to-[#3B3B2B] text-white flex items-center justify-center shadow-sm shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-[#F2CC8F]" />
            </div>

            <div className="space-y-1.5 pr-2">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h3 className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC]">
                  Money Manager Pro
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#C28B70] text-white shadow-xs">
                  Coming Soon
                </span>
                <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#5A5A40]/10 dark:bg-white/10 text-[#5A5A40] dark:text-[#E8E4DC]">
                  Low Cost
                </span>
              </div>

              <p className="text-[11px] text-[#2D2926]/75 dark:text-[#E8E4DC]/75 font-medium leading-tight">
                Add <span className="font-bold text-[#5A5A40] dark:text-[#E8E4DC]">Unlimited Budgets</span> & <span className="font-bold text-[#C28B70]">Unlimited Accounts</span> with flexible low-cost passes.
              </p>

              {/* Quick Options Pill Badges */}
              <div className="flex items-center space-x-2 pt-0.5 text-[9px] font-semibold text-[#2D2926]/70 dark:text-[#E8E4DC]/70">
                <span className="bg-[#D6CEC3]/50 dark:bg-white/5 px-2 py-0.5 rounded-full">Monthly</span>
                <span className="bg-[#D6CEC3]/50 dark:bg-white/5 px-2 py-0.5 rounded-full">Annual (60% Off)</span>
                <span className="bg-[#D6CEC3]/50 dark:bg-white/5 px-2 py-0.5 rounded-full">Lifetime</span>
              </div>
            </div>
          </div>

          <div className="p-1 rounded-full bg-[#D6CEC3]/40 dark:bg-white/10 text-[#2D2926]/60 dark:text-[#E8E4DC]/60 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Toggles List (Show totals, Dark mode, Feedback) */}
      <div className="bento-card p-4 space-y-3">
        <h3 className="font-serif-bento text-xs font-bold text-[#5A5A40] dark:text-[#E8E4DC] uppercase tracking-wider">
          Quick Controls
        </h3>

        <div className="space-y-2">
          
          {/* Show Totals Toggle */}
          <div className="flex justify-between items-center p-3 bg-[#F9F7F2] dark:bg-[#23211D] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5">
            <div className="flex items-center space-x-3">
              {showTotals ? (
                <Eye className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
              ) : (
                <EyeOff className="w-4 h-4 text-[#C28B70]" />
              )}
              <div>
                <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Show totals</p>
                <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">
                  {showTotals ? 'Balances visible on card views' : 'Hidden for privacy'}
                </p>
              </div>
            </div>

            {/* Custom Smooth Toggle Switch */}
            <button
              type="button"
              onClick={() => handleToggleShowTotals(!showTotals)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                showTotals ? 'bg-[#5A5A40]' : 'bg-[#D6CEC3] dark:bg-[#3A3731]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  showTotals ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Royal Dark Mode Switch Toggle */}
          <div className="flex justify-between items-center p-3 bg-[#F9F7F2] dark:bg-[#1A1922] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon className="w-4 h-4 text-[#F2CC8F]" />
              ) : (
                <Sun className="w-4 h-4 text-[#5A5A40]" />
              )}
              <div>
                <p className="text-xs font-bold text-[#2D2926] dark:text-[#F5EFEB]">Royal Dark Mode</p>
                <p className="text-[10px] text-[#2D2926]/60 dark:text-[#F5EFEB]/60">
                  {isDarkMode ? 'Active (Velvet obsidian & gold luxury accents)' : 'Light cream background'}
                </p>
              </div>
            </div>

            {/* Custom Smooth Toggle Switch */}
            <button
              type="button"
              onClick={() => handleToggleDarkMode(!isDarkMode)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                isDarkMode ? 'bg-[#5A5A40]' : 'bg-[#D6CEC3] dark:bg-[#3A3731]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  isDarkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Feedback Button */}
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="w-full flex justify-between items-center p-3 bg-[#F9F7F2] dark:bg-[#23211D] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 hover:bg-[#D6CEC3]/20 transition-all"
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
              <div className="text-left">
                <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Feedback</p>
                <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">
                  Share suggestions or request features
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#2D2926]/40 dark:text-[#E8E4DC]/40" />
          </button>

        </div>
      </div>

      {/* Detailed Settings Panel */}
      <div className="bento-card p-4 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 border-b border-[#D6CEC3]/40 dark:border-white/10 pb-3">
            <Settings className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
            <h3 className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC]">
              Settings & Preferences
            </h3>
          </div>

          <div className="space-y-3">
            
            {/* 1. Backup Setting */}
            <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#23211D] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 space-y-2.5">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#5A5A40]/10 dark:bg-[#5A5A40]/30 text-[#5A5A40] dark:text-[#E8E4DC]">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Backup & Export</p>
                  <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">Save, restore, or export financial logs</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleExportBackup}
                  className="py-2.5 px-3 bg-white dark:bg-[#1C1B18] hover:bg-[#D6CEC3]/20 rounded-xl border border-[#D6CEC3]/40 dark:border-white/5 text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC] flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-[#5A5A40] dark:text-[#E8E4DC]" />
                  <span>Backup JSON</span>
                </button>

                <label className="py-2.5 px-3 bg-white dark:bg-[#1C1B18] hover:bg-[#D6CEC3]/20 rounded-xl border border-[#D6CEC3]/40 dark:border-white/5 text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC] flex items-center justify-center space-x-1.5 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5 text-[#A1A892]" />
                  <span>Restore JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full py-2 bg-white dark:bg-[#1C1B18] hover:bg-[#D6CEC3]/20 rounded-xl border border-[#D6CEC3]/40 dark:border-white/5 text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC] flex items-center justify-center space-x-1.5 transition-all"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#C28B70]" />
                <span>Export Transactions CSV</span>
              </button>
            </div>

            {/* 5. Help Setting */}
            <div className="p-3.5 bg-[#F9F7F2] dark:bg-[#23211D] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-[#5A5A40]/10 dark:bg-[#5A5A40]/30 text-[#5A5A40] dark:text-[#E8E4DC]">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Help & FAQs</p>
                    <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">Guides, FAQs, and feedback</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowHelpModal(true)}
                  className="bento-pill bento-pill-olive text-xs cursor-pointer"
                >
                  Open Help
                </button>
              </div>
            </div>

          </div>
        </div>

      {/* Tile Active Detailed Panels */}
      {activeTile === 'essentials' && (
        <div className="bento-card p-4 space-y-3 animate-in fade-in duration-200">
          <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#E8E4DC] flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
            <span>Essentials & Security</span>
          </h3>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-[#F9F7F2] dark:bg-[#23211D] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5">
              <div>
                <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Passcode Protection</p>
                <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">Require PIN on app startup</p>
              </div>
              <input
                type="checkbox"
                checked={passcodeEnabled}
                onChange={(e) => handleTogglePasscode(e.target.checked)}
                className="w-4 h-4 accent-[#5A5A40]"
              />
            </div>

            <div className="flex justify-between items-center p-3 bg-[#F9F7F2] dark:bg-[#23211D] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5">
              <div>
                <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Biometric Unlock</p>
                <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">Fingerprint / Face ID</p>
              </div>
              <input
                type="checkbox"
                checked={biometricEnabled}
                onChange={(e) => handleToggleBiometric(e.target.checked)}
                className="w-4 h-4 accent-[#5A5A40]"
              />
            </div>

            <button
              onClick={onLockApp}
              className="w-full py-2.5 bg-[#5A5A40] text-white text-xs font-bold rounded-full flex items-center justify-center space-x-2 shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>Lock Application Now</span>
            </button>
          </div>
        </div>
      )}

      {activeTile === 'calculators' && (
        <div className="bento-card p-4 space-y-3 animate-in fade-in duration-200">
          <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#E8E4DC] flex items-center space-x-1.5">
            <Calculator className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
            <span>Preferences & Currency</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[#E8E4DC]/70 uppercase tracking-wider mb-1">
                Main Currency
              </label>
              <select
                value={currency}
                onChange={(e) => handleChangeCurrency(e.target.value)}
                className="w-full bg-[#F9F7F2] dark:bg-[#23211D] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden text-[#2D2926] dark:text-[#E8E4DC]"
              >
                <option value="₹ INR">₹ INR (Indian Rupee)</option>
                <option value="$ USD">$ USD (US Dollar)</option>
                <option value="€ EUR">€ EUR (Euro)</option>
                <option value="£ GBP">£ GBP (British Pound)</option>
                <option value="¥ JPY">¥ JPY (Japanese Yen)</option>
                <option value="AED">AED (Emirati Dirham)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#2D2926]/70 dark:text-[#E8E4DC]/70 uppercase tracking-wider mb-1">
                Default Launch View
              </label>
              <select
                value={startScreen}
                onChange={(e) => handleChangeStartScreen(e.target.value as 'daily' | 'calendar' | 'monthly' | 'total')}
                className="w-full bg-[#F9F7F2] dark:bg-[#23211D] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden text-[#2D2926] dark:text-[#E8E4DC]"
              >
                <option value="daily">Daily Overview</option>
                <option value="calendar">Monthly Calendar</option>
                <option value="monthly">Monthly Breakdown</option>
                <option value="total">All-Time Reserve</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {activeTile === 'import' && (
        <div className="bento-card p-4 space-y-3 animate-in fade-in duration-200">
          <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#E8E4DC] flex items-center space-x-1.5">
            <Upload className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
            <span>Data Import & Backup Tools</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleExportBackup}
              className="p-3.5 bg-[#F9F7F2] dark:bg-[#23211D] hover:bg-[#D6CEC3]/30 rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-1 transition-all"
            >
              <Download className="w-5 h-5 text-[#5A5A40] dark:text-[#E8E4DC]" />
              <span className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Backup JSON</span>
            </button>

            <label className="p-3.5 bg-[#F9F7F2] dark:bg-[#23211D] hover:bg-[#D6CEC3]/30 rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-1 cursor-pointer transition-all">
              <Upload className="w-5 h-5 text-[#A1A892]" />
              <span className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Restore Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={handleExportCSV}
            className="w-full py-3 bg-[#F9F7F2] dark:bg-[#23211D] hover:bg-[#D6CEC3]/30 rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 flex items-center justify-center space-x-2 text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC] transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#C28B70]" />
            <span>Export All Transactions to CSV</span>
          </button>
        </div>
      )}

      {/* Categories Management Tile */}
      <div className="bento-card p-4 space-y-3.5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-serif-bento text-sm font-bold text-[#5A5A40] dark:text-[#E8E4DC] flex items-center space-x-1.5">
              <FolderPlus className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
              <span>Category Configuration</span>
            </h3>
            <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 pt-0.5">
              Tap any category to customize color, edit name, or delete.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenAddCategory('expense')}
            className="bento-pill bento-pill-olive text-xs cursor-pointer flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Income Categories Swatches */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#059669] dark:text-[#34D399]">
              Income Categories ({categories.filter(c => c.type === 'income' && c.is_active).length})
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddCategory('income')}
              className="text-[10px] font-bold text-[#059669] dark:text-[#34D399] hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Income</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories
              .filter(c => c.type === 'income' && c.is_active)
              .map(c => (
                <div
                  key={c.id}
                  onClick={() => handleOpenEditCategory(c)}
                  className="group flex items-center space-x-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold bg-[#F9F7F2] dark:bg-[#23211D] border border-[#D6CEC3]/60 dark:border-white/10 hover:border-[#5A5A40]/60 dark:hover:border-white/30 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                  title="Click to edit or change custom color"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs ring-1 ring-black/10 dark:ring-white/20"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-[#2D2926] dark:text-[#E8E4DC] text-[11px]">{c.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(c.id, c.name);
                    }}
                    className="p-1 rounded-full text-[#2D2926]/40 dark:text-[#E8E4DC]/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={`Delete ${c.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Expense Categories Swatches */}
        <div className="space-y-2 pt-2 border-t border-[#D6CEC3]/30 dark:border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#C28B70] dark:text-[#E0A890]">
              Expense Categories ({categories.filter(c => c.type === 'expense' && c.is_active).length})
            </p>
            <button
              type="button"
              onClick={() => handleOpenAddCategory('expense')}
              className="text-[10px] font-bold text-[#C28B70] dark:text-[#E0A890] hover:underline flex items-center space-x-0.5 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>Add Expense</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {categories
              .filter(c => c.type === 'expense' && c.is_active)
              .map(c => (
                <div
                  key={c.id}
                  onClick={() => handleOpenEditCategory(c)}
                  className="group flex items-center space-x-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-xs font-semibold bg-[#F9F7F2] dark:bg-[#23211D] border border-[#D6CEC3]/60 dark:border-white/10 hover:border-[#C28B70]/60 dark:hover:border-white/30 cursor-pointer shadow-2xs hover:shadow-xs transition-all"
                  title="Click to edit or change custom color"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-2xs ring-1 ring-black/10 dark:ring-white/20"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-[#2D2926] dark:text-[#E8E4DC] text-[11px]">{c.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(c.id, c.name);
                    }}
                    className="p-1 rounded-full text-[#2D2926]/40 dark:text-[#E8E4DC]/40 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={`Delete ${c.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Data Management & Danger Zone Section */}
      <div className="bento-card p-4 space-y-3 border-l-4 border-l-[#C28B70]/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-[#C28B70]/15 dark:bg-[#C28B70]/30 text-[#C28B70]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif-bento text-sm font-bold text-[#2D2926] dark:text-[#E8E4DC]">
              Data Management & Danger Zone
            </h3>
            <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">
              Reset transactions & records or delete account permanently
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowResetDataModal(true)}
            className="py-2.5 px-3 bg-[#F9F7F2] dark:bg-[#23211D] hover:bg-[#D6CEC3]/30 rounded-xl border border-[#D6CEC3]/50 dark:border-white/5 text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#5A5A40] dark:text-[#E8E4DC]" />
            <span>Reset Financial Data</span>
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteAccountModal(true)}
            className="py-2.5 px-3 bg-[#C28B70]/10 hover:bg-[#C28B70]/20 rounded-xl border border-[#C28B70]/30 text-xs font-bold text-[#C28B70] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Bottom User Profile Section */}
      <div 
        onClick={() => {
          setProfileOldPin('');
          setProfileNewPin('');
          setProfileConfirmPin('');
          setProfilePinError('');
          setShowProfileModal(true);
        }}
        className="bento-card p-4 flex items-center justify-between cursor-pointer hover:border-[#5A5A40]/40 transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:scale-105 transition-transform">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC] flex items-center space-x-1.5">
              <span>{userName}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#5A5A40]/10 dark:bg-[#5A5A40]/30 text-[#5A5A40] dark:text-[#E8E4DC]">
                Edit
              </span>
            </h4>
            <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 font-medium">
              {userEmail} • Tap for Password & Theme
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onLockApp();
            }}
            className="p-2.5 rounded-full bg-[#F9F7F2] dark:bg-[#23211D] text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC] border border-[#D6CEC3]/40 dark:border-white/5"
            title="Lock App"
          >
            <Lock className="w-4 h-4" />
          </button>
          <div className="p-2 rounded-full text-[#2D2926]/40 dark:text-[#E8E4DC]/40 group-hover:text-[#5A5A40] dark:group-hover:text-[#E8E4DC] transition-colors">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Comprehensive User Profile & Preferences Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#F9F7F2] dark:bg-[#272521] w-full max-w-md rounded-[28px] p-5 border border-[#D6CEC3] dark:border-white/10 shadow-2xl space-y-4 text-[#2D2926] dark:text-[#E8E4DC] max-h-[90vh] overflow-y-auto no-scrollbar">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif-bento text-base font-bold">Profile & Settings</h3>
                  <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 font-medium">
                    Manage profile, security, and theme
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowProfileModal(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5 text-[#2D2926]/60 dark:text-[#E8E4DC]/60" />
              </button>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#D6CEC3]/30 dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5">
              <button
                type="button"
                onClick={() => setProfileTab('profile')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  profileTab === 'profile'
                    ? 'bg-white dark:bg-[#272521] text-[#5A5A40] dark:text-[#E8E4DC] shadow-xs'
                    : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab('security')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  profileTab === 'security'
                    ? 'bg-white dark:bg-[#272521] text-[#5A5A40] dark:text-[#E8E4DC] shadow-xs'
                    : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Passcode</span>
              </button>

              <button
                type="button"
                onClick={() => setProfileTab('appearance')}
                className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                  profileTab === 'appearance'
                    ? 'bg-white dark:bg-[#272521] text-[#5A5A40] dark:text-[#E8E4DC] shadow-xs'
                    : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme</span>
              </button>
            </div>

            {/* Tab 1: Profile Info */}
            {profileTab === 'profile' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="flex items-center space-x-3 p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/50 dark:border-white/5">
                  <div className="w-12 h-12 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">{userName}</p>
                    <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">{userEmail}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 bg-[#5A5A40]/10 text-[#5A5A40] dark:text-[#E8E4DC] rounded-full">
                      Bento Master Account
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-white dark:bg-[#1C1B18] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-white dark:bg-[#1C1B18] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Passcode & Security (Create / Change Passcode) */}
            {profileTab === 'security' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {profilePinError && (
                  <div className="p-2.5 bg-[#C28B70]/15 border border-[#C28B70]/40 text-[#C28B70] text-xs font-bold rounded-xl">
                    ⚠️ {profilePinError}
                  </div>
                )}

                {/* Passcode Enabled Switch */}
                <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/50 dark:border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <KeyRound className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
                    <div>
                      <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Passcode Protection</p>
                      <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">
                        {settings.passcode_pin ? 'PIN configured (••••)' : 'No PIN configured yet'}
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={passcodeEnabled}
                    onChange={(e) => {
                      setPasscodeEnabled(e.target.checked);
                      saveSettings({ passcode_enabled: e.target.checked });
                    }}
                    className="w-4 h-4 accent-[#5A5A40]"
                  />
                </div>

                {/* Biometric Toggle */}
                <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/50 dark:border-white/5">
                  <div className="flex items-center space-x-2.5">
                    <Smartphone className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
                    <div>
                      <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Biometric Unlock</p>
                      <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">Fingerprint & Face ID</p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => {
                      setBiometricEnabled(e.target.checked);
                      saveSettings({ biometric_enabled: e.target.checked });
                    }}
                    className="w-4 h-4 accent-[#5A5A40]"
                  />
                </div>

                {/* Inline Create / Change Passcode PIN */}
                <div className="p-3.5 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/50 dark:border-white/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#5A5A40] dark:text-[#E8E4DC]">
                      {settings.passcode_pin ? 'Change Password / PIN' : 'Create New Password / PIN'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowProfilePinText(!showProfilePinText)}
                      className="text-[10px] font-bold text-[#5A5A40] dark:text-[#F7DE98] flex items-center space-x-1 hover:opacity-80 transition-opacity cursor-pointer"
                      title={showProfilePinText ? "Hide PIN" : "Show PIN"}
                    >
                      {showProfilePinText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{showProfilePinText ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>

                  {settings.passcode_pin && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider opacity-70">
                          Current PIN
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showProfilePinText ? "text" : "password"}
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Current PIN"
                          value={profileOldPin}
                          onChange={(e) => setProfileOldPin(e.target.value)}
                          className="w-full bg-[#F9F7F2] dark:bg-[#272521] text-xs font-bold tracking-widest p-2.5 rounded-xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider opacity-70">
                          New PIN
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showProfilePinText ? "text" : "password"}
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="New PIN"
                          value={profileNewPin}
                          onChange={(e) => setProfileNewPin(e.target.value)}
                          className="w-full bg-[#F9F7F2] dark:bg-[#272521] text-xs font-bold tracking-widest p-2.5 rounded-xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[9px] font-bold uppercase tracking-wider opacity-70">
                          Confirm PIN
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type={showProfilePinText ? "text" : "password"}
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Confirm PIN"
                          value={profileConfirmPin}
                          onChange={(e) => setProfileConfirmPin(e.target.value)}
                          className="w-full bg-[#F9F7F2] dark:bg-[#272521] text-xs font-bold tracking-widest p-2.5 rounded-xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lock Now Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    onLockApp();
                  }}
                  className="w-full py-2.5 bg-[#5A5A40] text-white text-xs font-bold rounded-xl flex items-center justify-center space-x-1.5 shadow-xs hover:bg-[#484833] transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Application Now</span>
                </button>
              </div>
            )}

            {/* Tab 3: Appearance & Theme Options */}
            {profileTab === 'appearance' && (
              <div className="space-y-3.5 animate-in fade-in duration-150">
                {/* Dark Mode Switch */}
                <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/50 dark:border-white/5">
                  <div className="flex items-center space-x-2.5">
                    {isDarkMode ? (
                      <Moon className="w-4 h-4 text-[#E8E4DC]" />
                    ) : (
                      <Sun className="w-4 h-4 text-[#5A5A40]" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Theme Mode</p>
                      <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">
                        {isDarkMode ? 'Earth Dark (#1C1B18)' : 'Natural Cream Ivory'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleDarkMode(!isDarkMode)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                      isDarkMode ? 'bg-[#5A5A40]' : 'bg-[#D6CEC3] dark:bg-[#3A3731]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        isDarkMode ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Show Balances Privacy Toggle */}
                <div className="flex justify-between items-center p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/50 dark:border-white/5">
                  <div className="flex items-center space-x-2.5">
                    {showTotals ? (
                      <Eye className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-[#C28B70]" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Show Balance Numbers</p>
                      <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60">
                        {showTotals ? 'Balances visible everywhere' : 'Concealed as xxx'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleShowTotals(!showTotals)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer ${
                      showTotals ? 'bg-[#5A5A40]' : 'bg-[#D6CEC3] dark:bg-[#3A3731]'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        showTotals ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Currency Selection */}
                <div className="p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/50 dark:border-white/5 space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                    Base Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => handleChangeCurrency(e.target.value)}
                    className="w-full bg-[#F9F7F2] dark:bg-[#272521] text-xs font-semibold p-2.5 rounded-xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden text-[#2D2926] dark:text-[#E8E4DC]"
                  >
                    <option value="₹ INR">₹ INR (Indian Rupee)</option>
                    <option value="$ USD">$ USD (US Dollar)</option>
                    <option value="€ EUR">€ EUR (Euro)</option>
                    <option value="£ GBP">£ GBP (British Pound)</option>
                    <option value="¥ JPY">¥ JPY (Japanese Yen)</option>
                    <option value="AED">AED (Emirati Dirham)</option>
                    <option value="$ CAD">$ CAD (Canadian Dollar)</option>
                    <option value="$ AUD">$ AUD (Australian Dollar)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex space-x-2 border-t border-[#D6CEC3]/40 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="flex-1 py-3 text-xs font-bold bg-[#D6CEC3]/30 dark:bg-[#36332E] hover:bg-[#D6CEC3]/50 text-[#2D2926] dark:text-[#E8E4DC] rounded-full transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  // If user entered a new PIN, validate and save it
                  if (profileNewPin || profileConfirmPin) {
                    if (profileNewPin.length < 4) {
                      setProfilePinError('PIN must be at least 4 digits');
                      setProfileTab('security');
                      return;
                    }
                    if (profileNewPin !== profileConfirmPin) {
                      setProfilePinError('New PIN and confirmation do not match');
                      setProfileTab('security');
                      return;
                    }
                    if (settings.passcode_pin && settings.passcode_enabled && profileOldPin !== settings.passcode_pin) {
                      setProfilePinError('Current PIN is incorrect');
                      setProfileTab('security');
                      return;
                    }
                    saveSettings({
                      passcode_pin: profileNewPin,
                      passcode_enabled: true,
                    });
                    setPasscodeEnabled(true);
                  }

                  // Save Profile Name & Email
                  localStorage.setItem('mm_user_name', userName);
                  localStorage.setItem('mm_user_email', userEmail);
                  
                  setShowProfileModal(false);
                  showToast('Profile & preferences saved successfully!');
                }}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full shadow-xs transition-colors"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Pro Features Coming Soon Modal */}
      <ProComingSoonModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        settings={settings}
        onPlanActivated={(plan) => {
          showToast(`Pro ${plan.toUpperCase()} preview mode activated! Unlimited features unlocked.`);
        }}
      />

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#F9F7F2] dark:bg-[#272521] w-full max-w-md rounded-[28px] p-5 border border-[#D6CEC3] dark:border-white/10 shadow-2xl space-y-4 text-[#2D2926] dark:text-[#E8E4DC] max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-[#5A5A40] dark:text-[#E8E4DC]" />
                <h3 className="font-serif-bento text-base font-bold">Feedback & Support</h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowFeedbackModal(false);
                  setAttachedFile(null);
                }}
              >
                <X className="w-5 h-5 opacity-60 hover:opacity-100" />
              </button>
            </div>

            <form onSubmit={handleSendFeedback} className="space-y-4">
              
              {/* Category Selection Tabs */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-70">
                  Feedback Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#D6CEC3]/30 dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => setFeedbackCategory('bug')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                      feedbackCategory === 'bug'
                        ? 'bg-[#C28B70] text-white shadow-xs'
                        : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
                    }`}
                  >
                    <Bug className="w-4 h-4" />
                    <span className="text-[10px] whitespace-nowrap">Bug Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackCategory('feature')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                      feedbackCategory === 'feature'
                        ? 'bg-[#5A5A40] text-white shadow-xs'
                        : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
                    }`}
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-[10px] whitespace-nowrap">Feature</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFeedbackCategory('other')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center space-y-1 ${
                      feedbackCategory === 'other'
                        ? 'bg-[#737353] text-white shadow-xs'
                        : 'text-[#2D2926]/70 dark:text-[#E8E4DC]/70 hover:text-[#2D2926] dark:hover:text-[#E8E4DC]'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-[10px] whitespace-nowrap">Other</span>
                  </button>
                </div>
              </div>

              {/* Notepad Container */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-[#5A5A40] dark:text-[#E8E4DC]" />
                    <span>Notepad Notes</span>
                  </label>
                  <span className="text-[10px] opacity-50 font-mono">
                    {feedbackText.length}/500
                  </span>
                </div>

                <div className="relative rounded-2xl bg-white dark:bg-[#1C1B18] border border-[#D6CEC3]/70 dark:border-white/10 p-3 shadow-xs">
                  {/* Subtle Notebook Lines styling background */}
                  <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-10 dark:opacity-5 bg-[linear-gradient(to_bottom,transparent_27px,#2D2926_28px)] bg-[length:100%_28px] mt-2" />

                  <textarea
                    required
                    maxLength={500}
                    rows={4}
                    placeholder={
                      feedbackCategory === 'bug'
                        ? "Describe the bug you encountered, what happened, or steps to reproduce..."
                        : feedbackCategory === 'feature'
                        ? "Describe the feature or improvement you'd like to see in Bento Money..."
                        : "Write your feedback, questions, or ideas here..."
                    }
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full relative z-10 bg-transparent text-xs font-medium focus:outline-hidden resize-none leading-relaxed text-[#2D2926] dark:text-[#E8E4DC]"
                  />
                </div>
              </div>

              {/* Attach File Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Attach File / Screenshot
                </label>

                {attachedFile ? (
                  <div className="flex items-center justify-between p-2.5 bg-white dark:bg-[#1C1B18] rounded-xl border border-[#5A5A40]/40 text-xs font-medium">
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <Paperclip className="w-4 h-4 text-[#5A5A40] shrink-0" />
                      <span className="truncate text-[11px] font-bold text-[#2D2926] dark:text-[#E8E4DC]">
                        {attachedFile.name}
                      </span>
                      <span className="text-[9px] opacity-60">
                        ({(attachedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFile(null)}
                      className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                      title="Remove attached file"
                    >
                      <X className="w-3.5 h-3.5 text-[#C28B70]" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center space-x-2 p-3 bg-white dark:bg-[#1C1B18] hover:bg-[#D6CEC3]/20 rounded-2xl border border-dashed border-[#D6CEC3] dark:border-white/10 cursor-pointer transition-all">
                    <Paperclip className="w-4 h-4 text-[#5A5A40] dark:text-[#E8E4DC]" />
                    <span className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">
                      Attach Screenshot or Log
                    </span>
                    <input
                      type="file"
                      accept="image/*,.log,.txt,.json,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Action Buttons: Cancel and Send Feedback */}
              <div className="flex space-x-2 pt-2 border-t border-[#D6CEC3]/40 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false);
                    setAttachedFile(null);
                  }}
                  className="flex-1 py-3 text-xs font-bold bg-[#D6CEC3]/30 dark:bg-[#36332E] hover:bg-[#D6CEC3]/50 text-[#2D2926] dark:text-[#E8E4DC] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#4A4A34] rounded-full shadow-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Feedback</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Category Creation / Edit Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#F9F7F2] dark:bg-[#272521] w-full max-w-md rounded-[28px] p-5 border border-[#D6CEC3] dark:border-white/10 shadow-2xl space-y-4 text-[#2D2926] dark:text-[#E8E4DC] max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-[#5A5A40]/10 dark:bg-white/10 text-[#5A5A40] dark:text-[#E8E4DC]">
                  <FolderPlus className="w-4 h-4" />
                </div>
                <h3 className="font-serif-bento text-base font-bold">
                  {editingCategory ? 'Edit Category' : 'Create Custom Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="p-1 rounded-full text-[#2D2926]/40 dark:text-[#E8E4DC]/40 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pet Care, Subscriptions, Side Gig"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-[#1C1B18] text-xs font-semibold p-3 rounded-2xl border border-[#D6CEC3]/60 dark:border-white/10 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCatType('expense');
                      if (EXPENSE_COLOR_PALETTE.indexOf(catColor) === -1 && INCOME_COLOR_PALETTE.indexOf(catColor) !== -1) {
                        setCatColor(EXPENSE_COLOR_PALETTE[0]);
                        setCustomHexInput(EXPENSE_COLOR_PALETTE[0]);
                      }
                    }}
                    className={`py-2 rounded-full text-xs font-bold transition-all ${
                      catType === 'expense' ? 'bg-[#C28B70] text-white shadow-xs' : 'bg-[#D6CEC3]/30 dark:bg-[#36332E]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCatType('income');
                      if (INCOME_COLOR_PALETTE.indexOf(catColor) === -1 && EXPENSE_COLOR_PALETTE.indexOf(catColor) !== -1) {
                        setCatColor(INCOME_COLOR_PALETTE[0]);
                        setCustomHexInput(INCOME_COLOR_PALETTE[0]);
                      }
                    }}
                    className={`py-2 rounded-full text-xs font-bold transition-all ${
                      catType === 'income' ? 'bg-[#5A5A40] text-white shadow-xs' : 'bg-[#D6CEC3]/30 dark:bg-[#36332E]'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-70">
                  Distinct Category Color
                </label>
                
                {/* Palette Swatches */}
                <div className="flex flex-wrap gap-2 pt-0.5 mb-2.5">
                  {(catType === 'income' ? INCOME_COLOR_PALETTE : EXPENSE_COLOR_PALETTE).map((color) => {
                    const isSelected = catColor.toLowerCase() === color.toLowerCase();
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setCatColor(color);
                          setCustomHexInput(color);
                        }}
                        className={`w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                          isSelected ? 'scale-115 ring-2 ring-offset-2 ring-[#5A5A40] dark:ring-white dark:ring-offset-[#272521]' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Selector & HEX Input */}
                <div className="p-2.5 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/60 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#2D2926] dark:text-[#E8E4DC] flex items-center space-x-1.5">
                      <Pipette className="w-3.5 h-3.5 text-[#5A5A40] dark:text-[#E8E4DC]" />
                      <span>Custom Color Picker & HEX</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      <label 
                        className="relative w-7 h-7 rounded-full cursor-pointer overflow-hidden border border-black/10 dark:border-white/20 shadow-2xs block"
                        style={{ backgroundColor: catColor }}
                        title="Click to open color picker wheel"
                      >
                        <input
                          type="color"
                          value={catColor.startsWith('#') && catColor.length === 7 ? catColor : '#5A5A40'}
                          onChange={(e) => {
                            setCatColor(e.target.value);
                            setCustomHexInput(e.target.value);
                          }}
                          className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        />
                      </label>
                      <input
                        type="text"
                        value={customHexInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomHexInput(val);
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            setCatColor(val);
                          }
                        }}
                        placeholder="#5A5A40"
                        maxLength={7}
                        className="w-20 bg-[#F9F7F2] dark:bg-[#23211D] text-xs font-mono font-bold px-2 py-1 rounded-lg border border-[#D6CEC3]/60 dark:border-white/10 text-center uppercase focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Live Category Preview */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#D6CEC3]/30 dark:border-white/5">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Live Preview:</span>
                    <div
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition-all"
                      style={{ 
                        backgroundColor: `${catColor}15`, 
                        borderColor: `${catColor}40`,
                        color: catColor 
                      }}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
                      <span>{catName.trim() || 'Category Name'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center space-x-2 border-t border-[#D6CEC3]/40 dark:border-white/10">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(editingCategory.id, editingCategory.name)}
                    className="px-3.5 py-2.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-full flex items-center justify-center space-x-1 transition-colors cursor-pointer"
                    title={`Delete category ${editingCategory.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold bg-[#D6CEC3]/30 dark:bg-[#36332E] hover:bg-[#D6CEC3]/50 rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#4A4A34] rounded-full shadow-xs transition-colors cursor-pointer"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Help & Support Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-[#F9F7F2] dark:bg-[#272521] w-full max-w-md rounded-[28px] p-5 border border-[#D6CEC3] dark:border-white/10 shadow-2xl space-y-4 text-[#2D2926] dark:text-[#E8E4DC] max-h-[85vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 pb-3">
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-[#5A5A40] dark:text-[#E8E4DC]" />
                <h3 className="font-serif-bento text-base font-bold">Help & FAQs</h3>
              </div>
              <button onClick={() => setShowHelpModal(false)}>
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 space-y-1">
                <p className="font-bold text-[#5A5A40] dark:text-[#E8E4DC]">How is my financial data stored?</p>
                <p className="opacity-80 leading-relaxed text-[11px]">
                  All your transaction entries, budgets, and accounts are saved locally on your device in your browser's encrypted storage engine. No external server uploads occur.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 space-y-1">
                <p className="font-bold text-[#5A5A40] dark:text-[#E8E4DC]">How do I backup or export my data?</p>
                <p className="opacity-80 leading-relaxed text-[11px]">
                  Under Settings &gt; Backup &amp; Export, tap "Backup JSON" to save a full offline snapshot or "Export CSV" to open your spreadsheet.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-[#1C1B18] rounded-2xl border border-[#D6CEC3]/40 dark:border-white/5 space-y-1">
                <p className="font-bold text-[#5A5A40] dark:text-[#E8E4DC]">How do I enable Passcode or Theme?</p>
                <p className="opacity-80 leading-relaxed text-[11px]">
                  Under Settings &gt; App Theme, toggle Dark Mode for the #1C1B18 natural tone palette. Enable Passcode Lock to require a PIN on app launch.
                </p>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  onClick={() => {
                    setShowHelpModal(false);
                    setShowFeedbackModal(true);
                  }}
                  className="flex-1 py-2.5 bg-[#5A5A40] text-white font-bold rounded-full text-xs shadow-xs"
                >
                  Contact & Feedback
                </button>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="py-2.5 px-4 bg-[#D6CEC3]/30 dark:bg-[#36332E] font-bold rounded-full text-xs"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Passcode / PIN Setup Modal */}
      {showPasscodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#F9F7F2] dark:bg-[#272521] w-full max-w-sm rounded-[28px] p-6 border border-[#D6CEC3] dark:border-white/10 shadow-2xl space-y-4 text-[#2D2926] dark:text-[#E8E4DC]">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-5 h-5 text-[#5A5A40] dark:text-[#E8E4DC]" />
                <h3 className="font-serif-bento text-base font-bold">
                  {settings.passcode_pin ? 'Change Passcode PIN' : 'Create Passcode PIN'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setShowPasscodeModal(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>

            {passcodeError && (
              <div className="p-3 bg-[#C28B70]/15 border border-[#C28B70]/40 text-[#C28B70] text-xs font-bold rounded-xl">
                ⚠️ {passcodeError}
              </div>
            )}

            <form onSubmit={handleSavePasscode} className="space-y-3.5">
              {settings.passcode_pin && settings.passcode_enabled && (
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                      Current PIN
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowOldPinText(!showOldPinText)}
                      className="text-[#5A5A40] dark:text-[#F7DE98] p-0.5 hover:opacity-80 transition-opacity cursor-pointer flex items-center space-x-1"
                      title={showOldPinText ? "Hide current PIN" : "Show current PIN"}
                      aria-label={showOldPinText ? "Hide current PIN" : "Show current PIN"}
                    >
                      {showOldPinText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-semibold">{showOldPinText ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showOldPinText ? "text" : "password"}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="Enter current PIN"
                      value={oldPin}
                      onChange={(e) => setOldPin(e.target.value)}
                      required
                      className="w-full bg-white dark:bg-[#1C1B18] text-center text-base font-bold tracking-widest p-3 pr-10 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPinText(!showOldPinText)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#5A5A40]/70 dark:text-[#F7DE98]/70 hover:text-[#5A5A40] dark:hover:text-[#F7DE98] cursor-pointer"
                      title={showOldPinText ? "Hide current PIN" : "Show current PIN"}
                    >
                      {showOldPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                    New 4-Digit PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPinText(!showNewPinText)}
                    className="text-[#5A5A40] dark:text-[#F7DE98] p-0.5 hover:opacity-80 transition-opacity cursor-pointer flex items-center space-x-1"
                    title={showNewPinText ? "Hide new PIN" : "Show new PIN"}
                    aria-label={showNewPinText ? "Hide new PIN" : "Show new PIN"}
                  >
                    {showNewPinText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-semibold">{showNewPinText ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPinText ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Enter new 4-digit PIN"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-[#1C1B18] text-center text-base font-bold tracking-widest p-3 pr-10 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPinText(!showNewPinText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#5A5A40]/70 dark:text-[#F7DE98]/70 hover:text-[#5A5A40] dark:hover:text-[#F7DE98] cursor-pointer"
                    title={showNewPinText ? "Hide new PIN" : "Show new PIN"}
                  >
                    {showNewPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider opacity-70">
                    Confirm New PIN
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPinText(!showConfirmPinText)}
                    className="text-[#5A5A40] dark:text-[#F7DE98] p-0.5 hover:opacity-80 transition-opacity cursor-pointer flex items-center space-x-1"
                    title={showConfirmPinText ? "Hide confirm PIN" : "Show confirm PIN"}
                    aria-label={showConfirmPinText ? "Hide confirm PIN" : "Show confirm PIN"}
                  >
                    {showConfirmPinText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span className="text-[10px] font-semibold">{showConfirmPinText ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPinText ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="Re-enter new PIN"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-[#1C1B18] text-center text-base font-bold tracking-widest p-3 pr-10 rounded-2xl border border-[#D6CEC3]/60 dark:border-[rgba(212,175,55,0.25)] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPinText(!showConfirmPinText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[#5A5A40]/70 dark:text-[#F7DE98]/70 hover:text-[#5A5A40] dark:hover:text-[#F7DE98] cursor-pointer"
                    title={showConfirmPinText ? "Hide confirm PIN" : "Show confirm PIN"}
                  >
                    {showConfirmPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="flex-1 py-3 text-xs font-bold bg-[#D6CEC3]/30 dark:bg-[#36332E] rounded-full hover:bg-[#D6CEC3]/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#4A4A34] rounded-full shadow-xs transition-colors"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation & Selection Modal */}
      {showResetDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#F9F7F2] dark:bg-[#272521] w-full max-w-md rounded-[28px] p-6 border border-[#D6CEC3] dark:border-white/10 shadow-2xl space-y-4 text-[#2D2926] dark:text-[#E8E4DC]">
            <div className="flex justify-between items-center border-b border-[#D6CEC3]/40 dark:border-white/10 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#5A5A40]/10 dark:bg-[#5A5A40]/30 text-[#5A5A40] dark:text-[#E8E4DC]">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif-bento text-base font-bold">Reset Financial Data</h3>
                  <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 font-medium">
                    Choose how you want to reset your records
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowResetDataModal(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>

            <p className="text-xs text-[#2D2926]/75 dark:text-[#E8E4DC]/75 leading-relaxed">
              Select one of the reset options below. This will clear existing transaction logs, category budgets, and notes while keeping your profile settings intact.
            </p>

            {/* Option Radio Cards */}
            <div className="space-y-2.5">
              <div 
                onClick={() => setResetSelection('empty')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  resetSelection === 'empty'
                    ? 'border-[#5A5A40] bg-[#5A5A40]/5 dark:bg-[#5A5A40]/20 shadow-xs'
                    : 'border-[#D6CEC3]/60 dark:border-white/5 bg-white dark:bg-[#1C1B18]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${
                  resetSelection === 'empty' ? 'border-[#5A5A40] bg-[#5A5A40]' : 'border-[#D6CEC3]'
                }`}>
                  {resetSelection === 'empty' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Fresh Clean Slate (0 Balance)</h4>
                  <p className="text-[11px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 mt-0.5">
                    Wipes all transactions and budgets, leaving 1 default wallet with ₹0 / $0 to start fresh.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => setResetSelection('seed')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  resetSelection === 'seed'
                    ? 'border-[#5A5A40] bg-[#5A5A40]/5 dark:bg-[#5A5A40]/20 shadow-xs'
                    : 'border-[#D6CEC3]/60 dark:border-white/5 bg-white dark:bg-[#1C1B18]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${
                  resetSelection === 'seed' ? 'border-[#5A5A40] bg-[#5A5A40]' : 'border-[#D6CEC3]'
                }`}>
                  {resetSelection === 'seed' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-[#2D2926] dark:text-[#E8E4DC]">Restore Demo Seed Data</h4>
                  <p className="text-[11px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 mt-0.5">
                    Restores sample accounts (Cash, Bank, Card) and realistic sample transactions for demo exploration.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setShowResetDataModal(false)}
                className="flex-1 py-3 text-xs font-bold bg-[#D6CEC3]/30 dark:bg-[#36332E] rounded-full hover:bg-[#D6CEC3]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResetDatabase(resetSelection)}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#484833] rounded-full shadow-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Confirm Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-[#F9F7F2] dark:bg-[#272521] w-full max-w-md rounded-[28px] p-6 border border-[#C28B70]/40 shadow-2xl space-y-4 text-[#2D2926] dark:text-[#E8E4DC]">
            <div className="flex justify-between items-center border-b border-[#C28B70]/20 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-2xl bg-[#C28B70]/20 text-[#C28B70]">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif-bento text-base font-bold text-[#C28B70]">Delete User Account</h3>
                  <p className="text-[10px] text-[#2D2926]/60 dark:text-[#E8E4DC]/60 font-medium">
                    Irreversible action • Complete factory reset
                  </p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setShowDeleteAccountModal(false)}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5 opacity-60" />
              </button>
            </div>

            <div className="p-3.5 bg-[#C28B70]/10 border border-[#C28B70]/30 rounded-2xl space-y-2">
              <p className="text-xs font-bold text-[#C28B70] flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Warning: All stored data will be erased!</span>
              </p>
              <ul className="text-[11px] text-[#2D2926]/80 dark:text-[#E8E4DC]/80 space-y-1 list-disc list-inside">
                <li>Your profile name and email address</li>
                <li>Passcode PIN and biometric security settings</li>
                <li>All accounts, cards, and wallets</li>
                <li>All transaction histories, receipts, & notes</li>
                <li>Custom expense/income categories and budgets</li>
              </ul>
            </div>

            <p className="text-xs text-[#2D2926]/70 dark:text-[#E8E4DC]/70 leading-relaxed">
              Once deleted, this data cannot be recovered. The app will return to the original welcome setup screen.
            </p>

            <div className="pt-2 flex space-x-2">
              <button
                type="button"
                onClick={() => setShowDeleteAccountModal(false)}
                className="flex-1 py-3 text-xs font-bold bg-[#D6CEC3]/30 dark:bg-[#36332E] rounded-full hover:bg-[#D6CEC3]/50 transition-colors"
              >
                Keep Account
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 py-3 text-xs font-bold text-white bg-[#C28B70] hover:bg-[#b0785f] rounded-full shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Everything</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
