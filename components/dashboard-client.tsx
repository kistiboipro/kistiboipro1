'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/sidebar';
import { DateRangePicker } from '@/components/date-range-picker';
import { SummaryCards } from '@/components/summary-cards';
import { TransactionEmptyState } from '@/components/transaction-empty-state';
import { TransactionModal } from '@/components/transaction-modal';
import { AiAdvisor } from '@/components/ai-advisor';
import { CustomersView } from '@/components/customers-view';
import { SalesView } from '@/components/sales-view';
import { PaymentsView } from '@/components/payments-view';
import { DealerView } from '@/components/dealer-view';
import { PurchaseView } from '@/components/purchase-view';
import { PayoutView } from '@/components/payout-view';
import { DebtView } from '@/components/debt-view';
import { ExpensesView } from '@/components/expenses-view';
import { StockView } from '@/components/stock-view';
import { OutstandingView } from '@/components/outstanding-view';
import { AdminView } from '@/components/admin-view';
import { AnimatedLogin, UserSession } from '@/components/animated-login';
import { Plus, Bell, LogOut, Check, ShieldCheck } from 'lucide-react';
import { translations, Language } from '@/lib/i18n';
import { CustomerRecord } from '@/lib/customer-service';

const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: 1,
    name: 'Sabbir Bhuiyan',
    type: 'Cash-remaining',
    primaryMobile: '01712345678',
    address: 'Mirpur-10, Dhaka',
    status: 'Completed',
    avatarBg: 'bg-rose-500',
    createdAt: '2026-10-18',
    guarantors: [],
  },
  {
    id: 2,
    name: 'Rony',
    type: 'Installment',
    primaryMobile: '01812345678',
    address: 'Dhanmondi, Dhaka',
    status: 'No cell',
    avatarBg: 'bg-blue-600',
    createdAt: '2026-10-20',
    guarantors: [],
  },
];

interface TransactionRecord {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'sale' | 'collection' | 'downPayment' | 'expense' | 'retail' | 'purchase' | 'dealerPayment';
  amount: number;
  discount?: number;
  downPayment?: number;
  remainingDue?: number;
  customerOrDealer?: string;
  note?: string;
}

const initialTransactions: TransactionRecord[] = [
  // October 2026 data
  {
    id: 'tx-1',
    date: '2026-10-22',
    type: 'sale',
    amount: 25000,
    downPayment: 6000,
    discount: 500,
    remainingDue: 18500,
    customerOrDealer: 'Sabbir Bhuiyan',
    note: 'LED 32 inch TV'
  },
  {
    id: 'tx-2',
    date: '2026-10-22',
    type: 'collection',
    amount: 8500,
    customerOrDealer: 'Rony',
    note: 'Monthly installment'
  },
  {
    id: 'tx-3',
    date: '2026-10-22',
    type: 'retail',
    amount: 6000,
    customerOrDealer: 'Walk-in customer',
    note: 'Electric fan cash sale'
  },
  {
    id: 'tx-4',
    date: '2026-10-22',
    type: 'expense',
    amount: 1200,
    note: 'Shop transport'
  },
  {
    id: 'tx-5',
    date: '2026-10-18',
    type: 'sale',
    amount: 32000,
    downPayment: 10000,
    discount: 1000,
    remainingDue: 21000,
    customerOrDealer: 'Karim Ullah',
    note: 'Refrigerator 220L'
  },
  {
    id: 'tx-6',
    date: '2026-10-18',
    type: 'collection',
    amount: 15000,
    customerOrDealer: 'Jamal Hossain',
    note: '2nd installment'
  },
  {
    id: 'tx-7',
    date: '2026-10-18',
    type: 'purchase',
    amount: 65000,
    customerOrDealer: 'Walton Dealer',
    note: 'Stock batch 104'
  },
  {
    id: 'tx-8',
    date: '2026-10-18',
    type: 'dealerPayment',
    amount: 50000,
    customerOrDealer: 'Walton Dealer'
  },
  {
    id: 'tx-9',
    date: '2026-10-15',
    type: 'expense',
    amount: 3500,
    note: 'Electricity bill October'
  },
  {
    id: 'tx-10',
    date: '2026-10-10',
    type: 'retail',
    amount: 12000,
    customerOrDealer: 'Retail buyers',
    note: 'Cash sales'
  },
  {
    id: 'tx-11',
    date: '2026-10-05',
    type: 'collection',
    amount: 14500,
    customerOrDealer: 'Various customers'
  },
  {
    id: 'tx-12',
    date: '2026-10-01',
    type: 'expense',
    amount: 15000,
    note: 'Shop rent October'
  },
  {
    id: 'tx-13',
    date: '2026-10-01',
    type: 'purchase',
    amount: 55000,
    customerOrDealer: 'Minister Hi-Tech',
    note: 'Ovens and blenders'
  },
  {
    id: 'tx-14',
    date: '2026-10-01',
    type: 'dealerPayment',
    amount: 45000,
    customerOrDealer: 'Minister Hi-Tech'
  }
  // Note: 2026-09-22 has 0 transactions by design to match user reference image!
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [startDate, setStartDate] = useState('2026-09-22');
  const [endDate, setEndDate] = useState('2026-10-22');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTransactions);
  const [customers, setCustomers] = useState<CustomerRecord[]>(INITIAL_CUSTOMERS);
  const [selectedCustomerIdForSale, setSelectedCustomerIdForSale] = useState<string | number | null>(null);

  // Authentication State - identical initial state on server and client to prevent hydration mismatch
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  React.useEffect(() => {
    // Asynchronously restore session after hydration completes
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem('kistiboi_auth');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.isAuthenticated && parsed.user) {
            setIsAuthenticated(true);
            setCurrentUser(parsed.user);
          }
        }
      } catch {}
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [settingsSavedToast, setSettingsSavedToast] = useState<boolean>(false);

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kistiboi_auth');
      } catch {}
    }
    setIsAuthenticated(false);
  };

  const handleTabChange = (tab: string, customerId?: string | number | null) => {
    setTimeout(() => {
      setActiveTab(tab);
      if (customerId) {
        setSelectedCustomerIdForSale(customerId);
      } else {
        setSelectedCustomerIdForSale(null);
      }
    }, 0);
  };

  const t = translations[language];

  // Dynamically compute financial totals based on selected date range [startDate, endDate]
  const { financialData, hasData } = useMemo(() => {
    const filtered = transactions.filter(t => t.date >= startDate && t.date <= endDate);

    if (filtered.length === 0) {
      return {
        hasData: false,
        financialData: {
          totalSales: 0,
          totalCollection: 0,
          downPayment: 0,
          totalDue: 0,
          totalExpenses: 0,
          netProfit: 0,
          cashSales: 0,
          totalDiscount: 0,
          totalPurchase: 0,
          totalPaid: 0,
          totalPayable: 0,
          cashInHand: 0,
        }
      };
    }

    let totalSales = 0;
    let totalCollection = 0;
    let downPayment = 0;
    let totalDue = 0;
    let totalExpenses = 0;
    let cashSales = 0;
    let totalDiscount = 0;
    let totalPurchase = 0;
    let totalPaid = 0;

    filtered.forEach(tx => {
      if (tx.type === 'sale') {
        totalSales += tx.amount;
        if (tx.downPayment) downPayment += tx.downPayment;
        if (tx.discount) totalDiscount += tx.discount;
        if (tx.remainingDue) totalDue += tx.remainingDue;
      } else if (tx.type === 'collection') {
        totalCollection += tx.amount;
      } else if (tx.type === 'retail') {
        cashSales += tx.amount;
        totalSales += tx.amount;
      } else if (tx.type === 'downPayment') {
        downPayment += tx.amount;
        totalCollection += tx.amount;
      } else if (tx.type === 'expense') {
        totalExpenses += tx.amount;
      } else if (tx.type === 'purchase') {
        totalPurchase += tx.amount;
      } else if (tx.type === 'dealerPayment') {
        totalPaid += tx.amount;
      }
    });

    const totalPayable = Math.max(0, totalPurchase - totalPaid);
    const netProfit = Math.max(0, (totalSales - totalPurchase) - totalExpenses);
    const cashInHand = Math.max(0, (totalCollection + downPayment + cashSales) - totalExpenses - totalPaid);

    return {
      hasData: true,
      financialData: {
        totalSales,
        totalCollection,
        downPayment,
        totalDue,
        totalExpenses,
        netProfit,
        cashSales,
        totalDiscount,
        totalPurchase,
        totalPaid,
        totalPayable,
        cashInHand,
      }
    };
  }, [transactions, startDate, endDate]);

  const handleApplyDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleLoadDemoData = () => {
    setTransactions(initialTransactions);
    setStartDate('2026-10-01');
    setEndDate('2026-10-31');
  };

  const handleAddTransaction = (tx: {
    type: 'sales' | 'collection' | 'downPayment' | 'expense';
    amount: number;
    customerName: string;
    note: string;
  }) => {
    const today = '2026-10-22';
    const newRecord: TransactionRecord = {
      id: `tx-${Date.now()}`,
      date: today,
      type: tx.type === 'sales' ? 'sale' : tx.type,
      amount: tx.amount,
      customerOrDealer: tx.customerName,
      note: tx.note,
      downPayment: tx.type === 'downPayment' ? tx.amount : 0,
      remainingDue: tx.type === 'sales' ? tx.amount * 0.7 : 0
    };
    setTransactions(prev => [newRecord, ...prev]);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return t.dashboard;
      case 'admin': return (t as any).adminPanel || 'Admin Panel';
      case 'installments': return t.installments;
      case 'collections': return t.collections;
      case 'customers': return t.customers;
      case 'dealer': return t.dealer;
      case 'purchase': return t.purchase;
      case 'payout': return t.payout;
      case 'debt': return t.debt;
      case 'stock': return t.stock;
      case 'expenses': return t.expenses;
      case 'ai-advisor': return t.aiAdvisor;
      case 'settings': return t.settings;
      default: return t.dashboard;
    }
  };

  // When not authenticated, show the Animated Login Page
  if (!isAuthenticated) {
    return (
      <AnimatedLogin
        onLoginSuccess={handleLoginSuccess}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
      />
    );
  }

  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        onSignOut={handleSignOut}
        currentUser={currentUser || undefined}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Dashboard Content Container */}
        <div className="p-6 space-y-4 max-w-7xl mx-auto w-full">
          {/* Dashboard Header Bar & Date Range Picker */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className={`px-6 py-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {language === 'bn' ? 'ড্যাশবোর্ড' : 'Dashboard'}
                  </h1>
                  {currentUser && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {currentUser.name}
                    </span>
                  )}
                  {currentUser?.isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleTabChange('admin')}
                      className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
                    </button>
                  )}
                </div>

                {/* Right controls: Date Picker and Quick Logout */}
                <div className="flex items-center justify-end gap-3">
                  <DateRangePicker 
                    startDate={startDate} 
                    endDate={endDate} 
                    onApply={handleApplyDateRange} 
                    darkMode={darkMode} 
                    language={language}
                    align="right"
                  />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    title={language === 'bn' ? 'লগআউট করুন' : 'Sign Out'}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Tab Views */}
          {/* Admin View (RBAC Protected: Only Admin) */}
          {activeTab === 'admin' && (
            <AdminView
              currentUser={currentUser}
              darkMode={darkMode}
              language={language}
              onNavigateTab={handleTabChange}
            />
          )}

          {/* Group 1 */}
          {activeTab === 'dashboard' && (
            <SummaryCards 
              data={financialData} 
              darkMode={darkMode} 
              language={language} 
              hasData={hasData} 
              transactions={transactions}
              startDate={startDate}
              endDate={endDate}
              onApplyDateRange={handleApplyDateRange}
            />
          )}
          {activeTab === 'stock' && <StockView darkMode={darkMode} language={language} />}
          {activeTab === 'expenses' && <ExpensesView darkMode={darkMode} language={language} />}

          {/* Group 2 */}
          {activeTab === 'customers' && <CustomersView darkMode={darkMode} language={language} customers={customers} onUpdateCustomers={setCustomers} onTabChange={handleTabChange} />}
          {activeTab === 'installments' && <SalesView darkMode={darkMode} language={language} customers={customers} initialCustomerId={selectedCustomerIdForSale} />}
          {activeTab === 'collections' && <PaymentsView darkMode={darkMode} language={language} />}
          {activeTab === 'outstanding' && <OutstandingView darkMode={darkMode} language={language} />}

          {/* Group 3 */}
          {activeTab === 'dealer' && <DealerView darkMode={darkMode} language={language} />}
          {activeTab === 'purchase' && <PurchaseView darkMode={darkMode} language={language} />}
          {activeTab === 'payout' && <PayoutView darkMode={darkMode} language={language} />}
          {activeTab === 'debt' && <DebtView darkMode={darkMode} language={language} />}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className={`p-8 rounded-3xl border space-y-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <h2 className="text-xl font-bold">{language === 'bn' ? 'দোকানের সেটিংস (Store Settings)' : 'Store Settings'}</h2>
              <div className="space-y-4 max-w-xl text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'bn' ? 'দোকানের নাম' : 'Store Name'}</label>
                  <input type="text" defaultValue="বিসমিল্লাহ ইলেকট্রনিক্স অ্যান্ড ফার্নিচার" className="w-full px-4 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'bn' ? 'প্রোপ্রাইটর / মালিকের নাম' : 'Proprietor / Owner Name'}</label>
                  <input type="text" defaultValue="মোঃ রহিম মিয়া" className="w-full px-4 py-2 rounded-xl border" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</label>
                  <input type="text" defaultValue="০১৮১২-৩৪৫৬৭৮" className="w-full px-4 py-2 rounded-xl border" />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => {
                      setSettingsSavedToast(true);
                      setTimeout(() => setSettingsSavedToast(false), 3000);
                    }} 
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}
                  </button>
                  {settingsSavedToast && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 animate-fadeIn">
                      <Check className="w-4 h-4" />
                      {language === 'bn' ? 'সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Settings successfully saved!'}
                    </span>
                  )}
                </div>
              </div>

              {/* Admin Panel & Login Audit System (Visible ONLY to Admin inside Settings) */}
              {currentUser?.isAdmin && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 max-w-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {language === 'bn' ? 'অ্যাডমিন প্যানেল ও লগইন অডিট সিস্টেম' : 'Admin Panel & Login Audit System'}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {language === 'bn' 
                          ? 'দোকানের অ্যাপে কে কে লগইন করেছে, তাদের রোল, ডিভাইস এবং লাইভ সেশন অডিট পরিচালনা করুন।' 
                          : 'Review who logged into the store app, their assigned roles, devices, and session logs.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('admin')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs shadow-md hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'bn' ? 'অ্যাডমিন প্যানেল খুলুন' : 'Open Admin Panel'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Add Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTransaction={handleAddTransaction}
        darkMode={darkMode}
      />
    </div>
  );
}
