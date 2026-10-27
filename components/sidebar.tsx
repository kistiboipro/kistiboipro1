'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Wallet, 
  Users, 
  ShoppingCart,
  CreditCard,
  Clock,
  Package,
  TrendingUp, 
  Sparkles, 
  Settings, 
  LogOut, 
  Phone,
  MapPin, 
  ShieldCheck,
  Moon,
  Sun,
  Languages,
  UserPlus,
  Handshake,
  ClipboardList,
  Banknote
} from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { SupabaseStatusBadge } from '@/components/supabase-status-badge';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onSignOut?: () => void;
  currentUser?: {
    name: string;
    role: string;
    roleKey?: 'admin' | 'manager' | 'cashier';
    isAdmin?: boolean;
    phone?: string;
    avatarBg?: string;
  };
}

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  language, 
  setLanguage,
  onSignOut,
  currentUser
}: SidebarProps) {
  const t = translations[language];
  const isAdmin = currentUser?.isAdmin ?? (currentUser?.roleKey === 'admin');

  const navGroups = [
    {
      items: [
        { id: 'dashboard', label: (t as any).dashboard, icon: LayoutDashboard },
        { id: 'stock', label: (t as any).stock, icon: ClipboardList },
        { id: 'expenses', label: (t as any).expenses, icon: Banknote },
        { id: 'settings', label: (t as any).settings, icon: Settings },
      ]
    },
    {
      items: [
        { id: 'customers', label: (t as any).customers, icon: UserPlus },
        { id: 'installments', label: (t as any).installments, icon: ShoppingCart },
        { id: 'collections', label: (t as any).collections, icon: Wallet },
        { id: 'outstanding', label: (t as any).outstanding, icon: Clock },
      ]
    },
    {
      items: [
        { id: 'dealer', label: (t as any).dealer, icon: Handshake },
        { id: 'purchase', label: (t as any).purchase, icon: ShoppingCart },
        { id: 'payout', label: (t as any).payout, icon: Wallet },
        { id: 'debt', label: (t as any).debt, icon: Clock },
      ]
    }
  ];

  return (
    <aside className={`w-72 shrink-0 flex flex-col border-r h-screen sticky top-0 transition-colors duration-200 ${
      darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Brand Header */}
      <div className="p-5 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 text-xl">
            {language === 'bn' ? 'ক' : 'KB'}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight flex items-center gap-1.5">
              {language === 'bn' ? 'কিস্তিভাই' : 'KistiBoi'} <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 px-1.5 py-0.5 rounded font-medium">Pro</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.appSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="p-4 mx-3 my-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {t.storeName}
            </p>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {language === 'bn' ? '০১৮১২-৩৪৫৬৭৮' : '01812-345678'}
            </p>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {language === 'bn' ? 'নিউ মার্কেট রোড, ঢাকা' : 'New Market Road, Dhaka'}
            </p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="px-4 py-2.5 mx-3 mb-3 flex items-center gap-3 border-y border-slate-100 dark:border-slate-800">
        <div className={`w-9 h-9 rounded-full ${currentUser?.avatarBg || 'bg-gradient-to-tr from-blue-600 to-indigo-600'} text-white flex items-center justify-center font-semibold text-sm`}>
          {currentUser ? currentUser.name.charAt(0) : (language === 'bn' ? 'র' : 'R')}
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-sm font-semibold truncate">
            {currentUser?.name || (language === 'bn' ? 'মোঃ রহিম মিয়া' : 'Md. Rahim Mia')}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
            <span className="truncate">{currentUser?.role || t.admin}</span>
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-1">
        {navGroups.map((group, groupIdx) => (
          <div key={`nav-group-${groupIdx}`} className="space-y-1">
            {groupIdx > 0 && <div className="border-t border-slate-100 dark:border-slate-800 my-4 mx-2" />}
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {(item as any).badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      {(item as any).badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer controls */}
      <div className="p-4 border-t border-inherit space-y-2">
        {/* Supabase Connection Status Badge */}
        <div className="pb-1">
          <SupabaseStatusBadge className="w-full justify-center" />
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-blue-600" />
            Language
          </span>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
            {language === 'bn' ? 'English' : 'বাংলা'}
          </span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            {darkMode ? t.lightMode : t.darkMode}
          </span>
          <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono">
            {darkMode ? 'Dark' : 'Light'}
          </span>
        </button>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => {
            if (onSignOut) {
              onSignOut();
            }
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t.signOut}</span>
        </button>
      </div>
    </aside>
  );
}
